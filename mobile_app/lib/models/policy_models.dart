class PolicyNode {
  final String id;
  final String nodeType; // INITIAL | FINAL | ACTION | DECISION | FORK | JOIN
  final String title;
  final String? description;
  final String departmentId;
  final double positionX;
  final double positionY;

  const PolicyNode({
    required this.id,
    required this.nodeType,
    required this.title,
    this.description,
    required this.departmentId,
    this.positionX = 0,
    this.positionY = 0,
  });

  factory PolicyNode.fromJson(Map<String, dynamic> j) => PolicyNode(
        id: j['id'] as String,
        nodeType: j['nodeType'] as String,
        title: j['title'] as String? ?? '',
        description: j['description'] as String?,
        departmentId: j['departmentId'] as String? ?? '',
        positionX: (j['positionX'] as num?)?.toDouble() ?? 0,
        positionY: (j['positionY'] as num?)?.toDouble() ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'nodeType': nodeType,
        'title': title,
        if (description != null) 'description': description,
        'departmentId': departmentId,
        'positionX': positionX,
        'positionY': positionY,
      };

  PolicyNode copyWith({
    String? nodeType,
    String? title,
    String? description,
    String? departmentId,
  }) =>
      PolicyNode(
        id: id,
        nodeType: nodeType ?? this.nodeType,
        title: title ?? this.title,
        description: description ?? this.description,
        departmentId: departmentId ?? this.departmentId,
        positionX: positionX,
        positionY: positionY,
      );
}

class PolicyEdge {
  final String id;
  final String fromNodeId;
  final String toNodeId;
  final String flowType; // SEQUENTIAL | CONDITIONAL | PARALLEL
  final String? conditionLabel;

  const PolicyEdge({
    required this.id,
    required this.fromNodeId,
    required this.toNodeId,
    required this.flowType,
    this.conditionLabel,
  });

  factory PolicyEdge.fromJson(Map<String, dynamic> j) => PolicyEdge(
        id: j['id'] as String,
        fromNodeId: j['fromNodeId'] as String,
        toNodeId: j['toNodeId'] as String,
        flowType: j['flowType'] as String,
        conditionLabel: j['conditionLabel'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'fromNodeId': fromNodeId,
        'toNodeId': toNodeId,
        'flowType': flowType,
        if (conditionLabel != null) 'conditionLabel': conditionLabel,
      };
}

class PolicyModel {
  final String id;
  final String name;
  final String status;
  final String? createdBy;
  final List<PolicyNode> nodes;
  final List<PolicyEdge> edges;

  const PolicyModel({
    required this.id,
    required this.name,
    required this.status,
    this.createdBy,
    required this.nodes,
    required this.edges,
  });

  factory PolicyModel.fromJson(Map<String, dynamic> j) => PolicyModel(
        id: j['id'] as String,
        name: j['name'] as String,
        status: j['status'] as String? ?? 'ACTIVE',
        createdBy: j['createdBy'] as String?,
        nodes: (j['nodes'] as List<dynamic>? ?? [])
            .map((n) => PolicyNode.fromJson(n as Map<String, dynamic>))
            .toList(),
        edges: (j['edges'] as List<dynamic>? ?? [])
            .map((e) => PolicyEdge.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class Department {
  final String id;
  final String name;

  const Department({required this.id, required this.name});

  factory Department.fromJson(Map<String, dynamic> j) => Department(
        id: j['id'] as String,
        name: j['name'] as String,
      );
}
