import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

/// Event received from /topic/events
class WsEvent {
  final String type;
  final Map<String, dynamic> data;
  const WsEvent({required this.type, required this.data});
}

/// Manages the STOMP WebSocket connection to the Spring Boot backend.
/// Exposes [events] stream — consumers filter by [WsEvent.type].
class WebSocketService extends ChangeNotifier {
  final String _wsUrl;

  StompClient? _client;
  final _controller = StreamController<WsEvent>.broadcast();
  bool _connected = false;

  bool get connected => _connected;
  Stream<WsEvent> get events => _controller.stream;

  WebSocketService(String apiBaseUrl)
      : _wsUrl = _buildWsUrl(apiBaseUrl);

  static String _buildWsUrl(String apiBase) {
    final base = apiBase
        .replaceFirst('/api', '')
        .replaceFirst('http://', 'ws://')
        .replaceFirst('https://', 'wss://');
    return '$base/ws/websocket';
  }

  void connect() {
    if (_client != null) return;
    _client = StompClient(
      config: StompConfig(
        url: _wsUrl,
        reconnectDelay: const Duration(seconds: 5),
        onConnect: _onConnect,
        onDisconnect: (_) {
          _connected = false;
          notifyListeners();
        },
        onWebSocketError: (e) {
          _connected = false;
          notifyListeners();
        },
      ),
    );
    _client!.activate();
  }

  void _onConnect(StompFrame _) {
    _connected = true;
    notifyListeners();
    _client!.subscribe(
      destination: '/topic/events',
      callback: (frame) {
        if (frame.body == null) return;
        try {
          final json = jsonDecode(frame.body!) as Map<String, dynamic>;
          final event = WsEvent(
            type: json['type'] as String? ?? '',
            data: json['data'] as Map<String, dynamic>? ?? {},
          );
          _controller.add(event);
        } catch (_) {}
      },
    );
  }

  void disconnect() {
    _client?.deactivate();
    _client = null;
    _connected = false;
    notifyListeners();
  }

  @override
  void dispose() {
    disconnect();
    _controller.close();
    super.dispose();
  }
}
