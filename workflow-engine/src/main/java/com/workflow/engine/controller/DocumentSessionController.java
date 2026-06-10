package com.workflow.engine.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.LinkedHashMap;

/**
 * Gestión de sesiones colaborativas de documentos (REQ 1 — Ciclo 2).
 *
 * Cuando un usuario abre un documento en modo colaborativo, se suscribe a
 * /topic/document/{docId}/session  → recibe lista actualizada de participantes.
 * /topic/document/{docId}/notes    → recibe notas en tiempo real.
 *
 * El cliente envía a:
 * /app/document/{docId}/join  → al abrir la sesión
 * /app/document/{docId}/leave → al cerrar la sesión
 * /app/document/{docId}/note  → al enviar una nota compartida
 */
@Controller
@RequiredArgsConstructor
public class DocumentSessionController {

    private final SimpMessagingTemplate messaging;

    // docId → userId → UserInfo (en memoria, suficiente para demo)
    private final Map<String, Map<String, UserInfo>> sessions = new ConcurrentHashMap<>();

    // docId → contenido del editor colaborativo (última versión conocida)
    private final Map<String, String> docContents = new ConcurrentHashMap<>();

    // ── DTOs ──────────────────────────────────────────────────────────────────

    @Data
    public static class UserInfo {
        private String userId;
        private String userName;
        private String color;
        private String joinedAt;
    }

    @Data
    public static class SessionUpdate {
        private String type;          // JOIN | LEAVE
        private List<UserInfo> users;
    }

    @Data
    public static class NoteMessage {
        private String userId;
        private String userName;
        private String color;
        private String content;
        private String timestamp;
    }

    // ── WebSocket message handlers ────────────────────────────────────────────

    @MessageMapping("/document/{docId}/join")
    public void join(@DestinationVariable String docId,
                     @Payload Map<String, String> payload) {
        UserInfo info = new UserInfo();
        info.setUserId(payload.getOrDefault("userId", "anon"));
        info.setUserName(payload.getOrDefault("userName", "Anónimo"));
        info.setColor(payload.getOrDefault("color", "#722ed1"));
        info.setJoinedAt(Instant.now().toString());

        sessions.computeIfAbsent(docId, k -> new ConcurrentHashMap<>())
                .put(info.getUserId(), info);

        broadcastSession(docId, "JOIN");
    }

    @MessageMapping("/document/{docId}/leave")
    public void leave(@DestinationVariable String docId,
                      @Payload Map<String, String> payload) {
        String userId = payload.getOrDefault("userId", "");
        Map<String, UserInfo> docSession = sessions.get(docId);
        if (docSession != null) {
            docSession.remove(userId);
            if (docSession.isEmpty()) sessions.remove(docId);
        }
        broadcastSession(docId, "LEAVE");
    }

    @MessageMapping("/document/{docId}/note")
    public void note(@DestinationVariable String docId,
                     @Payload Map<String, String> payload) {
        NoteMessage note = new NoteMessage();
        note.setUserId(payload.getOrDefault("userId", ""));
        note.setUserName(payload.getOrDefault("userName", "Anónimo"));
        note.setColor(payload.getOrDefault("color", "#722ed1"));
        note.setContent(payload.getOrDefault("content", ""));
        note.setTimestamp(Instant.now().toString());
        messaging.convertAndSend("/topic/document/" + docId + "/notes", note);
    }

    /**
     * Editor colaborativo en tiempo real.
     * Cualquier participante envía el contenido completo del texto;
     * el servidor lo persiste en memoria y lo reenvía a todos los demás.
     * Payload: { userId, userName, color, content }
     */
    @MessageMapping("/document/{docId}/edit")
    public void edit(@DestinationVariable String docId,
                     @Payload Map<String, String> payload) {
        String content = payload.getOrDefault("content", "");
        docContents.put(docId, content);

        Map<String, Object> update = new LinkedHashMap<>();
        update.put("userId",   payload.getOrDefault("userId", ""));
        update.put("userName", payload.getOrDefault("userName", "Anónimo"));
        update.put("color",    payload.getOrDefault("color", "#722ed1"));
        update.put("content",  content);
        update.put("timestamp", Instant.now().toString());
        messaging.convertAndSend("/topic/document/" + docId + "/edit", update);
    }

    // ── REST: snapshot de la sesión activa ────────────────────────────────────

    @ResponseBody
    @GetMapping("/api/documents/{docId}/session")
    public ResponseEntity<List<UserInfo>> getSession(@PathVariable String docId) {
        List<UserInfo> users = new ArrayList<>(
                sessions.getOrDefault(docId, Map.of()).values());
        return ResponseEntity.ok(users);
    }

    @ResponseBody
    @GetMapping("/api/documents/{docId}/content")
    public ResponseEntity<Map<String, String>> getContent(@PathVariable String docId) {
        return ResponseEntity.ok(Map.of("content", docContents.getOrDefault(docId, "")));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private void broadcastSession(String docId, String type) {
        SessionUpdate update = new SessionUpdate();
        update.setType(type);
        update.setUsers(new ArrayList<>(
                sessions.getOrDefault(docId, Map.of()).values()));
        messaging.convertAndSend("/topic/document/" + docId + "/session", update);
    }
}
