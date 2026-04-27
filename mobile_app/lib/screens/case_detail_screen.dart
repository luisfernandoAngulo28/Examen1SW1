import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../providers/tasks_provider.dart';

class CaseDetailScreen extends StatefulWidget {
  final String caseId;
  final String? initialTaskId;

  const CaseDetailScreen({
    super.key,
    required this.caseId,
    this.initialTaskId,
  });

  @override
  State<CaseDetailScreen> createState() => _CaseDetailScreenState();
}

class _CaseDetailScreenState extends State<CaseDetailScreen> {
  late final ApiService _api;
  Case? _case;
  bool _loading = true;
  String? _error;

  // Form state
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, String> _selectValues = {};
  final Map<String, double> _confidence = {};
  bool _submitting = false;

  // Speech to text
  final SpeechToText _speech = SpeechToText();
  bool _speechAvailable = false;
  bool _listening = false;
  bool _nlpLoading = false;

  @override
  void initState() {
    super.initState();
    _api = context.read<ApiService>();
    _loadCase();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    _speechAvailable = await _speech.initialize();
    if (mounted) setState(() {});
  }

  Future<void> _loadCase() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final cas = await _api.getCaseById(widget.caseId);
      if (mounted) setState(() => _case = cas);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _loading = false);
  }

  // ── Form template helpers ─────────────────────────────────────────────────

  List<Map<String, dynamic>> _getFields(Task task) {
    // formTemplate is on the policy node — for demo we extract from task if available
    // Returns default fields if nothing defined
    return [
      {'name': 'descripcion', 'label': 'Descripción', 'type': 'text', 'required': false},
      {'name': 'observaciones', 'label': 'Observaciones', 'type': 'text', 'required': false},
    ];
  }

  TextEditingController _ctrl(String name) =>
      _controllers.putIfAbsent(name, () => TextEditingController());

  // ── Dictation (NLP fill form) ─────────────────────────────────────────────

  Future<void> _startDictation(Task task) async {
    if (!_speechAvailable) {
      _showSnack('Micrófono no disponible');
      return;
    }
    setState(() => _listening = true);
    String transcript = '';
    await _speech.listen(
      onResult: (result) => transcript = result.recognizedWords,
      localeId: 'es_BO',
    );
    // Stop after 5 seconds
    await Future.delayed(const Duration(seconds: 5));
    await _speech.stop();
    setState(() {
      _listening = false;
      _nlpLoading = true;
    });

    if (transcript.isNotEmpty) {
      final fields = _getFields(task);
      try {
        final result = await _api.nlpFillForm(
          transcript: transcript,
          fields: fields,
        );
        final values = result['values'] as Map<String, dynamic>? ?? {};
        final conf = result['confidence'] as Map<String, dynamic>? ?? {};
        setState(() {
          for (final entry in values.entries) {
            _ctrl(entry.key).text = entry.value.toString();
          }
          for (final entry in conf.entries) {
            _confidence[entry.key] = (entry.value as num).toDouble();
          }
        });
        _showSnack('Formulario rellenado por voz ✓');
      } catch (_) {
        _showSnack('No se pudo procesar la transcripción');
      }
    } else {
      _showSnack('No se detectó texto');
    }
    setState(() => _nlpLoading = false);
  }

  // ── Complete task ─────────────────────────────────────────────────────────

  Future<void> _completeTask(String taskId) async {
    setState(() => _submitting = true);
    final ok = await context.read<TasksProvider>().completeTask(taskId);
    setState(() => _submitting = false);
    if (ok && mounted) {
      _showSnack('Tarea completada ✓');
      await Future.delayed(const Duration(milliseconds: 600));
      if (mounted) Navigator.of(context).pop();
    } else if (mounted) {
      _showSnack(context.read<TasksProvider>().error ?? 'Error al completar');
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg)));
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_case?.policyName ?? 'Detalle del caso'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadCase,
          )
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!),
            const SizedBox(height: 16),
            FilledButton(onPressed: _loadCase, child: const Text('Reintentar')),
          ],
        ),
      );
    }
    final cas = _case!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CaseHeader(cas: cas),
          const SizedBox(height: 20),
          // Show the task cards
          ...cas.tasks.map((t) => _buildTaskCard(t)).toList(),
        ],
      ),
    );
  }

  Widget _buildTaskCard(Task task) {
    final colors = Theme.of(context).colorScheme;
    final isActive = task.isPending;
    final isInitial = widget.initialTaskId == task.id;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: isActive ? 3 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isActive
            ? BorderSide(color: colors.primary, width: 1.5)
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  task.status == 'DONE'
                      ? Icons.check_circle
                      : isActive
                          ? Icons.play_circle
                          : Icons.circle_outlined,
                  color: task.status == 'DONE'
                      ? Colors.green
                      : isActive
                          ? colors.primary
                          : colors.onSurface.withOpacity(0.4),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    task.title ?? 'Tarea ${task.nodeId.substring(0, 6)}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                ),
                _StatusChip(status: task.status),
              ],
            ),
            if (task.department != null) ...[
              const SizedBox(height: 4),
              Text('Departamento: ${task.department}',
                  style: TextStyle(
                      fontSize: 12,
                      color: colors.onSurface.withOpacity(0.6))),
            ],
            // Active task: show form + controls
            if (isActive && isInitial) ...[
              const Divider(height: 24),
              _buildForm(task),
              const SizedBox(height: 12),
              _buildDictationBar(task),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _submitting ? null : () => _completeTask(task.id),
                  icon: _submitting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.check),
                  label: const Text('Completar tarea'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildForm(Task task) {
    final fields = _getFields(task);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Formulario',
            style: Theme.of(context)
                .textTheme
                .titleSmall
                ?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...fields.map((f) => _buildField(f)).toList(),
      ],
    );
  }

  Widget _buildField(Map<String, dynamic> field) {
    final name = field['name'] as String;
    final label = field['label'] as String;
    final type = field['type'] as String? ?? 'text';
    final conf = _confidence[name];

    Color? borderColor;
    if (conf != null) {
      borderColor = conf >= 0.8
          ? Colors.green
          : conf >= 0.6
              ? Colors.orange
              : Colors.red;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(label,
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w500)),
              if (conf != null) ...[
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                      color: borderColor!.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: borderColor)),
                  child: Text(
                    '${(conf * 100).round()}%',
                    style: TextStyle(fontSize: 10, color: borderColor),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 4),
          TextFormField(
            controller: _ctrl(name),
            keyboardType: type == 'number'
                ? TextInputType.number
                : type == 'date'
                    ? TextInputType.datetime
                    : TextInputType.text,
            decoration: InputDecoration(
              hintText: type == 'date' ? 'dd/mm/aaaa' : null,
              border: OutlineInputBorder(
                borderSide: borderColor != null
                    ? BorderSide(color: borderColor)
                    : const BorderSide(),
              ),
              enabledBorder: borderColor != null
                  ? OutlineInputBorder(
                      borderSide: BorderSide(color: borderColor))
                  : null,
              isDense: true,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDictationBar(Task task) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _listening
                      ? '🎙️ Escuchando...'
                      : _nlpLoading
                          ? '⏳ Procesando...'
                          : '🎙️ Dictar formulario',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  'Habla y el sistema rellenará los campos automáticamente',
                  style: TextStyle(
                      fontSize: 11,
                      color: colors.onSurface.withOpacity(0.6)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          if (_nlpLoading)
            const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2))
          else
            IconButton.filled(
              icon: Icon(_listening ? Icons.stop : Icons.mic),
              style: IconButton.styleFrom(
                backgroundColor: _listening ? Colors.red : colors.primary,
              ),
              onPressed: _speechAvailable
                  ? () => _startDictation(task)
                  : null,
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }
}

