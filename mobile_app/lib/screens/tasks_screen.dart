import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/tasks_provider.dart';
import '../models/models.dart';
import 'case_detail_screen.dart';
import 'login_screen.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  @override
  void initState() {
    super.initState();
    // Load tasks on first render
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TasksProvider>().loadMyTasks();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final tasksProvider = context.watch<TasksProvider>();
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Mis Tareas'),
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
            onPressed: () => tasksProvider.loadMyTasks(),
          ),
          PopupMenuButton(
            icon: const Icon(Icons.more_vert),
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'logout', child: Text('Cerrar sesión')),
            ],
            onSelected: (value) async {
              if (value == 'logout') {
                await auth.logout();
                if (mounted) {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                }
              }
            },
          ),
        ],
      ),
      body: _buildBody(tasksProvider, colors),
    );
  }

  Widget _buildBody(TasksProvider provider, ColorScheme colors) {
    if (provider.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: colors.error),
              const SizedBox(height: 16),
              Text(provider.error!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () => provider.loadMyTasks(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (provider.tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_outline, size: 64, color: colors.primary),
            const SizedBox(height: 16),
            const Text('¡Sin tareas pendientes!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Todas tus tareas están al día.',
              style: TextStyle(color: colors.onSurface.withOpacity(0.6)),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadMyTasks(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.tasks.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) => _TaskCard(task: provider.tasks[i]),
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  final MyTaskDto task;
  const _TaskCard({required this.task});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final isInProgress = task.status == 'IN_PROGRESS';

    return Card(
      elevation: 2,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor:
              isInProgress ? colors.primaryContainer : colors.secondaryContainer,
          child: Icon(
            isInProgress ? Icons.play_arrow : Icons.pending_outlined,
            color: isInProgress
                ? colors.onPrimaryContainer
                : colors.onSecondaryContainer,
          ),
        ),
        title: Text(
          task.taskTitle,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(task.policyName,
                style: TextStyle(
                    color: colors.onSurface.withOpacity(0.7), fontSize: 12)),
            if (task.department != null)
              Text('Dept: ${task.department}',
                  style: TextStyle(
                      color: colors.onSurface.withOpacity(0.5), fontSize: 11)),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: isInProgress
                ? colors.primaryContainer
                : colors.secondaryContainer,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            isInProgress ? 'En curso' : 'Pendiente',
            style: TextStyle(
              fontSize: 11,
              color: isInProgress
                  ? colors.onPrimaryContainer
                  : colors.onSecondaryContainer,
            ),
          ),
        ),
        onTap: () {
          Navigator.of(context).push(MaterialPageRoute(
            builder: (_) => CaseDetailScreen(
              caseId: task.caseId,
              initialTaskId: task.taskId,
            ),
          ));
        },
      ),
    );
  }
}
