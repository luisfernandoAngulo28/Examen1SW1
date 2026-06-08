import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/policy_provider.dart';
import '../providers/auth_provider.dart';
import '../models/policy_models.dart';
import 'policy_editor_screen.dart';
import 'login_screen.dart';

class PolicyListScreen extends StatefulWidget {
  const PolicyListScreen({super.key});

  @override
  State<PolicyListScreen> createState() => _PolicyListScreenState();
}

class _PolicyListScreenState extends State<PolicyListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PolicyProvider>().loadPolicies();
      context.read<PolicyProvider>().loadDepartments();
    });
  }

  Future<void> _createPolicy() async {
    final nameCtrl = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nueva política'),
        content: TextField(
          controller: nameCtrl,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Nombre de la política',
            border: OutlineInputBorder(),
          ),
          textCapitalization: TextCapitalization.sentences,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Crear'),
          ),
        ],
      ),
    );
    if (confirmed == true && nameCtrl.text.trim().isNotEmpty && mounted) {
      final provider = context.read<PolicyProvider>();
      final policy = await provider.createPolicy(nameCtrl.text.trim());
      if (policy != null && mounted) {
        _openEditor(policy);
      }
    }
  }

  void _openEditor(PolicyModel policy) {
    final provider = context.read<PolicyProvider>();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PolicyEditorScreen(policy: policy),
      ),
    ).then((_) => provider.loadPolicies());
  }

  Future<void> _deletePolicy(PolicyModel policy) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar política'),
        content: Text('¿Eliminar "${policy.name}"? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await context.read<PolicyProvider>().deletePolicy(policy.id);
    }
  }

  void _logout() async {
    await context.read<AuthProvider>().logout();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PolicyProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Políticas de workflow'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: _logout,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createPolicy,
        icon: const Icon(Icons.add),
        label: const Text('Nueva política'),
      ),
      body: RefreshIndicator(
        onRefresh: provider.loadPolicies,
        child: _buildBody(provider),
      ),
    );
  }

  Widget _buildBody(PolicyProvider provider) {
    if (provider.loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (provider.error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 12),
            Text(provider.error!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: provider.loadPolicies,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }
    if (provider.policies.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.account_tree_outlined, size: 64, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            Text(
              'No hay políticas aún',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.grey),
            ),
            const SizedBox(height: 8),
            const Text('Presiona + para crear una nueva política'),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
      itemCount: provider.policies.length,
      itemBuilder: (_, i) => _PolicyCard(
        policy: provider.policies[i],
        onTap: () => _openEditor(provider.policies[i]),
        onDelete: () => _deletePolicy(provider.policies[i]),
      ),
    );
  }
}

class _PolicyCard extends StatelessWidget {
  final PolicyModel policy;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _PolicyCard({
    required this.policy,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final nodeCount = policy.nodes.length;
    final edgeCount = policy.edges.length;
    final isActive = policy.status == 'ACTIVE';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: isActive
                      ? Theme.of(context).colorScheme.primaryContainer
                      : Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.account_tree_rounded,
                  color: isActive
                      ? Theme.of(context).colorScheme.primary
                      : Colors.grey,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      policy.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _Chip(icon: Icons.circle, label: '$nodeCount nodos', color: Colors.blue),
                        const SizedBox(width: 6),
                        _Chip(icon: Icons.arrow_forward, label: '$edgeCount conexiones', color: Colors.purple),
                        const SizedBox(width: 6),
                        _Chip(
                          icon: isActive ? Icons.check_circle : Icons.pause_circle,
                          label: policy.status,
                          color: isActive ? Colors.green : Colors.orange,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                onPressed: onDelete,
                tooltip: 'Eliminar',
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _Chip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color),
          const SizedBox(width: 3),
          Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
