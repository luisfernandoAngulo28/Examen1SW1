package com.workflow.engine.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Sends Firebase Cloud Messaging (FCM) push notifications to mobile devices.
 * Fails silently if Firebase is not configured — the rest of the app keeps working.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    /**
     * Send a push notification to a specific device token.
     *
     * @param fcmToken   device FCM token (stored in User.fcmToken)
     * @param title      notification title
     * @param body       notification body text
     * @param dataKey    extra data key  (can be null)
     * @param dataValue  extra data value (can be null)
     */
    public void send(String fcmToken, String title, String body, String dataKey, String dataValue) {
        if (fcmToken == null || fcmToken.isBlank()) {
            return; // User has no registered device
        }
        if (FirebaseApp.getApps().isEmpty()) {
            log.debug("Firebase no inicializado — notificación omitida: {}", title);
            return;
        }

        try {
            Message.Builder builder = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setToken(fcmToken);

            if (dataKey != null && dataValue != null) {
                builder.putData(dataKey, dataValue);
            }

            String messageId = FirebaseMessaging.getInstance().send(builder.build());
            log.info("Push enviado ({}): {}", messageId, title);
        } catch (Exception e) {
            log.warn("Error enviando push notification: {}", e.getMessage());
        }
    }

    // ── Convenience methods ────────────────────────────────────────────────

    /** Notify a user that a new task has been assigned to them. */
    public void notifyTaskAssigned(String fcmToken, String taskTitle, String caseId) {
        send(fcmToken,
                "Nueva tarea asignada",
                taskTitle != null ? taskTitle : "Tienes una nueva tarea pendiente",
                "caseId", caseId);
    }

    /** Notify a user that a case they participated in was completed. */
    public void notifyCaseCompleted(String fcmToken, String policyName, String caseId) {
        send(fcmToken,
                "Caso finalizado",
                "El caso de \"" + (policyName != null ? policyName : "la política") + "\" fue completado",
                "caseId", caseId);
    }

    /** Notify a user that it's their turn in the workflow (new PENDING task they already own). */
    public void notifyTurnActivated(String fcmToken, String taskTitle, String caseId) {
        send(fcmToken,
                "Es tu turno",
                "La tarea \"" + (taskTitle != null ? taskTitle : "pendiente") + "\" está lista para procesar",
                "caseId", caseId);
    }

    // ── Client-facing notifications ───────────────────────────────────────

    /** Notify a CLIENT that their case (trámite) moved to a new department. */
    public void notifyClientCaseAdvanced(String fcmToken, String department, String taskTitle, String caseId) {
        String dept = department != null ? department : "siguiente paso";
        String step = taskTitle != null ? " (" + taskTitle + ")" : "";
        send(fcmToken,
                "Tu trámite avanzó",
                "Ahora está en: " + dept + step,
                "caseId", caseId);
    }

    /** Notify a CLIENT that their trámite has been fully completed. */
    public void notifyClientCaseCompleted(String fcmToken, String policyName, String caseId) {
        send(fcmToken,
                "¡Trámite completado!",
                "Tu trámite de \"" + (policyName != null ? policyName : "la solicitud") + "\" fue completado exitosamente",
                "caseId", caseId);
    }
}
