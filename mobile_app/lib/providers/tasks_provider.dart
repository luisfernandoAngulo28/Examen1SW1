import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';

/// Manages the list of pending tasks for the logged-in OFFICER user.
class TasksProvider extends ChangeNotifier {
  final ApiService apiService;

  TasksProvider(this.apiService);

  List<MyTaskDto> _tasks = [];
  bool _loading = false;
  String? _error;

  List<MyTaskDto> get tasks => _tasks;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadMyTasks() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _tasks = await apiService.getMyTasks();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Error de conexión';
    }
    _loading = false;
    notifyListeners();
  }

  Future<bool> completeTask(String taskId, {String? chosenEdgeLabel}) async {
    try {
      await apiService.completeTask(taskId, chosenEdgeLabel: chosenEdgeLabel);
      // Remove task from local list immediately for snappy UX
      _tasks.removeWhere((t) => t.taskId == taskId);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    } catch (_) {
      _error = 'Error de conexión';
      notifyListeners();
      return false;
    }
  }
}
