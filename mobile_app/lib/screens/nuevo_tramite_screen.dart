import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart';
import '../services/api_service.dart';
import '../providers/cases_provider.dart';

enum _Step { idle, recording, analyzing, suggestion, creating, done }

class NuevoTramiteScreen extends StatefulWidget {
  const NuevoTramiteScreen({super.key});

  @override
  State<NuevoTramiteScreen> createState() => _NuevoTramiteScreenState();
}

class _NuevoTramiteScreenState extends State<NuevoTramiteScreen>
    with SingleTickerProviderStateMixin {
  final SpeechToText _speech = SpeechToText();
  bool _speechAvailable = false;

  _Step _step = _Step.idle;
  String _transcript = '';
  String _errorMsg = '';

  // Suggestion returned by AI
  String _policyId = '';
  String _policyName = '';
  double _confidence = 0;
  String _explanation = '';

  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    final ok = await _speech.initialize();
    setState(() => _speechAvailable = ok);
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _speech.stop();
    super.dispose();
  }

  // ── Recording ─────────────────────────────────────────────────────────────

  Future<void> _startRecording() async {
    if (!_speechAvailable) {
      setState(() => _errorMsg = 'Micrófono no disponible en este dispositivo.');
      return;
    }
    setState(() {
      _step = _Step.recording;
      _transcript = '';
      _errorMsg = '';
    });

    await _speech.listen(
      localeId: 'es_BO',
      listenFor: const Duration(seconds: 10),
      pauseFor: const Duration(seconds: 3),
      onResult: (result) {
        setState(() => _transcript = result.recognizedWords);
        if (result.finalResult && _transcript.trim().isNotEmpty) {
          _analyzeTranscript();
        }
      },
    );
  }

  void _stopAndAnalyze() {
    _speech.stop();
    if (_transcript.trim().isNotEmpty) {
      _analyzeTranscript();
    } else {
      setState(() {
        _step = _Step.idle;
        _errorMsg = 'No se detectó ninguna voz. Intentá de nuevo.';
      });
    }
  }

  // ── AI call ───────────────────────────────────────────────────────────────

  Future<void> _analyzeTranscript() async {
    setState(() => _step = _Step.analyzing);
    try {
      final api = context.read<ApiService>();
      final result = await api.suggestPolicy(_transcript);

      if (result.isEmpty || result['policyId'] == null) {
        setState(() {
          _step = _Step.idle;
          _errorMsg = 'No se pudo determinar la política. Intentá con más detalle.';
        });
        return;
      }

      setState(() {
        _policyId = result['policyId'] as String? ?? '';
        _policyName = result['policyName'] as String? ?? 'Política sugerida';
        _confidence = (result['confidence'] as num?)?.toDouble() ?? 0;
        _explanation = result['explanation'] as String? ?? '';
        _step = _Step.suggestion;
      });
    } catch (e) {
      setState(() {
        _step = _Step.idle;
        _errorMsg = 'Error al consultar la IA. Verificá tu conexión.';
      });
    }
  }

  // ── Confirm and create case ───────────────────────────────────────────────

  Future<void> _confirm() async {
    setState(() => _step = _Step.creating);
    try {
      final api = context.read<ApiService>();
      await api.startMyCase(_policyId);
      if (mounted) {
        await context.read<CasesProvider>().loadMyCases();
      }
      setState(() => _step = _Step.done);
    } catch (e) {
      setState(() {
        _step = _Step.suggestion;
        _errorMsg = 'Error al iniciar el trámite. Intentá de nuevo.';
      });
    }
  }

  void _retry() => setState(() {
        _step = _Step.idle;
        _transcript = '';
        _errorMsg = '';
        _policyId = '';
        _policyName = '';
        _confidence = 0;
        _explanation = '';
      });

  // ── UI ────────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nuevo Trámite',
            style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: false,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: switch (_step) {
            _Step.idle => _buildIdle(),
            _Step.recording => _buildRecording(),
            _Step.analyzing => _buildAnalyzing(),
            _Step.suggestion => _buildSuggestion(),
            _Step.creating => _buildCreating(),
            _Step.done => _buildDone(),
          },
        ),
      ),
    );
  }

  // ── Idle ──────────────────────────────────────────────────────────────────

  Widget _buildIdle() {
    final primary = Theme.of(context).colorScheme.primary;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.record_voice_over_rounded, size: 72, color: Colors.blueGrey),
        const SizedBox(height: 24),
        Text(
          'Describí tu situación',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        const Text(
          'Presioná el micrófono y explicá en tus propias palabras qué necesitás hacer. '
          'La IA determinará automáticamente qué tipo de trámite corresponde.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey, height: 1.5),
        ),
        const SizedBox(height: 40),
        GestureDetector(
          onTap: _startRecording,
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: primary,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: primary.withAlpha(80), blurRadius: 20, spreadRadius: 4)],
            ),
            child: const Icon(Icons.mic_rounded, size: 48, color: Colors.white),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Toca para hablar', style: TextStyle(color: Colors.grey, fontSize: 13)),
        if (_errorMsg.isNotEmpty) ...[
          const SizedBox(height: 24),
          _ErrorBanner(message: _errorMsg),
        ],
      ],
    );
  }

  // ── Recording ─────────────────────────────────────────────────────────────

  Widget _buildRecording() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ScaleTransition(
          scale: _pulseAnim,
          child: Container(
            width: 100,
            height: 100,
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.mic_rounded, size: 48, color: Colors.white),
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'Escuchando...',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Hablá con claridad. La grabación se detiene automáticamente.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey, fontSize: 13),
        ),
        const SizedBox(height: 24),
        if (_transcript.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(children: [
              const Icon(Icons.format_quote, color: Colors.grey, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(_transcript,
                    style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic)),
              ),
            ]),
          ),
        const SizedBox(height: 32),
        OutlinedButton.icon(
          onPressed: _stopAndAnalyze,
          icon: const Icon(Icons.stop_circle_outlined),
          label: const Text('Detener y analizar'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          ),
        ),
      ],
    );
  }

  // ── Analyzing ─────────────────────────────────────────────────────────────

  Widget _buildAnalyzing() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const CircularProgressIndicator(),
        const SizedBox(height: 24),
        const Text('Analizando con IA...',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text(
          'La IA está determinando qué tipo de trámite corresponde a tu descripción.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey, fontSize: 13),
        ),
        if (_transcript.isNotEmpty) ...[
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Icon(Icons.format_quote, color: Colors.grey, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(_transcript,
                    style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic)),
              ),
            ]),
          ),
        ],
      ],
    );
  }

  // ── Suggestion ────────────────────────────────────────────────────────────

  Widget _buildSuggestion() {
    final confidencePct = (_confidence * 100).round();
    final confColor = _confidence >= 0.8
        ? Colors.green
        : _confidence >= 0.5
            ? Colors.orange
            : Colors.red;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Header
        const Icon(Icons.auto_awesome_rounded, size: 48, color: Colors.amber),
        const SizedBox(height: 12),
        Text(
          'Política sugerida',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),

        // Policy card
        Card(
          elevation: 3,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const Icon(Icons.account_tree_rounded, color: Colors.blueAccent, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(_policyName,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ]),
              const SizedBox(height: 12),

              // Confidence bar
              Row(children: [
                Text('Confianza: $confidencePct%',
                    style: TextStyle(fontSize: 12, color: confColor, fontWeight: FontWeight.w600)),
                const SizedBox(width: 8),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: _confidence,
                      minHeight: 6,
                      color: confColor,
                      backgroundColor: confColor.withAlpha(40),
                    ),
                  ),
                ),
              ]),

              if (_explanation.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 8),
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Icon(Icons.info_outline, size: 14, color: Colors.grey),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(_explanation,
                        style: const TextStyle(fontSize: 12, color: Colors.grey, height: 1.4)),
                  ),
                ]),
              ],

              // Transcript
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Icon(Icons.record_voice_over_rounded, size: 14, color: Colors.grey),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '"$_transcript"',
                    style: const TextStyle(fontSize: 12, color: Colors.grey, fontStyle: FontStyle.italic),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ]),
            ]),
          ),
        ),

        if (_errorMsg.isNotEmpty) ...[
          const SizedBox(height: 12),
          _ErrorBanner(message: _errorMsg),
        ],

        const SizedBox(height: 24),

        // Confirm
        FilledButton.icon(
          onPressed: _confirm,
          icon: const Icon(Icons.check_circle_outline_rounded),
          label: const Text('Confirmar e iniciar trámite'),
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 12),

        // Retry
        OutlinedButton.icon(
          onPressed: _retry,
          icon: const Icon(Icons.mic_none_rounded),
          label: const Text('Volver a describir'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
      ],
    );
  }

  // ── Creating ──────────────────────────────────────────────────────────────

  Widget _buildCreating() {
    return const Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CircularProgressIndicator(),
        SizedBox(height: 24),
        Text('Iniciando trámite...',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 8),
        Text('Estamos creando tu trámite en el sistema.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey, fontSize: 13)),
      ],
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────

  Widget _buildDone() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(Icons.check_circle_rounded, size: 80, color: Colors.green),
        const SizedBox(height: 24),
        Text(
          '¡Trámite iniciado!',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          'Tu trámite "$_policyName" fue registrado exitosamente. '
          'Podés seguir su progreso desde "Mis Trámites".',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.grey, height: 1.5),
        ),
        const SizedBox(height: 40),
        FilledButton.icon(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.list_alt_rounded),
          label: const Text('Ver mis trámites'),
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _retry,
          icon: const Icon(Icons.add_circle_outline_rounded),
          label: const Text('Iniciar otro trámite'),
          style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
        ),
      ],
    );
  }
}

// ── Shared widget ─────────────────────────────────────────────────────────────

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        border: Border.all(color: Colors.red.shade200),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(children: [
        const Icon(Icons.error_outline, color: Colors.red, size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: Text(message, style: const TextStyle(color: Colors.red, fontSize: 13)),
        ),
      ]),
    );
  }
}
