package com.workflow.engine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.engine.model.*;
import com.workflow.engine.repository.CaseRepository;
import com.workflow.engine.repository.DepartmentRepository;
import com.workflow.engine.repository.PolicyRepository;
import com.workflow.engine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Reports endpoint — generación dinámica de reportes por lenguaje natural.
 *
 * Flujo:
 *   1. POST /api/reports/query  recibe {query: "texto libre"}
 *   2. Llama al ai-service para parsear la query → ReportSpec
 *   3. Ejecuta la consulta sobre MongoDB usando los filtros del spec
 *   4. Retorna {title, reportType, rows[], summary{}}
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    @Value("${ai.service.url:}")
    private String aiServiceUrl;

    private final CaseRepository caseRepository;
    private final PolicyRepository policyRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // ── Natural-language report endpoint ──────────────────────────────────────

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> query(@RequestBody Map<String, String> body) {
        String nlQuery = body.getOrDefault("query", "").trim();
        if (nlQuery.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query vacía"));
        }

        // Parse the NL query via ai-service (or local fallback)
        Map<String, Object> spec = parseQuerySpec(nlQuery);

        String reportType = (String) spec.getOrDefault("reportType", "general_summary");
        String title      = (String) spec.getOrDefault("title", "Reporte");
        Map<String, Object> filters = (Map<String, Object>) spec.getOrDefault("filters", Map.of());

        // Execute the report
        Map<String, Object> result = executeReport(reportType, filters);
        result.put("title", title);
        result.put("reportType", reportType);
        result.put("query", nlQuery);
        result.put("generatedAt", Instant.now().toString());

        return ResponseEntity.ok(result);
    }

    // ── Report execution ──────────────────────────────────────────────────────

    private Map<String, Object> executeReport(String reportType, Map<String, Object> filters) {
        return switch (reportType) {
            case "cases_by_date"    -> reportCasesByDate(filters);
            case "cases_by_status"  -> reportCasesByStatus(filters);
            case "cases_by_policy"  -> reportCasesByPolicy(filters);
            case "tasks_by_dept"    -> reportTasksByDept(filters);
            case "bottleneck_summary" -> reportBottlenecks(filters);
            default                 -> reportGeneralSummary();
        };
    }

    private Map<String, Object> reportCasesByDate(Map<String, Object> filters) {
        Instant from = parseDate((String) filters.get("fromDate"), Instant.EPOCH);
        Instant to   = parseDate((String) filters.get("toDate"), Instant.now());
        String status = (String) filters.get("status");

        // Build policy cache
        Map<String, String> policyNames = new HashMap<>();
        policyRepository.findAll().forEach(p -> policyNames.put(p.getId(), p.getName()));

        List<Case> cases = caseRepository.findAll().stream()
                .filter(c -> c.getStartedAt() != null
                        && !c.getStartedAt().isBefore(from)
                        && !c.getStartedAt().isAfter(to))
                .filter(c -> status == null || c.getStatus().name().equals(status))
                .sorted(Comparator.comparing(Case::getStartedAt).reversed())
                .toList();

        List<Map<String, Object>> rows = cases.stream().map(c -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", c.getId().substring(0, 8) + "...");
            row.put("política", policyNames.getOrDefault(c.getPolicyId(), "—"));
            row.put("estado", c.getStatus().name());
            row.put("iniciado", c.getStartedAt() != null ? c.getStartedAt().toString().substring(0, 10) : "—");
            row.put("finalizado", c.getFinishedAt() != null ? c.getFinishedAt().toString().substring(0, 10) : "—");
            row.put("tareas", c.getTasks().size());
            return row;
        }).toList();

        return buildResult(rows,
                Map.of("total", cases.size(),
                       "completados", cases.stream().filter(c -> c.getStatus() == CaseStatus.COMPLETED).count(),
                       "en_progreso", cases.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS || c.getStatus() == CaseStatus.OPEN).count(),
                       "cancelados", cases.stream().filter(c -> c.getStatus() == CaseStatus.CANCELLED).count()));
    }

    private Map<String, Object> reportCasesByStatus(Map<String, Object> filters) {
        String status = (String) filters.get("status");
        return reportCasesByDate(filters.isEmpty()
                ? Map.of("status", Objects.requireNonNullElse(status, ""))
                : filters);
    }

    private Map<String, Object> reportCasesByPolicy(Map<String, Object> filters) {
        String policyNameFilter = (String) filters.get("policyName");

        Map<String, String> policyNames = new HashMap<>();
        policyRepository.findAll().forEach(p -> policyNames.put(p.getId(), p.getName()));

        List<Case> cases = caseRepository.findAll().stream()
                .filter(c -> {
                    if (policyNameFilter == null || policyNameFilter.isBlank()) return true;
                    String pName = policyNames.getOrDefault(c.getPolicyId(), "");
                    return pName.toLowerCase().contains(policyNameFilter.toLowerCase());
                })
                .sorted(Comparator.comparing(Case::getStartedAt).reversed())
                .toList();

        // Group by policy
        Map<String, Long> byPolicy = cases.stream()
                .collect(Collectors.groupingBy(
                        c -> policyNames.getOrDefault(c.getPolicyId(), "Desconocida"),
                        Collectors.counting()
                ));

        List<Map<String, Object>> rows = byPolicy.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    long completed = cases.stream()
                            .filter(c -> policyNames.getOrDefault(c.getPolicyId(), "").equals(e.getKey())
                                    && c.getStatus() == CaseStatus.COMPLETED)
                            .count();
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("política", e.getKey());
                    row.put("total_trámites", e.getValue());
                    row.put("completados", completed);
                    row.put("tasa_completitud", e.getValue() > 0
                            ? Math.round((double) completed / e.getValue() * 100) + "%" : "0%");
                    return row;
                }).toList();

        return buildResult(rows, Map.of("total_trámites", cases.size(), "políticas", byPolicy.size()));
    }

    private Map<String, Object> reportTasksByDept(Map<String, Object> filters) {
        String deptFilter = (String) filters.get("department");

        // Build caches
        Map<String, String> deptNames = new HashMap<>();
        departmentRepository.findAll().forEach(d -> deptNames.put(d.getId(), d.getName()));

        Map<String, Map<String, String>> nodeIdToDept = new HashMap<>();
        policyRepository.findAll().forEach(p ->
                p.getNodes().forEach(n -> {
                    if (n.getDepartmentId() != null) {
                        nodeIdToDept.put(n.getId(), Map.of(
                                "dept", deptNames.getOrDefault(n.getDepartmentId(), "Sin dept"),
                                "title", Objects.requireNonNullElse(n.getTitle(), "—")
                        ));
                    }
                })
        );

        // Count tasks by department
        Map<String, long[]> deptStats = new LinkedHashMap<>(); // [total, done, pending]
        for (Case c : caseRepository.findAll()) {
            for (Task t : c.getTasks()) {
                Map<String, String> nodeInfo = nodeIdToDept.get(t.getNodeId());
                if (nodeInfo == null) continue;
                String dept = nodeInfo.get("dept");
                if (deptFilter != null && !deptFilter.isBlank()
                        && !dept.toLowerCase().contains(deptFilter.toLowerCase())) continue;
                deptStats.computeIfAbsent(dept, k -> new long[]{0, 0, 0});
                deptStats.get(dept)[0]++;
                if (t.getStatus() == TaskStatus.DONE) deptStats.get(dept)[1]++;
                else deptStats.get(dept)[2]++;
            }
        }

        List<Map<String, Object>> rows = deptStats.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[2], a.getValue()[2]))
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("departamento", e.getKey());
                    row.put("total_tareas", e.getValue()[0]);
                    row.put("completadas", e.getValue()[1]);
                    row.put("pendientes", e.getValue()[2]);
                    row.put("carga", e.getValue()[2] > 3 ? "Alta" : e.getValue()[2] > 1 ? "Media" : "Baja");
                    return row;
                }).toList();

        long totalPending = rows.stream().mapToLong(r -> (long) r.get("pendientes")).sum();
        return buildResult(rows, Map.of("total_tareas", rows.stream().mapToLong(r -> (long) r.get("total_tareas")).sum(),
                                        "tareas_pendientes", totalPending));
    }

    private Map<String, Object> reportBottlenecks(Map<String, Object> filters) {
        Map<String, String> deptNames = new HashMap<>();
        departmentRepository.findAll().forEach(d -> deptNames.put(d.getId(), d.getName()));

        List<Map<String, Object>> rows = new ArrayList<>();

        for (Policy policy : policyRepository.findAll()) {
            List<Case> cases = caseRepository.findByPolicyId(policy.getId());
            if (cases.isEmpty()) continue;

            Map<String, List<Task>> tasksByNode = new HashMap<>();
            for (Case c : cases) {
                for (Task t : c.getTasks()) {
                    tasksByNode.computeIfAbsent(t.getNodeId(), k -> new ArrayList<>()).add(t);
                }
            }

            for (PolicyNode node : policy.getNodes()) {
                if (node.getNodeType() == NodeType.INITIAL || node.getNodeType() == NodeType.FINAL) continue;
                List<Task> nodeTasks = tasksByNode.getOrDefault(node.getId(), List.of());
                long pending = nodeTasks.stream()
                        .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                        .count();
                if (pending == 0) continue;

                String dept = node.getDepartmentId() != null
                        ? deptNames.getOrDefault(node.getDepartmentId(), "Sin dept") : "Sin dept";

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("política", policy.getName());
                row.put("actividad", node.getTitle());
                row.put("departamento", dept);
                row.put("tareas_pendientes", pending);
                row.put("total_tareas", nodeTasks.size());
                row.put("riesgo", pending >= 3 ? "Alto" : pending >= 2 ? "Medio" : "Bajo");
                rows.add(row);
            }
        }

        rows.sort((a, b) -> Long.compare((long) b.get("tareas_pendientes"), (long) a.get("tareas_pendientes")));
        long totalPending = rows.stream().mapToLong(r -> (long) r.get("tareas_pendientes")).sum();
        return buildResult(rows, Map.of("total_cuellos", rows.size(), "tareas_bloqueadas", totalPending));
    }

    private Map<String, Object> reportGeneralSummary() {
        List<Case> all = caseRepository.findAll();
        long completed = all.stream().filter(c -> c.getStatus() == CaseStatus.COMPLETED).count();
        long active    = all.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS || c.getStatus() == CaseStatus.OPEN).count();
        long cancelled = all.stream().filter(c -> c.getStatus() == CaseStatus.CANCELLED).count();
        long tasks     = all.stream().mapToLong(c -> c.getTasks().size()).sum();
        long pending   = all.stream().flatMap(c -> c.getTasks().stream())
                            .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                            .count();

        Map<String, String> policyNames = new HashMap<>();
        policyRepository.findAll().forEach(p -> policyNames.put(p.getId(), p.getName()));

        Map<String, Long> byPolicy = all.stream()
                .collect(Collectors.groupingBy(
                        c -> policyNames.getOrDefault(c.getPolicyId(), "—"),
                        Collectors.counting()
                ));

        List<Map<String, Object>> rows = byPolicy.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("política", e.getKey());
                    row.put("trámites", e.getValue());
                    return row;
                }).toList();

        return buildResult(rows,
                Map.of("total_trámites", all.size(), "completados", completed,
                       "en_progreso", active, "cancelados", cancelled,
                       "total_tareas", tasks, "tareas_pendientes", pending,
                       "total_políticas", policyNames.size()));
    }

    // ── AI-service proxy ──────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseQuerySpec(String query) {
        if (aiServiceUrl != null && !aiServiceUrl.isBlank()) {
            try {
                String json = objectMapper.writeValueAsString(Map.of("query", query));
                var client = java.net.http.HttpClient.newBuilder()
                        .connectTimeout(java.time.Duration.ofSeconds(3)).build();
                var req = java.net.http.HttpRequest.newBuilder()
                        .uri(java.net.URI.create(aiServiceUrl + "/reports/parse"))
                        .header("Content-Type", "application/json")
                        .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json))
                        .timeout(java.time.Duration.ofSeconds(5)).build();
                var resp = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() == 200) {
                    return objectMapper.readValue(resp.body(), Map.class);
                }
            } catch (Exception ignored) {}
        }
        // Local fallback
        return localParseSpec(query);
    }

    /** Simple local fallback when ai-service is unavailable. */
    private Map<String, Object> localParseSpec(String query) {
        String lower = query.toLowerCase(java.util.Locale.ROOT);
        String reportType = "general_summary";
        String title = "Resumen general del sistema";

        if (lower.contains("cuello") || lower.contains("bottleneck") || lower.contains("demora")) {
            reportType = "bottleneck_summary"; title = "Análisis de cuellos de botella";
        } else if (lower.contains("completad") || lower.contains("cancelad") || lower.contains("progress")) {
            reportType = "cases_by_status"; title = "Trámites por estado";
        } else if (lower.contains("departamento") || lower.contains("área")) {
            reportType = "tasks_by_dept"; title = "Tareas por departamento";
        } else if (lower.contains("política") || lower.contains("proceso")) {
            reportType = "cases_by_policy"; title = "Trámites por política";
        } else if (lower.contains("fecha") || lower.contains("mes") || lower.contains("semana")) {
            reportType = "cases_by_date"; title = "Trámites por período";
        }

        return Map.of("reportType", reportType, "title", title,
                "filters", new HashMap<String, Object>());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, Object> buildResult(List<Map<String, Object>> rows, Map<String, Object> summary) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("rows", rows);
        result.put("summary", summary);
        result.put("totalRows", rows.size());
        return result;
    }

    private Instant parseDate(String dateStr, Instant fallback) {
        if (dateStr == null || dateStr.isBlank()) return fallback;
        try {
            return LocalDate.parse(dateStr).atStartOfDay().toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException e) {
            return fallback;
        }
    }
}
