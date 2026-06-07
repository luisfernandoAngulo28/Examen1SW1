import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/models.dart';
import '../providers/auth_provider.dart';
import '../providers/cases_provider.dart';
import 'case_tracking_detail_screen.dart';
import 'login_screen.dart';
import 'nuevo_tramite_screen.dart';

/// Home screen for CLIENT users — shows the list of their trámites.
class TrackingScreen extends StatefulWidget {
  const TrackingScreen({super.key});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CasesProvider>().loadMyCases();
    });
  }

  Future<void> _logout() async {
    await context.read<AuthProvider>().logout();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<CasesProvider>();

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Mis Trámites', style: TextStyle(fontWeight: FontWeight.bold)),
            if (auth.user != null)
              Text(
                auth.user!.name,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualizar',
            onPressed: () => provider.loadMyCases(),
          ),
          PopupMenuButton<String>(
            onSelected: (v) { if (v == 'logout') _logout(); },
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'logout', child: Row(children: [
                Icon(Icons.logout, size: 18), SizedBox(width: 8), Text('Cerrar sesión'),
              ])),
            ],
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const NuevoTramiteScreen()),
        ),
        icon: const Icon(Icons.mic_rounded),
        label: const Text('Nuevo trámite'),
      ),
      body: RefreshIndicator(
        onRefresh: provider.loadMyCases,
        child: _buildBody(provider),
      ),
    );
  }

  Widget _buildBody(CasesProvider provider) {
    if (provider.loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (provider.error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 12),
            Text(provider.error!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () => context.read<CasesProvider>().loadMyCases(),
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
            ),
          ]),
        ),
      );
    }
    if (provider.cases.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 120),
          Center(
            child: Column(children: [
              Icon(Icons.inbox_outlined, size: 72, color: Colors.grey),
              SizedBox(height: 16),
              Text('No tienes trámites iniciados',
                  style: TextStyle(fontSize: 16, color: Colors.grey)),
              SizedBox(height: 8),
              Text('Cuando inicies un trámite aparecerá aquí',
                  style: TextStyle(fontSize: 13, color: Colors.grey)),
            ]),
          ),
        ],
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: provider.cases.length,
      itemBuilder: (ctx, i) => _CaseCard(caseItem: provider.cases[i]),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────

class _CaseCard extends StatelessWidget {
  final Case caseItem;
  const _CaseCard({required this.caseItem});

  @override
  Widget build(BuildContext context) {
    final cs = caseItem;
    final colorScheme = Theme.of(context).colorScheme;
    final statusColor = _statusColor(cs.status, colorScheme);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => CaseTrackingDetailScreen(caseId: cs.id),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Header row
            Row(children: [
              Expanded(
                child: Text(cs.policyName,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ),
              _StatusBadge(status: cs.status, color: statusColor),
            ]),
            const SizedBox(height: 8),

            // Progress bar
            _ProgressBar(done: cs.completedTaskCount, total: cs.totalTaskCount),
            const SizedBox(height: 10),

            // Current location
            if (cs.status == 'IN_PROGRESS' || cs.status == 'OPEN') ...[
              _InfoRow(
                icon: Icons.apartment_rounded,
                label: 'Departamento',
                value: cs.currentDepartment ?? 'Sin asignar',
              ),
              const SizedBox(height: 4),
              _InfoRow(
                icon: Icons.person_outline,
                label: 'Funcionario',
                value: cs.currentOfficer ?? 'Sin asignar',
              ),
            ] else if (cs.status == 'COMPLETED') ...[
              _InfoRow(
                icon: Icons.check_circle_outline,
                label: 'Finalizado el',
                value: cs.finishedAt != null ? _formatDate(cs.finishedAt!) : '—',
              ),
            ],

            const SizedBox(height: 6),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(
                'ID: ${cs.id.length > 8 ? cs.id.substring(0, 8) : cs.id}…',
                style: const TextStyle(fontSize: 11, color: Colors.grey),
              ),
              if (cs.createdAt != null)
                Text(
                  'Iniciado: ${_formatDate(cs.createdAt!)}',
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
            ]),
          ]),
        ),
      ),
    );
  }

  Color _statusColor(String status, ColorScheme cs) => switch (status) {
        'COMPLETED' => Colors.green,
        'CANCELLED' => Colors.red,
        _ => cs.primary,
      };

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

class _StatusBadge extends StatelessWidget {
  final String status;
  final Color color;
  const _StatusBadge({required this.status, required this.color});

  String get _label => switch (status) {
        'IN_PROGRESS' => 'En proceso',
        'OPEN' => 'En proceso',
        'COMPLETED' => 'Completado',
        'CANCELLED' => 'Cancelado',
        _ => status,
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withAlpha(30),
        border: Border.all(color: color.withAlpha(100)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(_label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold)),
    );
  }
}

class _ProgressBar extends StatelessWidget {
  final int done;
  final int total;
  const _ProgressBar({required this.done, required this.total});

  @override
  Widget build(BuildContext context) {
    final pct = total > 0 ? done / total : 0.0;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text('Avance', style: const TextStyle(fontSize: 11, color: Colors.grey)),
        Text('$done / $total pasos', style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ]),
      const SizedBox(height: 4),
      ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: LinearProgressIndicator(
          value: pct,
          minHeight: 6,
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        ),
      ),
    ]);
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 14, color: Colors.grey),
      const SizedBox(width: 4),
      Text('$label: ', style: const TextStyle(fontSize: 12, color: Colors.grey)),
      Expanded(
        child: Text(value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            overflow: TextOverflow.ellipsis),
      ),
    ]);
  }
}
