import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';

/// Manages the CLIENT's own list of cases (trámites).
class CasesProvider extends ChangeNotifier {
  final ApiService _api;

  CasesProvider(this._api);

  List<Case> _cases = [];
  bool _loading = false;
  String? _error;

  List<Case> get cases => _cases;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadMyCases() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _cases = await _api.getMyCases();
      // Most recent first
      _cases.sort((a, b) {
        final aDate = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bDate = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return bDate.compareTo(aDate);
      });
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Error al cargar los trámites';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<Case?> refreshCase(String caseId) async {
    try {
      final updated = await _api.getCaseById(caseId);
      final idx = _cases.indexWhere((c) => c.id == caseId);
      if (idx >= 0) {
        _cases[idx] = updated;
        notifyListeners();
      }
      return updated;
    } catch (_) {
      return null;
    }
  }
}