// ── Sub-widgets ─────────────────────────────────────────────────────────────

class _CaseHeader extends StatelessWidget {
  final Case cas;
  const _CaseHeader({required this.cas});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      color: colors.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.folder_open),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    cas.policyName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                _StatusChip(status: cas.status),
              ],
            ),
            const SizedBox(height: 8),
            Text('ID: ${cas.id.substring(0, 12)}...',
                style: TextStyle(
                    fontSize: 11,
                    color: colors.onPrimaryContainer.withOpacity(0.7))),
            const SizedBox(height: 4),
            Text(
              '${cas.tasks.where((t) => t.status == 'DONE').length} / ${cas.tasks.length} tareas completadas',
              style: const TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: cas.tasks.isEmpty
                  ? 0
                  : cas.tasks.where((t) => t.status == 'DONE').length /
                      cas.tasks.length,
              backgroundColor: colors.onPrimaryContainer.withOpacity(0.2),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      'IN_PROGRESS' => ('En curso', Colors.blue),
      'PENDING' => ('Pendiente', Colors.orange),
      'DONE' => ('Listo', Colors.green),
      'COMPLETED' => ('Completado', Colors.green),
      'CANCELLED' => ('Cancelado', Colors.red),
      _ => (status, Colors.grey),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(label,
          style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
    );
  }
}
