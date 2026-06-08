import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/policy_models.dart';
import '../providers/policy_provider.dart';
import '../services/websocket_service.dart';

class PolicyEditorScreen extends StatefulWidget {
  final PolicyModel policy;
  const PolicyEditorScreen({super.key, required this.policy});

  @override
  State<PolicyEditorScreen> createState() => _PolicyEditorScreenState();
}

class _PolicyEditorScreenState extends State<PolicyEditorScreen>
    with SingleTickerProviderStateMixin {
  late List<PolicyNode> _nodes;
  late List<PolicyEdge> _edges;
  bool _saving = false;
  bool _dirty = false;
  bool _remoteUpdate = false; // banner: someone else saved
  late TabController _tabCtrl;
  StreamSubscription<WsEvent>? _wsSub;

  static const _nodeTypes = ['INITIAL', 'ACTION', 'DECISION', 'MERGE', 'FORK', 'JOIN', 'FINAL'];
  static const _flowTypes = ['SEQUENTIAL', 'CONDITIONAL', 'PARALLEL', 'ITERATIVE'];

  static const _nodeColors = {
    'INITIAL': Color(0xFF52c41a),
    'FINAL': Color(0xFFff4d4f),
    'DECISION': Color(0xFFfaad14),
    'MERGE': Color(0xFFfa8c16),
    'FORK': Color(0xFF722ed1),
    'JOIN': Color(0xFF13c2c2),
    'ACTION': Color(0xFF1677ff),
  };

  @override
  void initState() {
    super.initState();
    _nodes = List.from(widget.policy.nodes);
    _edges = List.from(widget.policy.edges);
    _tabCtrl = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PolicyProvider>().loadDepartments();
      _subscribeToWs();
    });
  }

  void _subscribeToWs() {
    final ws = context.read<WebSocketService>();
    _wsSub = ws.events.listen((event) {
      if (event.type == 'policy:updated' &&
          event.data['policyId'] == widget.policy.id &&
          mounted) {
        setState(() => _remoteUpdate = true);
      }
    });
  }

  Future<void> _reloadFromServer() async {
    final provider = context.read<PolicyProvider>();
    final updated = await provider.loadPolicyById(widget.policy.id);
    if (updated != null && mounted) {
      setState(() {
        _nodes = List.from(updated.nodes);
        _edges = List.from(updated.edges);
        _dirty = false;
        _remoteUpdate = false;
      });
    }
  }

  void _dismissRemoteUpdate() => setState(() => _remoteUpdate = false);

  @override
  void dispose() {
    _wsSub?.cancel();
    _tabCtrl.dispose();
    super.dispose();
  }

  String _deptName(String deptId, List<Department> depts) {
    try {
      return depts.firstWhere((d) => d.id == deptId).name;
    } catch (_) {
      return deptId;
    }
  }

  String _nodeName(String nodeId) {
    try {
      return _nodes.firstWhere((n) => n.id == nodeId).title;
    } catch (_) {
      return nodeId;
    }
  }

  // ── Add node dialog ────────────────────────────────────────────────────────

  Future<void> _showAddNodeDialog() async {
    final depts = context.read<PolicyProvider>().departments;
    String selectedType = 'ACTION';
    String title = '';
    String selectedDeptId = depts.isNotEmpty ? depts.first.id : '';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Agregar nodo'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Tipo de nodo', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _nodeTypes.map((t) {
                    final color = _nodeColors[t] ?? Colors.blue;
                    final selected = selectedType == t;
                    return ChoiceChip(
                      label: Text(t, style: TextStyle(fontSize: 12, color: selected ? Colors.white : color, fontWeight: FontWeight.w600)),
                      selected: selected,
                      selectedColor: color,
                      backgroundColor: color.withValues(alpha: 0.1),
                      side: BorderSide(color: color, width: 1.2),
                      onSelected: (_) => setLocal(() => selectedType = t),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),
                if (selectedType == 'ACTION' || selectedType == 'DECISION') ...[
                  const Text('Nombre', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    autofocus: true,
                    decoration: const InputDecoration(
                      hintText: 'Ej: Revisar solicitud',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                    onChanged: (v) => title = v,
                    textCapitalization: TextCapitalization.sentences,
                  ),
                  const SizedBox(height: 14),
                ],
                if (depts.isNotEmpty) ...[
                  const Text('Departamento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: selectedDeptId.isNotEmpty ? selectedDeptId : null,
                    decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
                    items: depts.map((d) => DropdownMenuItem(value: d.id, child: Text(d.name))).toList(),
                    onChanged: (v) => setLocal(() => selectedDeptId = v ?? ''),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Agregar')),
          ],
        ),
      ),
    );

    if (confirmed == true && mounted) {
      final autoTitle = (selectedType == 'ACTION' || selectedType == 'DECISION')
          ? title.trim().isNotEmpty ? title.trim() : selectedType
          : selectedType;
      final newNode = PolicyNode(
        id: 'node_${DateTime.now().millisecondsSinceEpoch}',
        nodeType: selectedType,
        title: autoTitle,
        departmentId: selectedDeptId,
        positionX: (_nodes.length * 160.0) % 640,
        positionY: (_nodes.length ~/ 4) * 120.0,
      );
      setState(() {
        _nodes = [..._nodes, newNode];
        _dirty = true;
      });
    }
  }

  // ── Add edge dialog ────────────────────────────────────────────────────────

  Future<void> _showAddEdgeDialog() async {
    if (_nodes.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Necesitas al menos 2 nodos para conectar')),
      );
      return;
    }

    String? fromId = _nodes.first.id;
    String? toId = _nodes.length > 1 ? _nodes[1].id : null;
    String flowType = 'SEQUENTIAL';
    String conditionLabel = '';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Agregar conexión'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Desde', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: fromId,
                  decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
                  items: _nodes.map((n) => DropdownMenuItem(
                    value: n.id,
                    child: Row(children: [
                      Container(width: 10, height: 10, decoration: BoxDecoration(color: _nodeColors[n.nodeType], borderRadius: BorderRadius.circular(2))),
                      const SizedBox(width: 6),
                      Text(n.title, overflow: TextOverflow.ellipsis),
                    ]),
                  )).toList(),
                  onChanged: (v) => setLocal(() => fromId = v),
                ),
                const SizedBox(height: 12),
                const Text('Hacia', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: toId,
                  decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
                  items: _nodes.map((n) => DropdownMenuItem(
                    value: n.id,
                    child: Row(children: [
                      Container(width: 10, height: 10, decoration: BoxDecoration(color: _nodeColors[n.nodeType], borderRadius: BorderRadius.circular(2))),
                      const SizedBox(width: 6),
                      Text(n.title, overflow: TextOverflow.ellipsis),
                    ]),
                  )).toList(),
                  onChanged: (v) => setLocal(() => toId = v),
                ),
                const SizedBox(height: 12),
                const Text('Tipo de flujo', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  children: _flowTypes.map((f) {
                    final colors = {'SEQUENTIAL': Colors.blue, 'CONDITIONAL': Colors.orange, 'PARALLEL': Colors.purple};
                    final c = colors[f]!;
                    return ChoiceChip(
                      label: Text(f, style: TextStyle(fontSize: 11, color: flowType == f ? Colors.white : c, fontWeight: FontWeight.w600)),
                      selected: flowType == f,
                      selectedColor: c,
                      backgroundColor: c.withValues(alpha: 0.1),
                      side: BorderSide(color: c),
                      onSelected: (_) => setLocal(() => flowType = f),
                    );
                  }).toList(),
                ),
                if (flowType == 'CONDITIONAL') ...[
                  const SizedBox(height: 12),
                  const Text('Etiqueta (ej: SI / NO)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    decoration: const InputDecoration(hintText: 'SI', border: OutlineInputBorder(), isDense: true),
                    onChanged: (v) => conditionLabel = v,
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
            FilledButton(
              onPressed: fromId != null && toId != null && fromId != toId
                  ? () => Navigator.pop(ctx, true)
                  : null,
              child: const Text('Conectar'),
            ),
          ],
        ),
      ),
    );

    if (confirmed == true && fromId != null && toId != null && mounted) {
      final newEdge = PolicyEdge(
        id: 'edge_${DateTime.now().millisecondsSinceEpoch}',
        fromNodeId: fromId!,
        toNodeId: toId!,
        flowType: flowType,
        conditionLabel: flowType == 'CONDITIONAL' && conditionLabel.trim().isNotEmpty
            ? conditionLabel.trim()
            : null,
      );
      setState(() {
        _edges = [..._edges, newEdge];
        _dirty = true;
      });
    }
  }

  // ── Delete node ────────────────────────────────────────────────────────────

  void _deleteNode(PolicyNode node) {
    setState(() {
      _nodes = _nodes.where((n) => n.id != node.id).toList();
      _edges = _edges.where((e) => e.fromNodeId != node.id && e.toNodeId != node.id).toList();
      _dirty = true;
    });
  }

  void _deleteEdge(PolicyEdge edge) {
    setState(() {
      _edges = _edges.where((e) => e.id != edge.id).toList();
      _dirty = true;
    });
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  Future<void> _save() async {
    setState(() => _saving = true);
    final provider = context.read<PolicyProvider>();
    final ok = await provider.saveGraph(
      widget.policy.id,
      nodes: _nodes,
      edges: _edges,
    );
    if (!mounted) return;
    setState(() {
      _saving = false;
      if (ok) _dirty = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok ? 'Diagrama guardado correctamente' : 'Error al guardar'),
        backgroundColor: ok ? Colors.green : Colors.red,
      ),
    );
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final depts = context.watch<PolicyProvider>().departments;

    return PopScope(
      canPop: !_dirty,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final leave = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Cambios sin guardar'),
            content: const Text('¿Salir sin guardar los cambios?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Quedarme')),
              TextButton(
                style: TextButton.styleFrom(foregroundColor: Colors.red),
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Salir'),
              ),
            ],
          ),
        );
        if (leave == true && context.mounted) Navigator.pop(context);
      },
      child: Scaffold(
        appBar: AppBar(
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.policy.name, style: const TextStyle(fontSize: 16)),
              Text(
                '${_nodes.length} nodos · ${_edges.length} conexiones',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.normal),
              ),
            ],
          ),
          actions: [
            // WS live indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: context.watch<WebSocketService>().connected
                  ? const Tooltip(
                      message: 'En vivo',
                      child: Icon(Icons.circle, color: Colors.green, size: 12),
                    )
                  : const Tooltip(
                      message: 'Sin conexión en tiempo real',
                      child: Icon(Icons.circle, color: Colors.red, size: 12),
                    ),
            ),
            if (_dirty)
              Padding(
                padding: const EdgeInsets.only(right: 4),
                child: _saving
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                      )
                    : FilledButton.icon(
                        onPressed: _save,
                        icon: const Icon(Icons.save, size: 16),
                        label: const Text('Guardar'),
                      ),
              ),
          ],
          bottom: TabBar(
            controller: _tabCtrl,
            tabs: const [
              Tab(icon: Icon(Icons.circle_outlined, size: 18), text: 'Nodos'),
              Tab(icon: Icon(Icons.arrow_forward, size: 18), text: 'Conexiones'),
            ],
          ),
        ),
        body: Column(
          children: [
            // ── Collaboration banner ─────────────────────────────────────────
            if (_remoteUpdate)
              MaterialBanner(
                padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
                leading: const Icon(Icons.sync, color: Colors.white),
                backgroundColor: const Color(0xFF1565C0),
                content: const Text(
                  'Un colaborador actualizó este diagrama',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
                actions: [
                  TextButton(
                    onPressed: _dismissRemoteUpdate,
                    child: const Text('Ignorar', style: TextStyle(color: Colors.white70)),
                  ),
                  TextButton(
                    onPressed: _reloadFromServer,
                    child: const Text('Recargar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            // ── Tabs ─────────────────────────────────────────────────────────
            Expanded(
              child: TabBarView(
                controller: _tabCtrl,
                children: [
                  _NodesTab(
                    nodes: _nodes,
                    departments: depts,
                    deptName: (id) => _deptName(id, depts),
                    onAdd: _showAddNodeDialog,
                    onDelete: _deleteNode,
                  ),
                  _EdgesTab(
                    edges: _edges,
                    nodeName: _nodeName,
                    onAdd: _showAddEdgeDialog,
                    onDelete: _deleteEdge,
                  ),
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: _DiagramPreview(nodes: _nodes, edges: _edges),
      ),
    );
  }
}

// ── Nodes tab ─────────────────────────────────────────────────────────────────

class _NodesTab extends StatelessWidget {
  final List<PolicyNode> nodes;
  final List<Department> departments;
  final String Function(String) deptName;
  final VoidCallback onAdd;
  final void Function(PolicyNode) onDelete;

  const _NodesTab({
    required this.nodes,
    required this.departments,
    required this.deptName,
    required this.onAdd,
    required this.onDelete,
  });

  static const _nodeColors = {
    'INITIAL': Color(0xFF52c41a),
    'FINAL': Color(0xFFff4d4f),
    'DECISION': Color(0xFFfaad14),
    'MERGE': Color(0xFFfa8c16),
    'FORK': Color(0xFF722ed1),
    'JOIN': Color(0xFF13c2c2),
    'ACTION': Color(0xFF1677ff),
  };

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: nodes.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.circle_outlined, size: 56, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text('No hay nodos todavía'),
                      const SizedBox(height: 8),
                      const Text('Presiona + para agregar el primero', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                )
              : ReorderableListView.builder(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                  itemCount: nodes.length,
                  onReorder: (oldIndex, newIndex) {},
                  itemBuilder: (_, i) {
                    final n = nodes[i];
                    final color = _nodeColors[n.nodeType] ?? Colors.blue;
                    return ListTile(
                      key: ValueKey(n.id),
                      leading: CircleAvatar(
                        backgroundColor: color,
                        radius: 18,
                        child: Text(
                          n.nodeType.substring(0, 1),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                      title: Text(n.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text(
                        '${n.nodeType} · ${deptName(n.departmentId)}',
                        style: TextStyle(fontSize: 12, color: color),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                        onPressed: () => onDelete(n),
                      ),
                    );
                  },
                ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: onAdd,
                icon: const Icon(Icons.add),
                label: const Text('Agregar nodo'),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Edges tab ─────────────────────────────────────────────────────────────────

class _EdgesTab extends StatelessWidget {
  final List<PolicyEdge> edges;
  final String Function(String) nodeName;
  final VoidCallback onAdd;
  final void Function(PolicyEdge) onDelete;

  const _EdgesTab({
    required this.edges,
    required this.nodeName,
    required this.onAdd,
    required this.onDelete,
  });

  static const _flowColors = {
    'SEQUENTIAL': Color(0xFF1677ff),
    'CONDITIONAL': Color(0xFFfa8c16),
    'PARALLEL': Color(0xFF722ed1),
    'ITERATIVE': Color(0xFF13c2c2),
  };

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: edges.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.arrow_forward, size: 56, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      const Text('No hay conexiones todavía'),
                      const SizedBox(height: 8),
                      const Text('Presiona + para conectar nodos', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
                  itemCount: edges.length,
                  itemBuilder: (_, i) {
                    final e = edges[i];
                    final color = _flowColors[e.flowType] ?? Colors.blue;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: Icon(Icons.arrow_forward_rounded, color: color),
                        title: Row(
                          children: [
                            Flexible(child: Text(nodeName(e.fromNodeId), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13), overflow: TextOverflow.ellipsis)),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              child: Icon(Icons.arrow_right_alt, size: 18, color: color),
                            ),
                            Flexible(child: Text(nodeName(e.toNodeId), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13), overflow: TextOverflow.ellipsis)),
                          ],
                        ),
                        subtitle: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
                              child: Text(e.flowType, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w600)),
                            ),
                            if (e.conditionLabel != null) ...[
                              const SizedBox(width: 6),
                              Text('· ${e.conditionLabel}', style: const TextStyle(fontSize: 12)),
                            ],
                          ],
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                          onPressed: () => onDelete(e),
                        ),
                      ),
                    );
                  },
                ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: onAdd,
                icon: const Icon(Icons.add),
                label: const Text('Agregar conexión'),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Diagram preview (swim lanes) ──────────────────────────────────────────────

class _DiagramPreview extends StatelessWidget {
  final List<PolicyNode> nodes;
  final List<PolicyEdge> edges;

  const _DiagramPreview({required this.nodes, required this.edges});

  @override
  Widget build(BuildContext context) {
    if (nodes.isEmpty) return const SizedBox.shrink();
    return Container(
      height: 120,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 6, 12, 0),
            child: Text('Vista previa del flujo', style: Theme.of(context).textTheme.labelSmall),
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: CustomPaint(
                size: Size(nodes.length * 110.0, 70),
                painter: _FlowPainter(nodes: nodes, edges: edges),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FlowPainter extends CustomPainter {
  final List<PolicyNode> nodes;
  final List<PolicyEdge> edges;

  static const _colors = {
    'INITIAL': Color(0xFF52c41a),
    'FINAL': Color(0xFFff4d4f),
    'DECISION': Color(0xFFfaad14),
    'FORK': Color(0xFF722ed1),
    'JOIN': Color(0xFF13c2c2),
    'ACTION': Color(0xFF1677ff),
  };

  const _FlowPainter({required this.nodes, required this.edges});

  @override
  void paint(Canvas canvas, Size size) {
    final nodePositions = <String, Offset>{};
    const nodeW = 80.0;
    const nodeH = 32.0;
    const gap = 30.0;

    for (var i = 0; i < nodes.length; i++) {
      final x = i * (nodeW + gap);
      final y = (size.height - nodeH) / 2;
      nodePositions[nodes[i].id] = Offset(x + nodeW / 2, y + nodeH / 2);

      final color = _colors[nodes[i].nodeType] ?? Colors.blue;
      final paint = Paint()..color = color;
      final rect = RRect.fromRectAndRadius(
        Rect.fromLTWH(x, y, nodeW, nodeH),
        const Radius.circular(6),
      );
      canvas.drawRRect(rect, paint);

      final tp = TextPainter(
        text: TextSpan(
          text: nodes[i].title.length > 9 ? '${nodes[i].title.substring(0, 8)}…' : nodes[i].title,
          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
        ),
        textDirection: TextDirection.ltr,
      )..layout(maxWidth: nodeW - 4);
      tp.paint(canvas, Offset(x + (nodeW - tp.width) / 2, y + (nodeH - tp.height) / 2));
    }

    final arrowPaint = Paint()
      ..color = Colors.blueGrey.shade400
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    for (final e in edges) {
      final from = nodePositions[e.fromNodeId];
      final to = nodePositions[e.toNodeId];
      if (from == null || to == null) continue;
      final dx = to.dx - from.dx;
      final fromEdge = Offset(from.dx + (dx > 0 ? 40 : -40), from.dy);
      final toEdge = Offset(to.dx + (dx > 0 ? -40 : 40), to.dy);
      canvas.drawLine(fromEdge, toEdge, arrowPaint);
      // arrowhead
      final angle = (toEdge - fromEdge);
      final norm = angle / angle.distance;
      final tip = toEdge;
      final p1 = tip - Offset(norm.dx * 8 - norm.dy * 4, norm.dy * 8 + norm.dx * 4);
      final p2 = tip - Offset(norm.dx * 8 + norm.dy * 4, norm.dy * 8 - norm.dx * 4);
      canvas.drawLine(tip, p1, arrowPaint);
      canvas.drawLine(tip, p2, arrowPaint);
    }
  }

  @override
  bool shouldRepaint(_FlowPainter old) =>
      old.nodes != nodes || old.edges != edges;
}
