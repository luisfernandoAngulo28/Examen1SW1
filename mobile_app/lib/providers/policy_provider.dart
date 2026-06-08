import 'package:flutter/foundation.dart';
import '../models/policy_models.dart';
import '../services/api_service.dart';

class PolicyProvider extends ChangeNotifier {
  final ApiService _api;

  List<PolicyModel> _policies = [];
  List<Department> _departments = [];
  bool _loading = false;
  String? _error;

  PolicyProvider(this._api);

  List<PolicyModel> get policies => _policies;
  List<Department> get departments => _departments;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadPolicies() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _policies = await _api.getPolicies();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> loadDepartments() async {
    try {
      _departments = await _api.getDepartments();
      notifyListeners();
    } catch (_) {}
  }

  Future<PolicyModel?> createPolicy(String name) async {
    try {
      final p = await _api.createPolicy(name);
      _policies = [p, ..._policies];
      notifyListeners();
      return p;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<PolicyModel?> loadPolicyById(String id) async {
    try {
      return await _api.getPolicyById(id);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> saveGraph(
    String policyId, {
    required List<PolicyNode> nodes,
    required List<PolicyEdge> edges,
  }) async {
    try {
      final updated = await _api.updatePolicyGraph(
        policyId,
        nodes: nodes,
        edges: edges,
      );
      final idx = _policies.indexWhere((p) => p.id == policyId);
      if (idx >= 0) _policies[idx] = updated;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deletePolicy(String id) async {
    try {
      await _api.deletePolicy(id);
      _policies.removeWhere((p) => p.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
