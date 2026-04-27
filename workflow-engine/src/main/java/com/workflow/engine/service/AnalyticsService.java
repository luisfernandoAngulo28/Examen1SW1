package com.workflow.engine.service;

import com.workflow.engine.model.*;
import com.workflow.engine.repository.CaseRepository;
import com.workflow.engine.repository.DepartmentRepository;
import com.workflow.engine.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final CaseRepository caseRepository;
    private final PolicyRepository policyRepository;
    private final DepartmentRepository departmentRepository;

    // ─── Dashboard Stats ──────────────────────────────────────────────────────

    public Map<String, Object> getDashboardStats() {
        List<Case> allCases = caseRepository.findAll();

        long totalCases = allCases.size();
        long activeCases = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS || c.getStatus() == CaseStatus.OPEN)
                .count();
        long completedCases = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.COMPLETED)
                .count();
        long cancelledCases = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.CANCELLED)
                .count();

        List<Task> allTasks = allCases.stream()
                .flatMap(c -> c.getTasks().stream())
                .toList();

        long totalTasks = allTasks.size();
        long pendingTasks = allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                .count();

        // tasks per department — we need to join task → node → department via policy
        Map<String, Integer> deptTaskCount = new HashMap<>();
        Map<String, Department> deptCache = new HashMap<>();
        departmentRepository.findAll().forEach(d -> deptCache.put(d.getId(), d));

        for (Case c : allCases) {
            Policy policy = policyRepository.findById(c.getPolicyId()).orElse(null);
            if (policy == null) continue;
            Map<String, String> nodeIdToDeptId = policy.getNodes().stream()
                    .filter(n -> n.getDepartmentId() != null)
                    .collect(Collectors.toMap(PolicyNode::getId, PolicyNode::getDepartmentId));

            for (Task t : c.getTasks()) {
                String deptId = nodeIdToDeptId.get(t.getNodeId());
                if (deptId == null) continue;
                Department dept = deptCache.get(deptId);
                String deptName = dept != null ? dept.getName() : "Sin departamento";
                deptTaskCount.merge(deptName, 1, Integer::sum);
            }
        }

        List<Map<String, Object>> tasksPerDepartment = deptTaskCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(e -> Map.<String, Object>of("name", e.getKey(), "count", e.getValue()))
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalCases", totalCases);
        result.put("activeCases", activeCases);
        result.put("completedCases", completedCases);
        result.put("cancelledCases", cancelledCases);
        result.put("totalTasks", totalTasks);
        result.put("pendingTasks", pendingTasks);
        result.put("tasksPerDepartment", tasksPerDepartment);
        return result;
    }

    // ─── Per-Policy Analytics ─────────────────────────────────────────────────

    public Map<String, Object> getPolicyAnalytics(String policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Política no encontrada"));

        List<Case> cases = caseRepository.findByPolicyId(policyId);

        long totalCases = cases.size();
        long completedCases = cases.stream()
                .filter(c -> c.getStatus() == CaseStatus.COMPLETED)
                .count();

        // average case duration in minutes (only completed cases with both timestamps)
        double avgCaseDurationMinutes = cases.stream()
                .filter(c -> c.getStatus() == CaseStatus.COMPLETED
                        && c.getStartedAt() != null && c.getFinishedAt() != null)
                .mapToLong(c -> Duration.between(c.getStartedAt(), c.getFinishedAt()).toMinutes())
                .average()
                .orElse(0.0);

        // Aggregate tasks by nodeId
        Map<String, String> deptCache = new HashMap<>();
        departmentRepository.findAll().forEach(d -> deptCache.put(d.getId(), d.getName()));

        Map<String, List<Task>> tasksByNode = new HashMap<>();
        for (Case c : cases) {
            for (Task t : c.getTasks()) {
                tasksByNode.computeIfAbsent(t.getNodeId(), k -> new ArrayList<>()).add(t);
            }
        }

        // Compute per-node stats
        List<Map<String, Object>> nodeStats = new ArrayList<>();
        for (PolicyNode node : policy.getNodes()) {
            if (node.getNodeType() == NodeType.INITIAL || node.getNodeType() == NodeType.FINAL) continue;

            List<Task> nodeTasks = tasksByNode.getOrDefault(node.getId(), List.of());

            long totalNodeTasks = nodeTasks.size();
            long pendingNodeTasks = nodeTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                    .count();

            double avgDurationMin = nodeTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE
                            && t.getStartedAt() != null && t.getFinishedAt() != null)
                    .mapToLong(t -> Duration.between(t.getStartedAt(), t.getFinishedAt()).toMinutes())
                    .average()
                    .orElse(0.0);

            String deptName = node.getDepartmentId() != null
                    ? deptCache.getOrDefault(node.getDepartmentId(), "Sin departamento")
                    : "Sin departamento";

            Map<String, Object> stat = new LinkedHashMap<>();
            stat.put("nodeId", node.getId());
            stat.put("nodeTitle", node.getTitle());
            stat.put("departmentName", deptName);
            stat.put("avgDurationMinutes", Math.round(avgDurationMin));
            stat.put("totalTasks", totalNodeTasks);
            stat.put("pendingTasks", pendingNodeTasks);
            stat.put("isBottleneck", false); // set below
            nodeStats.add(stat);
        }

        // Bottleneck detection: pendingTasks >= 3 OR avgDuration > globalAvg * 1.5
        double globalAvg = nodeStats.stream()
                .mapToLong(s -> (long) s.get("avgDurationMinutes"))
                .average().orElse(0.0);

        for (Map<String, Object> stat : nodeStats) {
            long pending = (long) stat.get("pendingTasks");
            long avg = (long) stat.get("avgDurationMinutes");
            boolean isBottleneck = pending >= 3 || (globalAvg > 0 && avg > globalAvg * 1.5);
            stat.put("isBottleneck", isBottleneck);
        }

        List<Map<String, Object>> bottlenecks = nodeStats.stream()
                .filter(s -> (boolean) s.get("isBottleneck"))
                .toList();

        // AI-style insights based on real data
        List<Map<String, Object>> aiInsights = generateInsights(nodeStats, bottlenecks, totalCases, completedCases, avgCaseDurationMinutes);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("policyId", policyId);
        result.put("policyName", policy.getName());
        result.put("totalCases", totalCases);
        result.put("completedCases", completedCases);
        result.put("avgCaseDurationMinutes", Math.round(avgCaseDurationMinutes));
        result.put("nodeStats", nodeStats);
        result.put("bottlenecks", bottlenecks);
        result.put("aiInsights", aiInsights);
        return result;
    }

    // ─── Insight Generation ───────────────────────────────────────────────────

    private List<Map<String, Object>> generateInsights(
            List<Map<String, Object>> nodeStats,
            List<Map<String, Object>> bottlenecks,
            long totalCases, long completedCases, double avgDurationMin) {

        List<Map<String, Object>> insights = new ArrayList<>();

        // Bottleneck insights
        for (Map<String, Object> bn : bottlenecks) {
            long pending = (long) bn.get("pendingTasks");
            insights.add(insight("critical",
                    "Cuello de botella en \"" + bn.get("nodeTitle") + "\" (" + bn.get("departmentName") + "): " + pending + " tarea(s) acumulada(s).",
                    "Asignar más personal al departamento " + bn.get("departmentName") + " o revisar los requisitos de esta actividad."));
        }

        // Completion rate
        if (totalCases > 0) {
            double completionRate = (double) completedCases / totalCases;
            if (completionRate < 0.4) {
                insights.add(insight("warning",
                        "Tasa de completitud baja (" + Math.round(completionRate * 100) + "%). La mayoría de trámites quedan sin terminar.",
                        "Revisar si los formularios o requisitos están bloqueando el avance de los trámites."));
            } else if (completionRate > 0.8) {
                insights.add(insight("success",
                        "Excelente tasa de completitud (" + Math.round(completionRate * 100) + "%). El flujo funciona eficientemente.",
                        "Mantener los tiempos de respuesta actuales y documentar las buenas prácticas."));
            }
        }

        // Duration insights
        if (avgDurationMin > 120) {
            insights.add(insight("warning",
                    "La duración promedio es elevada (" + Math.round(avgDurationMin) + " min). Los trámites tardan más de 2 horas.",
                    "Identificar los pasos con mayor demora y evaluar automatización o aprobación delegada."));
        } else if (avgDurationMin > 0 && avgDurationMin < 15) {
            insights.add(insight("info",
                    "Los trámites se completan muy rápido (" + Math.round(avgDurationMin) + " min). Verificar que los formularios capturen toda la información necesaria.",
                    "Revisar si se están aplicando correctamente todos los controles definidos en la política."));
        }

        // High pending tasks globally
        long totalPending = nodeStats.stream().mapToLong(s -> (long) s.get("pendingTasks")).sum();
        if (totalPending > 5 && bottlenecks.isEmpty()) {
            insights.add(insight("info",
                    totalPending + " tareas pendientes distribuidas uniformemente entre las actividades.",
                    "La carga está distribuida pero considere priorizar tareas con mayor antigüedad."));
        }

        // No cases yet
        if (totalCases == 0) {
            insights.add(insight("info",
                    "Aún no hay trámites iniciados bajo esta política.",
                    "Iniciar trámites de prueba para validar el flujo antes del despliegue en producción."));
        }

        return insights;
    }

    private Map<String, Object> insight(String severity, String message, String action) {
        return Map.of("severity", severity, "message", message, "action", action);
    }
}
