package com.workflow.engine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.engine.model.*;
import com.workflow.engine.repository.PolicyRepository;
import com.workflow.engine.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * Agente Inteligente de Recepción (REQ 3 — Ciclo 2).
 *
 * Reemplaza el punto de atención humano: el cliente interactúa con el agente
 * por voz o texto, el agente identifica la política de negocio correcta,
 * solicita los requisitos uno a uno y finalmente inicia el trámite.
 *
 * POST /api/agent/chat   — turno de conversación
 * GET  /api/agent/policies — lista de políticas con sus requisitos (para el agente)
 */
@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    @Value("${ai.service.url:}")
    private String aiServiceUrl;

    private final PolicyRepository policyRepository;
    private final CaseService caseService;
    private final ObjectMapper objectMapper;

    // In-memory session store (reemplazable por MongoDB para persistencia)
    private final Map<String, AgentSession> sessions = new java.util.concurrent.ConcurrentHashMap<>();

    // ── Session model ─────────────────────────────────────────────────────────

    static class AgentSession {
        String sessionId;
        String userId;
        String phase = "GREETING";   // GREETING → POLICY_MATCH → REQUIREMENTS → CONFIRM → DONE
        String matchedPolicyId;
        String matchedPolicyName;
        List<PolicyRequirement> pendingRequirements = new ArrayList<>();
        int requirementIndex = 0;
        List<String> collectedDocumentIds = new ArrayList<>();
        List<Map<String, String>> history = new ArrayList<>();
    }

    // ── Chat endpoint ─────────────────────────────────────────────────────────

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> body) {
        String sessionId = body.getOrDefault("sessionId", UUID.randomUUID().toString());
        String message   = body.getOrDefault("message", "").trim();
        String userId    = currentUserId();

        AgentSession session = sessions.computeIfAbsent(sessionId, id -> {
            AgentSession s = new AgentSession();
            s.sessionId = id;
            s.userId    = userId;
            return s;
        });

        String reply;
        String nextAction = "AWAIT_INPUT";
        Object extra = null;

        switch (session.phase) {
            case "GREETING" -> {
                if (message.isBlank()) {
                    reply = "¡Hola! Soy el asistente virtual de trámites. ¿En qué puedo ayudarte hoy? " +
                            "Describe brevemente el trámite que necesitas realizar.";
                } else {
                    // Try to match a policy
                    session.history.add(Map.of("role", "user", "content", message));
                    Map<String, Object> match = matchPolicy(message);
                    if (match != null && (double) match.getOrDefault("confidence", 0.0) > 0.4) {
                        session.matchedPolicyId   = (String) match.get("policyId");
                        session.matchedPolicyName = (String) match.get("policyName");
                        session.phase = "REQUIREMENTS";

                        // Load requirements from the INITIAL node
                        loadRequirements(session);

                        if (session.pendingRequirements.isEmpty()) {
                            session.phase = "CONFIRM";
                            reply = "Identifico que necesitas: **" + session.matchedPolicyName + "**. " +
                                    "Este trámite no requiere documentos previos. ¿Confirmas que deseas iniciarlo?";
                            nextAction = "CONFIRM";
                        } else {
                            PolicyRequirement first = session.pendingRequirements.get(0);
                            reply = "Identifico que necesitas: **" + session.matchedPolicyName + "**. " +
                                    "Necesito que me proporciones algunos documentos.\n\n" +
                                    "📎 **" + first.getName() + "**" +
                                    (first.getDescription().isBlank() ? "" : "\n" + first.getDescription()) +
                                    (first.isRequired() ? " *(Obligatorio)*" : " *(Opcional)*");
                            nextAction = "UPLOAD_DOCUMENT";
                            extra = Map.of("requirementIndex", 0, "requirement", first,
                                           "totalRequirements", session.pendingRequirements.size());
                        }
                    } else {
                        reply = "Entiendo que necesitas un trámite, pero no pude identificar exactamente cuál. " +
                                "¿Puedes ser más específico? Por ejemplo: 'permiso de construcción', " +
                                "'licencia de funcionamiento', etc.";
                    }
                }
            }

            case "REQUIREMENTS" -> {
                // User acknowledged a requirement — advance to next
                session.requirementIndex++;
                if (session.requirementIndex < session.pendingRequirements.size()) {
                    PolicyRequirement next = session.pendingRequirements.get(session.requirementIndex);
                    reply = "Gracias. Ahora necesito:\n\n" +
                            "📎 **" + next.getName() + "**" +
                            (next.getDescription().isBlank() ? "" : "\n" + next.getDescription()) +
                            (next.isRequired() ? " *(Obligatorio)*" : " *(Opcional — puedes omitirlo)*");
                    nextAction = "UPLOAD_DOCUMENT";
                    extra = Map.of("requirementIndex", session.requirementIndex,
                                   "requirement", next,
                                   "totalRequirements", session.pendingRequirements.size());
                } else {
                    session.phase = "CONFIRM";
                    reply = "✅ Documentación completada. Todo listo para iniciar el trámite: **" +
                            session.matchedPolicyName + "**.\n\n¿Confirmas el inicio?";
                    nextAction = "CONFIRM";
                }
            }

            case "CONFIRM" -> {
                boolean confirmed = message.toLowerCase().matches(".*(sí|si|confirmo|inicio|acepto|ok|yes|dale|adelante).*");
                if (confirmed) {
                    try {
                        String caseId = startCase(session, userId);
                        session.phase = "DONE";
                        sessions.remove(sessionId);
                        reply = "🎉 ¡Trámite iniciado exitosamente! Tu número de seguimiento es:\n\n" +
                                "**ID:** `" + caseId + "`\n\n" +
                                "Puedes consultar el estado en 'Mis Trámites'.";
                        nextAction = "DONE";
                        extra = Map.of("caseId", caseId);
                    } catch (Exception e) {
                        reply = "Hubo un error al iniciar el trámite: " + e.getMessage() + ". Por favor intenta de nuevo.";
                    }
                } else {
                    reply = "Entendido. Si deseas iniciar el trámite en otro momento, escribe 'iniciar' o vuelve a describir tu necesidad.";
                    session.phase = "GREETING";
                }
            }

            case "DONE" -> {
                sessions.remove(sessionId);
                reply = "El trámite ya fue iniciado. ¿Hay algo más en lo que pueda ayudarte?";
                nextAction = "RESTART";
            }

            default -> reply = "Lo siento, ocurrió un error en la sesión. Por favor recarga la página.";
        }

        session.history.add(Map.of("role", "agent", "content", reply));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("sessionId", sessionId);
        response.put("reply", reply);
        response.put("phase", session.phase);
        response.put("nextAction", nextAction);
        response.put("matchedPolicy", session.matchedPolicyId != null
                ? Map.of("id", session.matchedPolicyId, "name", session.matchedPolicyName) : null);
        if (extra != null) response.put("extra", extra);
        return ResponseEntity.ok(response);
    }

    // ── Policies list (for the frontend to show) ──────────────────────────────

    @GetMapping("/policies")
    public ResponseEntity<List<Map<String, Object>>> listPoliciesForAgent() {
        List<Map<String, Object>> result = policyRepository.findAll().stream()
                .filter(p -> p.getStatus() == PolicyStatus.ACTIVE)
                .map(p -> {
                    List<PolicyRequirement> reqs = p.getNodes().stream()
                            .filter(n -> n.getNodeType() == NodeType.INITIAL)
                            .findFirst()
                            .map(n -> n.getRequirements())
                            .orElse(List.of());
                    return Map.<String, Object>of(
                            "id", p.getId(),
                            "name", p.getName(),
                            "requirements", reqs
                    );
                }).toList();
        return ResponseEntity.ok(result);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> matchPolicy(String description) {
        List<Policy> policies = policyRepository.findAll().stream()
                .filter(p -> p.getStatus() == PolicyStatus.ACTIVE).toList();

        if (policies.isEmpty()) return null;

        // Try ai-service first
        if (aiServiceUrl != null && !aiServiceUrl.isBlank()) {
            try {
                List<Map<String, String>> policiesPayload = policies.stream()
                        .map(p -> Map.of("id", p.getId(), "name", p.getName(), "keywords", ""))
                        .toList();
                String json = objectMapper.writeValueAsString(
                        Map.of("transcript", description, "policies", policiesPayload));
                var req = HttpRequest.newBuilder()
                        .uri(URI.create(aiServiceUrl + "/nlp/assign-policy"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(json))
                        .timeout(Duration.ofSeconds(5)).build();
                var resp = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3))
                        .build().send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() == 200) {
                    Map<String, Object> r = objectMapper.readValue(resp.body(), Map.class);
                    return Map.of(
                            "policyId", r.getOrDefault("policyId", ""),
                            "policyName", r.getOrDefault("policyName", ""),
                            "confidence", r.getOrDefault("confidence", 0.0)
                    );
                }
            } catch (Exception ignored) {}
        }

        // Local fallback: keyword matching
        String lower = description.toLowerCase();
        for (Policy p : policies) {
            if (lower.contains(p.getName().toLowerCase()) ||
                p.getName().toLowerCase().chars().mapToObj(c -> String.valueOf((char) c))
                    .anyMatch(w -> w.length() > 4 && lower.contains(w))) {
                return Map.of("policyId", p.getId(), "policyName", p.getName(), "confidence", 0.7);
            }
        }
        // Return first policy as fallback with low confidence
        Policy first = policies.get(0);
        return Map.of("policyId", first.getId(), "policyName", first.getName(), "confidence", 0.3);
    }

    private void loadRequirements(AgentSession session) {
        policyRepository.findById(session.matchedPolicyId).ifPresent(policy ->
            policy.getNodes().stream()
                    .filter(n -> n.getNodeType() == NodeType.INITIAL)
                    .findFirst()
                    .ifPresent(n -> session.pendingRequirements = new ArrayList<>(
                            n.getRequirements() != null ? n.getRequirements() : List.of()))
        );
    }

    private String startCase(AgentSession session, String userId) {
        return caseService.startCaseForClient(session.matchedPolicyId, userId).getId();
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) return u.getId();
        return "anonymous";
    }
}
