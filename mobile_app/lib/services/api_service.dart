import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/models.dart';

/// Central API client — talks to Spring Boot backend on [baseUrl].
class ApiService {
  // ── Change this to your local IP or cloud URL ──────────────────────────
  static const String _defaultBase = 'http://192.168.0.2:8080/api'; // dispositivo fisico WiFi
  // Para emulador Android: 'http://10.0.2.2:8080/api'
  // For cloud deployment: 'https://your-backend.onrender.com/api'

  final String baseUrl;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService({this.baseUrl = _defaultBase});

  // ── Auth ────────────────────────────────────────────────────────────────

  Future<String?> getToken() => _storage.read(key: 'jwt_token');

  Future<void> saveToken(String token) =>
      _storage.write(key: 'jwt_token', value: token);

  Future<void> clearToken() => _storage.delete(key: 'jwt_token');

  Future<Map<String, String>> _authHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ── Login ───────────────────────────────────────────────────────────────

  /// Returns JWT token on success, throws on failure.
  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    _assertOk(res);
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    await saveToken(data['token'] as String);
    return data;
  }

  Future<User> getMe() async {
    final res = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: await _authHeaders(),
    );
    _assertOk(res);
    return User.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  /// Register FCM device token with the backend for push notifications.
  Future<void> registerFcmToken(String fcmToken) async {
    final headers = await _authHeaders();
    await http.put(
      Uri.parse('$baseUrl/auth/fcm-token'),
      headers: headers,
      body: jsonEncode({'fcmToken': fcmToken}),
    );
    // Best-effort — ignore errors
  }

  // ── My Tasks ─────────────────────────────────────────────────────────────

  Future<List<MyTaskDto>> getMyTasks() async {
    final res = await http.get(
      Uri.parse('$baseUrl/cases/my-tasks'),
      headers: await _authHeaders(),
    );
    _assertOk(res);
    final list = jsonDecode(res.body) as List<dynamic>;
    return list
        .map((e) => MyTaskDto.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // ── Cases ─────────────────────────────────────────────────────────────────

  Future<Case> getCaseById(String id) async {
    final res = await http.get(
      Uri.parse('$baseUrl/cases/$id'),
      headers: await _authHeaders(),
    );
    _assertOk(res);
    return Case.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<List<Case>> getAllCases() async {
    final res = await http.get(
      Uri.parse('$baseUrl/cases'),
      headers: await _authHeaders(),
    );
    _assertOk(res);
    final list = jsonDecode(res.body) as List<dynamic>;
    return list
        .map((e) => Case.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Returns the cases initiated by this CLIENT user
  Future<List<Case>> getMyCases() async {
    final res = await http.get(
      Uri.parse('$baseUrl/cases/my-cases'),
      headers: await _authHeaders(),
    );
    _assertOk(res);
    final list = jsonDecode(res.body) as List<dynamic>;
    return list.map((e) => Case.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Start a new case as a CLIENT — the backend auto-links clientId
  Future<Case> startMyCase(String policyId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/cases'),
      headers: await _authHeaders(),
      body: jsonEncode({'policyId': policyId}),
    );
    _assertOk(res);
    return Case.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  /// Complete a task. [chosenEdgeLabel] is required only for DECISION nodes.
  Future<Case> completeTask(String taskId, {String? chosenEdgeLabel}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/cases/tasks/$taskId/complete'),
      headers: await _authHeaders(),
      body: jsonEncode({
        if (chosenEdgeLabel != null) 'chosenEdgeLabel': chosenEdgeLabel,
      }),
    );
    _assertOk(res);
    return Case.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  // ── NLP form fill (FastAPI via Spring Boot proxy) ─────────────────────────

  Future<Map<String, dynamic>> nlpFillForm({
    required String transcript,
    required List<Map<String, dynamic>> fields,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/ai-assistant/nlp/fill-form'),
      headers: await _authHeaders(),
      body: jsonEncode({'transcript': transcript, 'fields': fields}),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    return {};
  }

  // ── AI prompt ─────────────────────────────────────────────────────────────

  Future<String> sendPrompt(String prompt) async {
    final res = await http.post(
      Uri.parse('$baseUrl/ai-assistant/prompt'),
      headers: await _authHeaders(),
      body: jsonEncode({'prompt': prompt}),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return data['message'] as String? ?? '';
    }
    return '';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  void _assertOk(http.Response res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      String message = 'Error ${res.statusCode}';
      try {
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        message = body['message'] as String? ?? message;
      } catch (_) {}
      throw ApiException(message, res.statusCode);
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);

  @override
  String toString() => 'ApiException($statusCode): $message';
}
