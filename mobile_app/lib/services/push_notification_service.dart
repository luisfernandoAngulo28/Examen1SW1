import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'api_service.dart';
import '../models/models.dart';

/// Push notifications via two channels:
///   1. FCM (real push, works when app is closed) — requires real Firebase credentials.
///   2. Polling fallback — polls /cases/my-tasks every 15 s and fires a local
///      notification when new tasks appear. Works immediately without Firebase.
class PushNotificationService {
  final ApiService apiService;

  PushNotificationService(this.apiService);

  static final FlutterLocalNotificationsPlugin _localNotifs =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'workflow_channel',
    'Workflow Notificaciones',
    description: 'Notificaciones de tareas y casos del sistema de workflow',
    importance: Importance.high,
  );

  Timer? _pollTimer;
  Set<String> _knownTaskIds = {};
  bool _pollActive = false;

  // ── Init ──────────────────────────────────────────────────────────────────

  Future<void> init() async {
    await _setupLocalNotifications();
    await _trySetupFcm();
    startPolling();
  }

  Future<void> _setupLocalNotifications() async {
    await _localNotifs
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    const initSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    );
    await _localNotifs.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (_) {},
    );
  }

  Future<void> _trySetupFcm() async {
    try {
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        final token = await messaging.getToken();
        if (token != null) await apiService.registerFcmToken(token);
        messaging.onTokenRefresh.listen((t) => apiService.registerFcmToken(t));
      }

      FirebaseMessaging.onMessage.listen(_showFcmNotification);
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    } catch (_) {
      // Firebase not configured — polling fallback handles notifications
    }
  }

  // ── Polling fallback ──────────────────────────────────────────────────────

  /// Starts polling /cases/my-tasks every 15 s.
  /// Seeds known task IDs on first call so existing tasks don't trigger noise.
  void startPolling() {
    if (_pollActive) return;
    _pollActive = true;
    _seedKnownTasks();
    _pollTimer = Timer.periodic(const Duration(seconds: 15), (_) => _checkNewTasks());
  }

  void stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
    _pollActive = false;
  }

  Future<void> _seedKnownTasks() async {
    try {
      final tasks = await apiService.getMyTasks();
      _knownTaskIds = tasks.map((t) => t.taskId).toSet();
    } catch (_) {}
  }

  Future<void> _checkNewTasks() async {
    try {
      final tasks = await apiService.getMyTasks();
      final currentIds = tasks.map((t) => t.taskId).toSet();
      final newTasks = tasks.where((t) => !_knownTaskIds.contains(t.taskId)).toList();

      for (final task in newTasks) {
        await _showTaskAssignedNotification(task);
      }

      _knownTaskIds = currentIds;
    } catch (_) {}
  }

  Future<void> _showTaskAssignedNotification(MyTaskDto task) async {
    await _localNotifs.show(
      task.taskId.hashCode,
      '📋 Nueva tarea asignada',
      '${task.taskTitle} — ${task.policyName}',
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          styleInformation: BigTextStyleInformation(
            '${task.taskTitle}\nPolítica: ${task.policyName}'
            '${task.department != null ? '\nDepartamento: ${task.department}' : ''}',
          ),
        ),
      ),
    );
  }

  // ── FCM foreground handler ────────────────────────────────────────────────

  void _showFcmNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    _localNotifs.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  }

  void _handleNotificationTap(RemoteMessage message) {
    // Navigation on tap can be added here via a global navigator key
  }

  void dispose() => stopPolling();
}
