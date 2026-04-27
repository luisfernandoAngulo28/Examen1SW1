import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';

/// Manages auth state: login, logout, current user.
class AuthProvider extends ChangeNotifier {
  final ApiService apiService;

  AuthProvider(this.apiService);

  User? _user;
  bool _loading = false;
  String? _error;

  User? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;

  Future<bool> tryAutoLogin() async {
    final token = await apiService.getToken();
    if (token == null) return false;
    try {
      _user = await apiService.getMe();
      notifyListeners();
      return true;
    } catch (_) {
      await apiService.clearToken();
      return false;
    }
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      await apiService.login(email, password);
      _user = await apiService.getMe();
      _loading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Error de conexión. Verifica que el backend esté corriendo.';
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await apiService.clearToken();
    _user = null;
    notifyListeners();
  }
}
