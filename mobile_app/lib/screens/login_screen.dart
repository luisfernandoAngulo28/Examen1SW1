import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/push_notification_service.dart';
import '../services/websocket_service.dart';
import 'tasks_screen.dart';
import 'tracking_screen.dart';
import 'policy_list_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController(text: 'rrhh@demo.com');
  final _passCtrl = TextEditingController(text: 'Admin1234!');
  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final apiService = context.read<ApiService>();
    final ok = await auth.login(_emailCtrl.text.trim(), _passCtrl.text);
    if (ok) {
      try {
        final push = PushNotificationService(apiService);
        await push.init();
      } catch (_) {}

      if (!mounted) return;
      context.read<WebSocketService>().connect();

      final role = auth.user?.role ?? '';
      final destination = switch (role) {
        'CLIENT' => const TrackingScreen(),
        'DESIGNER' => const PolicyListScreen(),
        _ => const TasksScreen(),
      };
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => destination),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo / Header
                  Icon(Icons.account_tree_rounded, size: 72, color: colors.primary),
                  const SizedBox(height: 16),
                  Text(
                    'Workflow SW1',
                    style: Theme.of(context)
                        .textTheme
                        .headlineMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Inicia sesión para ver tus tareas',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: colors.onSurface.withValues(alpha: 0.6),
                        ),
                  ),
                  const SizedBox(height: 40),

                  // Email
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Correo electrónico',
                      prefixIcon: Icon(Icons.email_outlined),
                      border: OutlineInputBorder(),
                    ),
                    validator: (v) =>
                        (v == null || !v.contains('@')) ? 'Correo inválido' : null,
                  ),
                  const SizedBox(height: 16),

                  // Password
                  TextFormField(
                    controller: _passCtrl,
                    obscureText: _obscure,
                    decoration: InputDecoration(
                      labelText: 'Contraseña',
                      prefixIcon: const Icon(Icons.lock_outlined),
                      border: const OutlineInputBorder(),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure
                            ? Icons.visibility_off
                            : Icons.visibility),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),
                    validator: (v) =>
                        (v == null || v.length < 6) ? 'Mínimo 6 caracteres' : null,
                  ),
                  const SizedBox(height: 8),

                  // Error message
                  if (auth.error != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        auth.error!,
                        style: TextStyle(color: colors.error),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  const SizedBox(height: 16),

                  // Login button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton(
                      onPressed: auth.loading ? null : _submit,
                      child: auth.loading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Iniciar sesión'),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Demo credentials hint
                  ExpansionTile(
                    title: const Text('Credenciales de demo'),
                    tilePadding: EdgeInsets.zero,
                    children: [
                      _credRow('rrhh@demo.com', 'OFFICER'),
                      _credRow('legal@demo.com', 'OFFICER'),
                      _credRow('finanzas@demo.com', 'OFFICER'),
                      _credRow('disenador@demo.com', 'DESIGNER'),
                      const Padding(
                        padding: EdgeInsets.only(top: 4, bottom: 8),
                        child: Text('Contraseña: Admin1234!',
                            style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _credRow(String email, String role) => ListTile(
        dense: true,
        contentPadding: EdgeInsets.zero,
        leading: const Icon(Icons.person_outline, size: 18),
        title: Text(email, style: const TextStyle(fontSize: 13)),
        trailing: Chip(
          label: Text(role, style: const TextStyle(fontSize: 10)),
          padding: EdgeInsets.zero,
        ),
        onTap: () {
          _emailCtrl.text = email;
          _passCtrl.text = 'Admin1234!';
        },
      );
}
