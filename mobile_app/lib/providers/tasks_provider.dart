import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../services/api_service.dart';

/// Manages the list of pending tasks for the logged-in OFFICER user.
/// Tasks are cached in SharedPreferences so they remain visible offline.
class TasksProvider extends ChangeNotifier {
  final ApiService apiService;

  TasksProvider(this.apiService);

  List<MyTaskDto> _tasks = [];
  bool _loading = false;
  String? _error;
  bool _isOffline = false;

  List<MyTaskDto> get tasks => _tasks;
  bool get loading => _loading;
  String? get error => _error;
  bool get isOffline => _isOffline;

  static const _cacheKey = 'cached_my_tasks';

  Future<void> loadMyTasks() async {
    _loading = true;
    _error = null;
    _isOffline = false;
    notifyListeners();
    try {
      _tasks = await apiService.getMyTasks();
      await _saveCache(_tasks);
    } on ApiException catch (e) {
      _error = e.message;
      await _loadFromCache();
    } catch (_) {
      _isOffline = true;
      await _loadFromCache();
      if (_tasks.isEmpty) {
        _error = 'Sin conexión — no hay tareas en caché';
      } else {
        _error = null;
      }
    }
    _loading = false;
    notifyListeners();
  }

  Future<bool> completeTask(String taskId, {String? chosenEdgeLabel}) async {
    try {
      await apiService.completeTask(taskId, chosenEdgeLabel: chosenEdgeLabel);
      _tasks.removeWhere((t) => t.taskId == taskId);
      await _saveCache(_tasks);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    } catch (_) {
      _error = 'Sin conexión — no se pudo completar la tarea';
      notifyListeners();
      return false;
    }
  }

  Future<void> _saveCache(List<MyTaskDto> tasks) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final json = jsonEncode(tasks.map((t) => t.toJson()).toList());
      await prefs.setString(_cacheKey, json);
    } catch (_) {}
  }

  Future<void> _loadFromCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final json = prefs.getString(_cacheKey);
      if (json != null) {
        final list = jsonDecode(json) as List<dynamic>;
        _tasks = list.map((e) => MyTaskDto.fromJson(e as Map<String, dynamic>)).toList();
        _isOffline = true;
      }
    } catch (_) {}
  }
}
