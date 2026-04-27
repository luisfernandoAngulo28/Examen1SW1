package com.workflow.engine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * AI Assistant controller — rule-based engine that interprets Spanish/English workflow
 * commands and returns structured JSON the PolicyEditorPage can apply to the diagram.
 *
 * Response shape:
 *   { action, suggestion, nodes?: [{title, department}], connections?: [{from, to, flowType}] }
 */
@RestController
@RequestMapping("/api/ai-assistant")
@RequiredArgsConstructor
public class AiAssistantController {

    @Value("${elevenlabs.api.key:}")
    private String elevenLabsKey;

    /** URL del microservicio Python/FastAPI de IA (vacío = usar lógica local de respaldo). */
    @Value("${ai.service.url:}")
    private String aiServiceUrl;

    /** ObjectMapper inyectado para serializar/deserializar el proxy JSON. */
    private final ObjectMapper objectMapper;

    // ── Prompt endpoint ────────────────────────────────────────────────────────

    @PostMapping("/prompt")
    public ResponseEntity<Map<String, Object>> handlePrompt(@RequestBody Map<String, String> body) {
        // Intentar delegar al microservicio Python/FastAPI primero
        Map<String, Object> aiResult = proxyPost("/prompt", body);
        if (aiResult != null) return ResponseEntity.ok(aiResult);
        // Respaldo local
        String prompt = body.getOrDefault("prompt", "").toLowerCase(java.util.Locale.ROOT).trim();
        return ResponseEntity.ok(processPrompt(prompt));
    }

    // ── Image/OCR endpoint ─────────────────────────────────────────────────────

    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> handleImage(@RequestBody Map<String, String> body) {
        Map<String, Object> aiResult = proxyPost("/image", body);
        if (aiResult != null) return ResponseEntity.ok(aiResult);
        String extractedText = body.getOrDefault("extractedText", "").toLowerCase(java.util.Locale.ROOT).trim();
        return ResponseEntity.ok(processPrompt(extractedText));
    }

    // ── NLP Form Filler endpoint ───────────────────────────────────────────────

    /**
     * REQ-NLP: Llenado de formularios por dictado de voz mediante NLP.
     * Delega al microservicio Python/FastAPI que implementa el procesamiento
     * de lenguaje natural. Si el servicio no está disponible retorna un objeto
     * vacío para que el frontend maneje la degradación.
     */
    @PostMapping("/nlp/fill-form")
    public ResponseEntity<Map<String, Object>> fillForm(@RequestBody Map<String, Object> body) {
        Map<String, Object> aiResult = proxyPost("/nlp/fill-form", body);
        if (aiResult != null) return ResponseEntity.ok(aiResult);
        return ResponseEntity.ok(Map.of(
                "values", Map.of(),
                "confidence", Map.of(),
                "error", "AI service not available — formulario listo para llenado manual"
        ));
    }

