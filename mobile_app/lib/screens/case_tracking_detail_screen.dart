import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'package:provider/provider.dart';

/// Shows the full tracking timeline of a single case for the CLIENT.
class CaseTrackingDetailScreen extends StatefulWidget {
  final String caseId;
  const CaseTrackingDetailScreen({super.key, required this.caseId});

  @override
  State<CaseTrackingDetailScreen> createState() =>
      _CaseTrackingDetailScreenState();
}

class _CaseTrackingDetailScreenState
    extends State<CaseTrackingDetailScreen> {
  Case? _case;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final c = await context.read<ApiService>().getCaseById(widget.caseId);
      setState(() => _case = c);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Error al cargar el trámite');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _case?.policyName ?? 'Seguimiento',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      body: () {
        if (_loading) return const Center(child: CircularProgressIndicator());
        if (_error != null) {
          return Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              Text(_error!),
              const SizedBox(height: 16),
              FilledButton(onPressed: _load, child: const Text('Reintentar')),
            ]),
          );
        }
        return _buildContent(_case!);
      }(),
    );
  }

  Widget _buildContent(Case c) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _CaseHeader(caseItem: c)),
        if (c.status == 'IN_PROGRESS' || c.status == 'OPEN')
          SliverToBoxAdapter(child: _CurrentStepBanner(caseItem: c)),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (_, i) => _TimelineStep(
                task: c.tasks[i],
                isLast: i == c.tasks.length - 1,
                index: i,
              ),
              childCount: c.tasks.length,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _CaseHeader extends StatelessWidget {
  final Case caseItem;
  const _CaseHeader({required this.caseItem});

  @override
  Widget build(BuildContext context) {
    final c = caseItem;
    final color = _statusColor(c.status, Theme.of(context).colorScheme);
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        border: Border.all(color: color.withAlpha(80)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(_statusIcon(c.status), color: color, size: 20),
          const SizedBox(width: 8),
          Text(_statusLabel(c.status),
              style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
          const Spacer(),
          if (c.createdAt != null)
            Text(_formatDate(c.createdAt!),
                style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ]),
        const SizedBox(height: 12),
        // Progress
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('${c.completedTaskCount} de ${c.totalTaskCount} pasos completados',
              style: const TextStyle(fontSize: 13)),
        ]),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: c.totalTaskCount > 0
                ? c.completedTaskCount / c.totalTaskCount
                : 0,
            minHeight: 8,
            color: color,
            backgroundColor: color.withAlpha(40),
          ),
        ),
      ]),
    );
  }

  Color _statusColor(String s, ColorScheme cs) => switch (s) {
        'COMPLETED' => Colors.green,
        'CANCELLED' => Colors.red,
        _ => cs.primary,
      };

  IconData _statusIcon(String s) => switch (s) {
        'COMPLETED' => Icons.check_circle_rounded,
        'CANCELLED' => Icons.cancel_rounded,
        _ => Icons.hourglass_top_rounded,
      };

  String _statusLabel(String s) => switch (s) {
        'COMPLETED' => 'Trámite completado',
        'CANCELLED' => 'Trámite cancelado',
        _ => 'En proceso',
      };

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

// ── Current step banner ───────────────────────────────────────────────────────

class _CurrentStepBanner extends StatelessWidget {
  final Case caseItem;
  const _CurrentStepBanner({required this.caseItem});

  @override
  Widget build(BuildContext context) {
    final c = caseItem;
    final dept = c.currentDepartment;
    final officer = c.currentOfficer;
    final step = c.currentTask?.title;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(Icons.location_on_rounded,
              color: Theme.of(context).colorScheme.primary, size: 18),
          const SizedBox(width: 6),
          Text('Ubicación actual del trámite',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: Theme.of(context).colorScheme.onPrimaryContainer)),
        ]),
        const SizedBox(height: 10),
        _BannerRow(icon: Icons.apartment_rounded, label: 'Departamento', value: dept ?? 'Sin asignar'),
        const SizedBox(height: 4),
        _BannerRow(icon: Icons.person_rounded, label: 'Funcionario', value: officer ?? 'Sin asignar'),
        if (step != null) ...[
          const SizedBox(height: 4),
          _BannerRow(icon: Icons.task_alt_rounded, label: 'Paso', value: step),
        ],
      ]),
    );
  }
}

class _BannerRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _BannerRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 15, color: Theme.of(context).colorScheme.primary),
      const SizedBox(width: 6),
      Text('$label: ', style: const TextStyle(fontSize: 12)),
      Expanded(
        child: Text(value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            overflow: TextOverflow.ellipsis),
      ),
    ]);
  }
}

// ── Timeline step ─────────────────────────────────────────────────────────────

class _TimelineStep extends StatelessWidget {
  final Task task;
  final bool isLast;
  final int index;

  const _TimelineStep({required this.task, required this.isLast, required this.index});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDone = task.status == 'DONE';
    final isPending = task.status == 'PENDING';
    final isActive = task.status == 'IN_PROGRESS';

    Color dotColor;
    IconData dotIcon;
    if (isDone) {
      dotColor = Colors.green;
      dotIcon = Icons.check_rounded;
    } else if (isActive) {
      dotColor = cs.primary;
      dotIcon = Icons.play_arrow_rounded;
    } else {
      dotColor = Colors.grey.shade400;
      dotIcon = Icons.circle_outlined;
    }

    return IntrinsicHeight(
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Timeline column
        Column(children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: dotColor.withAlpha(isDone ? 200 : 40),
              border: Border.all(color: dotColor, width: isDone || isActive ? 2 : 1),
              shape: BoxShape.circle,
            ),
            child: Icon(dotIcon, size: 16, color: dotColor),
          ),
          if (!isLast)
            Expanded(
              child: Container(
                width: 2,
                color: isDone ? Colors.green.withAlpha(100) : Colors.grey.shade200,
              ),
            ),
        ]),
        const SizedBox(width: 12),
        // Content
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: isLast ? 0 : 16, top: 4),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(
                  child: Text(
                    task.title ?? 'Paso ${index + 1}',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: isPending && !isActive ? Colors.grey : null,
                    ),
                  ),
                ),
                _StepStatusChip(status: task.status),
              ]),
              const SizedBox(height: 4),
              if (task.department != null)
                _DetailChip(icon: Icons.apartment_outlined, text: task.department!),
              if (task.assignedUserName != null)
                _DetailChip(icon: Icons.person_outline, text: task.assignedUserName!),
              if (isDone && task.finishedAt != null)
                _DetailChip(
                  icon: Icons.calendar_today_outlined,
                  text: _formatDate(task.finishedAt!),
                ),
            ]),
          ),
        ),
      ]),
    );
  }

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}  ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

class _StepStatusChip extends StatelessWidget {
  final String status;
  const _StepStatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      'DONE' => ('Completado', Colors.green),
      'IN_PROGRESS' => ('En proceso', Theme.of(context).colorScheme.primary),
      _ => ('Pendiente', Colors.grey),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.bold)),
    );
  }
}

class _DetailChip extends StatelessWidget {
  final IconData icon;
  final String text;
  const _DetailChip({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 3),
      child: Row(children: [
        Icon(icon, size: 12, color: Colors.grey),
        const SizedBox(width: 4),
        Expanded(
          child: Text(text,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
              overflow: TextOverflow.ellipsis),
        ),
      ]),
    );
  }
}
