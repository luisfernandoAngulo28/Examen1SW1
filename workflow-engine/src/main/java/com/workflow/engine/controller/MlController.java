package com.workflow.engine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.engine.model.*;
import com.workflow.engine.repository.CaseRepository;
import com.workflow.engine.repository.DepartmentRepository;
import com.workflow.engine.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ML predictions endpoint — Mejora 5 (Ciclo 2).
 *
 * GET /api/ml/dashboard  — resumen completo para el dashboard (riesgo + prioridad + anomalías)
 *
 * Flujo:
 *   1. Computa features desde MongoDB (casos activos, tareas, histórico)
 *   2. Llama al ml-service TensorFlow para obtener predicciones
 *   3. Si ml-service no disponible → usa heurísticas locales de respaldo
 */
@Slf4j
@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MlController {

    @Value("${ml.service.url:}")
    private String mlServiceUrl;

    private final CaseRepository caseRepository;
    private final PolicyRepository policyRepository;
    private final DepartmentRepository departmentRepository;
    private final ObjectMapper objectMapper;

    // ── Dashboard predictions ─────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        try {
        return dashboardInternal();
        } catch (Exception e) {
            log.error("ML dashboard error: {}", e.getMessage(), e);
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("delayRisk", List.of());
            fallback.put("priority", List.of());
            fallback.put("anomalies", List.of());
            fallback.put("activeCases", 0);
            fallback.put("mlAvailable", false);
            return ResponseEntity.ok(fallback);
        }
    }

    private ResponseEntity<Map<String, Object>> dashboardInternal() {
        List<Case> activeCases = caseRepository.findAll().stream()
                .filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS || c.getStatus() == CaseStatus.OPEN)
                .toList();

        // Build policy + department caches
        Map<String, Policy> policyCache = new HashMap<>();
        policyRepository.findAll().forEach(p -> policyCache.put(p.getId(), p));

        Map<String, String> deptNames = new HashMap<>();
        departmentRepository.findAll().forEach(d -> deptNames.put(d.getId(), d.getName()));

        // Compute global dept load for normalization
        Map<String, Long> deptPendingCount = new HashMap<>();
        for (Case c : activeCases) {
            Policy p = policyCache.get(c.getPolicyId());
            if (p == null) continue;
            Map<String, String> nodeIdToDeptId = p.getNodes().stream()
                    .filter(n -> n.getDepartmentId() != null)
                    .collect(Collectors.toMap(PolicyNode::getId, PolicyNode::getDepartmentId));
            for (Task t : c.getTasks()) {
                if (t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS) {
                    String deptId = nodeIdToDeptId.get(t.getNodeId());
                    if (deptId != null) deptPendingCount.merge(deptId, 1L, Long::sum);
                }
            }
        }
        long maxDeptPending = deptPendingCount.values().stream().mapToLong(v -> v).max().orElse(1L);

        // ── Build delay-risk features ──────────────────────────────────────────
        List<Map<String, Object>> riskFeatures = new ArrayList<>();
        for (Case c : activeCases) {
            double hoursElapsed = c.getStartedAt() != null
                    ? Duration.between(c.getStartedAt(), Instant.now()).toMinutes() / 60.0 : 0;
            long totalTasks   = c.getTasks().size();
            long pendingTasks = c.getTasks().stream()
                    .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                    .count();

            Policy p = policyCache.get(c.getPolicyId());
            double complexity = p != null
                    ? p.getNodes().stream().filter(n -> n.getFormTemplate() != null).count() / Math.max(p.getNodes().size(), 1.0)
                    : 0.3;

            Map<String, Object> feat = new LinkedHashMap<>();
            feat.put("case_id", c.getId());
            feat.put("hours_elapsed", hoursElapsed);
            feat.put("pending_task_ratio", totalTasks > 0 ? (double) pendingTasks / totalTasks : 0);
            feat.put("dept_load_ratio", 0.5); // placeholder
            feat.put("task_complexity", complexity);
            feat.put("sla_ratio", hoursElapsed / 48.0); // assume 48h SLA
            riskFeatures.add(feat);
        }

        // ── Build priority features for pending tasks ──────────────────────────
        List<Map<String, Object>> priorityFeatures = new ArrayList<>();
        for (Case c : activeCases) {
            Policy p = policyCache.get(c.getPolicyId());
            if (p == null) continue;
            Map<String, PolicyNode> nodeMap = p.getNodes().stream()
                    .collect(Collectors.toMap(PolicyNode::getId, n -> n));

            for (Task t : c.getTasks()) {
                if (t.getStatus() != TaskStatus.PENDING && t.getStatus() != TaskStatus.IN_PROGRESS) continue;

                PolicyNode node = nodeMap.get(t.getNodeId());
                if (node == null) continue;

                double hoursWaiting = t.getStartedAt() != null
                        ? Duration.between(t.getStartedAt(), Instant.now()).toMinutes() / 60.0
                        : Duration.between(c.getStartedAt(), Instant.now()).toMinutes() / 60.0;

                String deptId = node.getDepartmentId();
                long deptLoad = deptId != null ? deptPendingCount.getOrDefault(deptId, 0L) : 0;
                double deptOverload = (double) deptLoad / maxDeptPending;

                Map<String, Object> feat = new LinkedHashMap<>();
                feat.put("task_id", t.getId());
                feat.put("task_title", node.getTitle() != null ? node.getTitle() : "Tarea");
                feat.put("department", deptId != null ? deptNames.getOrDefault(deptId, "Sin dept") : "Sin dept");
                feat.put("hours_waiting", hoursWaiting);
                feat.put("sla_breach", hoursWaiting > 48 ? 1.0 : 0.0);
                feat.put("case_risk", 0.5); // will be updated after risk prediction
                feat.put("dept_overload", deptOverload);
                feat.put("client_case", c.getClientId() != null ? 1.0 : 0.0);
                feat.put("is_blocking", 0.0);
                priorityFeatures.add(feat);
            }
        }

        // ── Build anomaly features ─────────────────────────────────────────────
        List<Case> allCases = caseRepository.findAll();
        double avgDuration = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.COMPLETED && c.getStartedAt() != null && c.getFinishedAt() != null)
                .mapToLong(c -> Duration.between(c.getStartedAt(), c.getFinishedAt()).toMinutes())
                .average().orElse(120.0);

        List<Map<String, Object>> anomalyFeatures = new ArrayList<>();
        for (Case c : activeCases) {
            double hoursElapsed = c.getStartedAt() != null
                    ? Duration.between(c.getStartedAt(), Instant.now()).toMinutes() / 60.0 : 0;
            double durationRatio = avgDuration > 0 ? (hoursElapsed * 60) / avgDuration : 1.0;

            Policy p = policyCache.get(c.getPolicyId());
            String pName = p != null ? p.getName() : "—";

            Map<String, Object> feat = new LinkedHashMap<>();
            feat.put("case_id", c.getId());
            feat.put("policy_name", pName);
            feat.put("duration_ratio", Math.min(durationRatio, 5.0));
            feat.put("task_skip_ratio", 0.0);
            feat.put("reassign_count", Math.min(c.getEventLogs().size() / 10.0, 1.0));
            feat.put("event_density", Math.min(c.getEventLogs().size() / Math.max(hoursElapsed, 1) / 5.0, 1.0));
            anomalyFeatures.add(feat);
        }

        // ── Call ml-service ────────────────────────────────────────────────────
        List<Map<String, Object>> riskResults    = callMl("/predict/delay-risk", riskFeatures);
        List<Map<String, Object>> priorityResults = callMl("/predict/priority", priorityFeatures);
        List<Map<String, Object>> anomalyResults  = callMl("/predict/anomalies", anomalyFeatures);

        // ── Fallback if ml-service unavailable ─────────────────────────────────
        if (riskResults == null)    riskResults    = heuristicRisk(riskFeatures);
        if (priorityResults == null) priorityResults = heuristicPriority(priorityFeatures);
        if (anomalyResults == null)  anomalyResults  = heuristicAnomaly(anomalyFeatures);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("delayRisk",    riskResults);
        response.put("priority",     priorityResults.stream().limit(10).toList());
        response.put("anomalies",    anomalyResults.stream().filter(r -> Boolean.TRUE.equals(r.get("is_anomaly"))).toList());
        response.put("activeCases",  activeCases.size());
        response.put("mlAvailable",  mlServiceUrl != null && !mlServiceUrl.isBlank());
        return ResponseEntity.ok(response);
    }

    // ── ML-service HTTP proxy ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> callMl(String path, List<Map<String, Object>> body) {
        if (mlServiceUrl == null || mlServiceUrl.isBlank() || body.isEmpty()) return null;
        try {
            String json = objectMapper.writeValueAsString(body);
            var client = java.net.http.HttpClient.newBuilder()
                    .connectTimeout(java.time.Duration.ofSeconds(5)).build();
            var req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(mlServiceUrl + path))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json))
                    .timeout(java.time.Duration.ofSeconds(15)).build();
            var resp = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return objectMapper.readValue(resp.body(), List.class);
            }
        } catch (Exception ignored) {}
        return null;
    }

    // ── Local heuristics fallback ─────────────────────────────────────────────

    private List<Map<String, Object>> heuristicRisk(List<Map<String, Object>> features) {
        return features.stream().map(f -> {
            double hours  = toDouble(f.get("hours_elapsed"));
            double pending = toDouble(f.get("pending_task_ratio"));
            double sla    = toDouble(f.get("sla_ratio"));
            double score  = Math.min((hours / 96 * 0.4 + pending * 0.35 + sla * 0.25), 1.0);
            String level  = score < 0.35 ? "LOW" : score < 0.65 ? "MEDIUM" : "HIGH";
            return Map.of("case_id", f.get("case_id"), "risk_score", round(score),
                    "risk_level", level, "recommendation",
                    level.equals("HIGH") ? "Intervención recomendada." :
                    level.equals("MEDIUM") ? "Monitorear el avance." : "Avance normal.");
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> heuristicPriority(List<Map<String, Object>> features) {
        return features.stream().map(f -> {
            double h = toDouble(f.get("hours_waiting"));
            double o = toDouble(f.get("dept_overload"));
            double c = toDouble(f.get("client_case"));
            double score = Math.min(h / 48 * 40 + o * 30 + c * 20, 100.0);
            String label = score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "NORMAL" : "LOW";
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("task_id", f.get("task_id")); r.put("task_title", f.get("task_title"));
            r.put("department", f.get("department")); r.put("priority_score", round(score));
            r.put("priority_label", label);
            return r;
        }).sorted((a, b) -> Double.compare(toDouble(b.get("priority_score")), toDouble(a.get("priority_score"))))
          .collect(Collectors.toList());
    }

    private List<Map<String, Object>> heuristicAnomaly(List<Map<String, Object>> features) {
        return features.stream().map(f -> {
            double dr = toDouble(f.get("duration_ratio"));
            boolean anomaly = dr > 2.0;
            double score = Math.min(dr / 2.0, 2.0);
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("case_id", f.get("case_id")); r.put("policy_name", f.get("policy_name"));
            r.put("is_anomaly", anomaly); r.put("score", round(score));
            r.put("reconstruction_error", 0.0);
            r.put("description", anomaly ? "Duración muy superior al promedio histórico." : "Flujo normal.");
            return r;
        }).collect(Collectors.toList());
    }

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        if (v instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return 0.0; }
    }

    private double round(double v) { return Math.round(v * 1000.0) / 1000.0; }
}