    // ── Proxy helper: delega al microservicio Python/FastAPI ───────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> proxyPost(String path, Object body) {
        if (aiServiceUrl == null || aiServiceUrl.isBlank()) return null;
        try {
            String json = objectMapper.writeValueAsString(body);
            var client = java.net.http.HttpClient.newBuilder()
                    .connectTimeout(java.time.Duration.ofSeconds(3))
                    .build();
            var req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(aiServiceUrl + path))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json))
                    .timeout(java.time.Duration.ofSeconds(5))
                    .build();
            var resp = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                return objectMapper.readValue(resp.body(), Map.class);
            }
        } catch (Exception ignored) {
            // Microservicio no disponible — se usa lógica de respaldo local
        }
        return null;
    }

    // ── ElevenLabs TTS endpoint ────────────────────────────────────────────────

    @PostMapping("/tts")
    public ResponseEntity<byte[]> tts(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "").trim();
        if (text.isBlank()) return ResponseEntity.badRequest().build();
        if (elevenLabsKey == null || elevenLabsKey.isBlank()) {
            return ResponseEntity.noContent().build(); // 204 → frontend uses browser TTS
        }
        try {
            String safe = text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ");
            String payload = "{\"text\":\"" + safe + "\",\"model_id\":\"eleven_multilingual_v2\"}";
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"))
                .header("xi-api-key", elevenLabsKey)
                .header("Content-Type", "application/json")
                .header("Accept", "audio/mpeg")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(payload))
                .build();
            java.net.http.HttpResponse<byte[]> response = client.send(
                request, java.net.http.HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() != 200) return ResponseEntity.noContent().build();
            return ResponseEntity.ok()
                .header("Content-Type", "audio/mpeg")
                .body(response.body());
        } catch (Exception e) {
            return ResponseEntity.noContent().build();
        }
    }

    // ── Core intent-to-action engine ──────────────────────────────────────────

    private Map<String, Object> processPrompt(String prompt) {
        // 1. DELETE / REMOVE
        if (containsAny(prompt, "elimina", "eliminar", "quita", "quitar", "borra", "borrar", "remove", "delete")) {
            String title = extractNodeTitle(prompt, "elimina", "quita", "borra", "remove", "delete", "la actividad", "el nodo");
            return removeNode(title.isEmpty() ? "Actividad" : capitalise(title));
        }

        // 2. CONNECT two nodes
        if (containsAny(prompt, "conect", "enlaz", "lig", "link", "uni", "une ")) {
            return connectNodes(prompt);
        }

        // 3. SUGGEST_FLOW — full-flow descriptions
        if (containsAny(prompt, "crea un flujo", "generar flujo", "diseña un flujo", "flujo para", "proceso de",
                "proceso completo", "suggest flow", "create flow", "workflow for")) {
            return suggestFlow(prompt);
        }

        // 4. ADD_NODE — single node
        if (containsAny(prompt, "agrega", "agregar", "añade", "añadir", "crea", "crear", "add", "new node", "nuevo nodo", "nueva actividad")) {
            return addNode(prompt);
        }

        // 5. Generic helpful reply for anything else
        return helpReply(prompt);
    }

    // ── Intent handlers ───────────────────────────────────────────────────────

    private Map<String, Object> removeNode(String title) {
        return Map.of(
                "action", "remove_node",
                "suggestion", "Eliminaré la actividad \"" + title + "\" del diagrama.",
                "nodes", List.of(Map.of("title", title, "department", ""))
        );
    }

    private Map<String, Object> addNode(String prompt) {
        String dept = detectDepartment(prompt);
        String title = guessNodeTitle(prompt);
        return Map.of(
                "action", "add_node",
                "suggestion", "Agregué la actividad \"" + title + "\" al departamento " + dept + ".",
                "nodes", List.of(Map.of("title", title, "department", dept))
        );
    }

    private Map<String, Object> suggestFlow(String prompt) {
        List<Map<String, String>> nodes = new ArrayList<>();
        List<Map<String, String>> connections = new ArrayList<>();

        if (containsAny(prompt, "vacacion", "permiso", "licencia", "leave", "tiempo libre")) {
            nodes = flowNodes(
                    n("Solicitud de Permiso", "Recursos Humanos"),
                    n("Revisión de Disponibilidad", "Recursos Humanos"),
                    n("Aprobación de Jefe", "Dirección"),
                    n("Notificación al Empleado", "Recursos Humanos")
            );
            connections = chain(nodes, "NORMAL");
        } else if (containsAny(prompt, "compra", "adquisici", "purchase", "procurement", "proveedor")) {
            nodes = flowNodes(
                    n("Solicitud de Compra", "Finanzas"),
                    n("Cotización de Proveedores", "Finanzas"),
                    n("Aprobación Presupuestaria", "Dirección"),
                    n("Orden de Compra", "Finanzas"),
                    n("Recepción de Mercancía", "Logística")
            );
            connections = chain(nodes, "NORMAL");
        } else if (containsAny(prompt, "reclamo", "queja", "complaint", "claim")) {
            nodes = flowNodes(
                    n("Recepción de Reclamo", "Atención al Cliente"),
                    n("Registro y Categorización", "Atención al Cliente"),
                    n("Investigación", "Calidad"),
                    n("Resolución", "Calidad"),
                    n("Comunicación al Cliente", "Atención al Cliente")
            );
            connections = chain(nodes, "NORMAL");
        } else if (containsAny(prompt, "contrat", "onboarding", "incorpora", "nuevo empleado")) {
            nodes = flowNodes(
                    n("Oferta Laboral", "Recursos Humanos"),
                    n("Firma de Contrato", "Legal"),
                    n("Inducción", "Recursos Humanos"),
                    n("Asignación de Equipo", "TI"),
                    n("Alta en Sistema", "TI")
            );
            connections = chain(nodes, "NORMAL");
        } else if (containsAny(prompt, "factura", "pago", "invoice", "payment")) {
            nodes = flowNodes(
                    n("Recepción de Factura", "Finanzas"),
                    n("Validación", "Finanzas"),
                    n("Aprobación", "Dirección"),
                    n("Pago", "Finanzas")
            );
            connections = chain(nodes, "NORMAL");
        } else {
            // Generic 3-step flow
            String topic = extractTopic(prompt);
            nodes = flowNodes(
                    n("Solicitud de " + topic, "Administración"),
                    n("Revisión de " + topic, "Dirección"),
                    n("Aprobación Final", "Dirección")
            );
            connections = chain(nodes, "NORMAL");
        }

        String nodeTitlesJoined = nodes.stream().map(m -> m.get("title")).reduce((a, b) -> a + " → " + b).orElse("");
        return Map.of(
                "action", "suggest_flow",
                "suggestion", nodeTitlesJoined,
                "nodes", nodes,
                "connections", connections
        );
    }

    private Map<String, Object> helpReply(String prompt) {
        String reply;
        if (containsAny(prompt, "hola", "hello", "hi", "ayuda", "help")) {
            reply = "Hola! Puedo ayudarte a diseñar flujos de trabajo. Prueba: \"Crea un flujo para solicitud de vacaciones\", \"Agrega actividad Revisión al departamento Legal\", \"Conecta Solicitud con Aprobación de forma condicional\", o \"Elimina la actividad Aprobación\".";
        } else {
            reply = "Entendido. Para agregar actividades di: \"Agrega [nombre] al departamento [dept]\". Para un flujo completo: \"Crea un flujo para [proceso]\". Para conectar: \"Conecta [A] con [B] de forma condicional\".";
        }
        return Map.of("action", "info", "suggestion", reply, "nodes", List.of());
    }

    private Map<String, Object> connectNodes(String prompt) {
        // Detect flow type from prompt
        String flowType = "SEQUENTIAL";
        String flowLabel = "secuencial";
        if (containsAny(prompt, "condicional", "conditional", "si ", "if ", "alternativ", "decision")) {
            flowType = "CONDITIONAL"; flowLabel = "condicional";
        } else if (containsAny(prompt, "paralel", "parallel", "fork", "simultaneo")) {
            flowType = "PARALLEL"; flowLabel = "paralelo";
        } else if (containsAny(prompt, "iterativ", "loop", "repite", "ciclo", "correc")) {
            flowType = "ITERATIVE"; flowLabel = "iterativo";
        }

        // Try to extract node names: look for patterns like "A con B", "A a B", "A with B"
        String fromTitle = "";
        String toTitle = "";
        for (String sep : List.of(" con ", " a ", " hacia ", " with ", " to ")) {
            int idx = prompt.indexOf(sep);
            if (idx > 0) {
                // from: text before sep (strip leading verbs)
                String before = prompt.substring(0, idx).trim();
                for (String verb : List.of("conecta ", "conect ", "enlaza ", "enlaz ", "une ", "link ", "liga ", "lig ")) {
                    if (before.startsWith(verb)) { before = before.substring(verb.length()).trim(); break; }
                }
                // after: text after sep (strip trailing flow-type words)
                String after = prompt.substring(idx + sep.length()).trim();
                for (String suffix : List.of(" de forma ", " usando ", " con tipo ", " como ", " en modo ", " using ", " with ")) {
                    int cut = after.indexOf(suffix);
                    if (cut > 0) { after = after.substring(0, cut).trim(); break; }
                }
                fromTitle = capitalise(before.trim());
                toTitle = capitalise(after.trim());
                break;
            }
        }

        if (fromTitle.isBlank() || toTitle.isBlank()) {
            return Map.of("action", "info",
                    "suggestion", "Para conectar nodos di: \"Conecta [Actividad A] con [Actividad B] de forma condicional\".",
                    "nodes", List.of(), "connections", List.of());
        }

        return Map.of(
                "action", "connect_nodes",
                "suggestion", "Conecté \"" + fromTitle + "\" con \"" + toTitle + "\" usando flujo " + flowLabel + ".",
                "nodes", List.of(),
                "connections", List.of(Map.of("from", fromTitle, "to", toTitle, "flowType", flowType))
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private String detectDepartment(String prompt) {
        if (containsAny(prompt, "rrhh", "recursos humanos", "hr", "human resources", "personal")) return "Recursos Humanos";
        if (containsAny(prompt, "finanz", "contabilidad", "presupuesto", "finance")) return "Finanzas";
        if (containsAny(prompt, "legal", "jurídic", "contratos")) return "Legal";
        if (containsAny(prompt, "ti", "tecnolog", "sistemas", "it ", "tech")) return "TI";
        if (containsAny(prompt, "direcci", "gerencia", "management", "direction")) return "Dirección";
        if (containsAny(prompt, "logísti", "almacén", "bodega", "logistics")) return "Logística";
        if (containsAny(prompt, "calidad", "quality")) return "Calidad";
        if (containsAny(prompt, "atención", "cliente", "customer", "servicio")) return "Atención al Cliente";
        return "Administración";
    }

    private String guessNodeTitle(String prompt) {
        // Try to extract the text after common verbs
        for (String verb : List.of("agrega ", "añade ", "crea ", "add ", "agregar ", "añadir ", "crear ")) {
            int idx = prompt.indexOf(verb);
            if (idx >= 0) {
                String rest = prompt.substring(idx + verb.length()).trim();
                // strip "al departamento X" / "to department X"
                for (String prep : List.of(" al departamento", " a departamento", " to the", " to department", " en el", " en la")) {
                    int cut = rest.indexOf(prep);
                    if (cut > 0) rest = rest.substring(0, cut).trim();
                }
                if (!rest.isBlank()) return capitalise(rest);
            }
        }
        return "Nueva Actividad";
    }

    private String extractNodeTitle(String prompt, String... verbs) {
        for (String verb : verbs) {
            int idx = prompt.indexOf(verb + " ");
            if (idx >= 0) {
                String rest = prompt.substring(idx + verb.length() + 1).trim();
                for (String prep : List.of(" del ", " de ", " from ")) {
                    int cut = rest.indexOf(prep);
                    if (cut > 0) rest = rest.substring(0, cut).trim();
                }
                if (!rest.isBlank()) return rest;
            }
        }
        return "";
    }

    private String extractTopic(String prompt) {
        // Return the most meaningful noun chunk after "flujo para" / "proceso de"
        for (String kw : List.of("flujo para ", "proceso de ", "proceso completo de ", "workflow for ")) {
            int idx = prompt.indexOf(kw);
            if (idx >= 0) {
                String rest = prompt.substring(idx + kw.length()).trim();
                if (rest.length() > 30) rest = rest.substring(0, 30);
                return capitalise(rest);
            }
        }
        return "Trámite";
    }

    private String capitalise(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    // ── Flow builders ─────────────────────────────────────────────────────────

    private Map<String, String> n(String title, String department) {
        return Map.of("title", title, "department", department);
    }

    @SafeVarargs
    private List<Map<String, String>> flowNodes(Map<String, String>... nodes) {
        return List.of(nodes);
    }

    private List<Map<String, String>> chain(List<Map<String, String>> nodes, String flowType) {
        List<Map<String, String>> connections = new ArrayList<>();
        for (int i = 0; i < nodes.size() - 1; i++) {
            connections.add(Map.of(
                    "from", nodes.get(i).get("title"),
                    "to", nodes.get(i + 1).get("title"),
                    "flowType", "SEQUENTIAL"
            ));
        }
        return connections;
    }
}
