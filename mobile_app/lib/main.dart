import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/api_service.dart';
import 'services/push_notification_service.dart';
import 'services/websocket_service.dart';
import 'providers/auth_provider.dart';
import 'providers/tasks_provider.dart';
import 'providers/cases_provider.dart';
import 'providers/policy_provider.dart';
import 'screens/login_screen.dart';
import 'screens/tasks_screen.dart';
import 'screens/tracking_screen.dart';
import 'screens/policy_list_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try { await Firebase.initializeApp(); } catch (_) {}
  runApp(const WorkflowApp());
}

class WorkflowApp extends StatelessWidget {
  const WorkflowApp({super.key});
  @override
  Widget build(BuildContext context) {
    final apiService = ApiService();
    final wsService = WebSocketService(ApiService.defaultBase);
    return MultiProvider(
      providers: [
        Provider<ApiService>.value(value: apiService),
        ChangeNotifierProvider<WebSocketService>.value(value: wsService),
        ChangeNotifierProvider(create: (_) => AuthProvider(apiService)),
        ChangeNotifierProvider(create: (_) => TasksProvider(apiService)),
        ChangeNotifierProvider(create: (_) => CasesProvider(apiService)),
        ChangeNotifierProvider(create: (_) => PolicyProvider(apiService)),
      ],
      child: MaterialApp(
        title: 'Workflow SW1',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1565C0), brightness: Brightness.light),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(centerTitle: false),
          cardTheme: CardThemeData(elevation: 2, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        ),
        darkTheme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1565C0), brightness: Brightness.dark),
          useMaterial3: true,
        ),
        home: const _SplashRouter(),
      ),
    );
  }
}

class _SplashRouter extends StatefulWidget {
  const _SplashRouter();
  @override
  State<_SplashRouter> createState() => _SplashRouterState();
}

class _SplashRouterState extends State<_SplashRouter> {
  bool _checking = true;
  @override
  void initState() { super.initState(); _checkAuth(); }

  Future<void> _checkAuth() async {
    final auth = context.read<AuthProvider>();
    final api = context.read<ApiService>();
    final ws = context.read<WebSocketService>();
    final loggedIn = await auth.tryAutoLogin();
    if (loggedIn) {
      try { final push = PushNotificationService(api); await push.init(); } catch (_) {}
      ws.connect();
    }
    if (mounted) setState(() => _checking = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_checking) {
      return const Scaffold(body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.account_tree_rounded, size: 64, color: Color(0xFF1565C0)),
        SizedBox(height: 16),
        Text('Workflow SW1', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        SizedBox(height: 16),
        CircularProgressIndicator(),
      ])));
    }
    final auth = context.read<AuthProvider>();
    if (!auth.isLoggedIn) return const LoginScreen();
    final role = auth.user?.role ?? '';
    if (role == 'CLIENT') return const TrackingScreen();
    if (role == 'DESIGNER') return const PolicyListScreen();
    return const TasksScreen();
  }
}