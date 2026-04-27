/// Modelos de dominio del Workflow SW1

class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? departmentId;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.departmentId,
  });

  factory User.fromJson(Map<String, dynamic> j) => User(
        id: j['id'] as String,
        name: j['name'] as String,
        email: j['email'] as String,
        role: j['role'] as String,
        departmentId: j['departmentId'] as String?,
      );
}

// ─────────────────────────────────────────────
class Task {
  final String id;
  final String nodeId;
  final String status; // PENDING | IN_PROGRESS | DONE
  final String? assignedUserId;
  final String? assignedUserName; // from node.assignedUser.name
  final String? title; // resolved from policy node
  final String? department; // from node.department.name
  final DateTime? startedAt;
  final DateTime? finishedAt;

  const Task({
    required this.id,
    required this.nodeId,
    required this.status,
    this.assignedUserId,
    this.assignedUserName,
    this.title,
    this.department,
    this.startedAt,
    this.finishedAt,
  });

  factory Task.fromJson(Map<String, dynamic> j) {
    // Backend returns tasks with nested node/assignedUser objects (CaseDetailDto)
    final node = j['node'] as Map<String, dynamic>?;
    final assignedUser = j['assignedUser'] as Map<String, dynamic>?;
    final dept = node?['department'] as Map<String, dynamic>?;
    return Task(
      id: j['id'] as String,
      nodeId: j['nodeId'] as String? ?? node?['id'] as String? ?? '',
      status: j['status'] as String,
      assignedUserId: assignedUser?['id'] as String? ?? j['assignedUserId'] as String?,
      assignedUserName: assignedUser?['name'] as String?,
      title: node?['title'] as String? ?? j['title'] as String?,
      department: dept?['name'] as String? ?? j['department'] as String?,
      startedAt: j['startedAt'] != null ? DateTime.tryParse(j['startedAt'] as String) : null,
      finishedAt: j['finishedAt'] != null ? DateTime.tryParse(j['finishedAt'] as String) : null,
    );
  }

  bool get isPending => status == 'PENDING' || status == 'IN_PROGRESS';
}

// ─────────────────────────────────────────────
class Case {
  final String id;
  final String policyId;
  final String policyName;
  final String status; // IN_PROGRESS | COMPLETED | CANCELLED
  final String? clientId;
  final List<Task> tasks;
  final DateTime? createdAt;
  final DateTime? finishedAt;

  const Case({
    required this.id,
    required this.policyId,
    required this.policyName,
    required this.status,
    required this.tasks,
    this.clientId,
    this.createdAt,
    this.finishedAt,
  });

  factory Case.fromJson(Map<String, dynamic> j) {
    // Backend returns policy as nested {id, name} object
    final policy = j['policy'] as Map<String, dynamic>?;
    return Case(
      id: j['id'] as String,
      policyId: policy?['id'] as String? ?? j['policyId'] as String? ?? '',
      policyName: policy?['name'] as String? ?? j['policyName'] as String? ?? 'Sin nombre',
      status: j['status'] as String,
      clientId: j['clientId'] as String?,
      tasks: (j['tasks'] as List<dynamic>? ?? [])
          .map((t) => Task.fromJson(t as Map<String, dynamic>))
          .toList(),
      createdAt: j['startedAt'] != null
          ? DateTime.tryParse(j['startedAt'] as String)
          : null,
      finishedAt: j['finishedAt'] != null
          ? DateTime.tryParse(j['finishedAt'] as String)
          : null,
    );
  }

  List<Task> get pendingTasks => tasks.where((t) => t.isPending).toList();

  /// The current active task (first PENDING or IN_PROGRESS)
  Task? get currentTask => pendingTasks.isNotEmpty ? pendingTasks.first : null;

  /// Department name of the current active task
  String? get currentDepartment => currentTask?.department;

  /// Officer currently handling the active task
  String? get currentOfficer => currentTask?.assignedUserName;

  int get completedTaskCount => tasks.where((t) => t.status == 'DONE').length;
  int get totalTaskCount => tasks.length;
}

// ─────────────────────────────────────────────
class MyTaskDto {
  final String caseId;
  final String policyName;
  final String taskId;
  final String taskTitle;
  final String status;
  final String? department;

  const MyTaskDto({
    required this.caseId,
    required this.policyName,
    required this.taskId,
    required this.taskTitle,
    required this.status,
    this.department,
  });

  factory MyTaskDto.fromJson(Map<String, dynamic> j) {
    // Soporta tanto el formato plano como el formato anidado del backend
    final node = j['node'] as Map<String, dynamic>?;
    final caseObj = j['case'] as Map<String, dynamic>?;
    final policy = caseObj?['policy'] as Map<String, dynamic>?;
    final dept = node?['department'] as Map<String, dynamic>?;
    return MyTaskDto(
      caseId: caseObj?['id'] as String? ?? j['caseId'] as String? ?? '',
      policyName: policy?['name'] as String? ?? j['policyName'] as String? ?? '',
      taskId: j['id'] as String? ?? j['taskId'] as String? ?? '',
      taskTitle: node?['title'] as String? ?? j['taskTitle'] as String? ?? 'Tarea',
      status: j['status'] as String,
      department: dept?['name'] as String? ?? j['department'] as String?,
    );
  }
}
