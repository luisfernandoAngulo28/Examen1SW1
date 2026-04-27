package com.workflow.engine.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Thin wrapper over SimpMessagingTemplate.
 * All real-time events are published to /topic/events with shape:
 *   { "type": "<event>", "data": <payload> }
 */
@Service
@RequiredArgsConstructor
public class EventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String TOPIC = "/topic/events";

    public void emitCaseStarted(Object caseData) {
        send("case:started", caseData);
    }

    public void emitTaskCompleted(Object caseData) {
        send("task:completed", caseData);
    }

    public void emitTaskAssigned(Object data) {
        send("task:assigned", data);
    }

    public void emitCaseCompleted(Object caseData) {
        send("case:completed", caseData);
    }

    public void emitCaseCancelled(Object caseData) {
        send("case:cancelled", caseData);
    }

    public void emitPolicyUpdated(String policyId) {
        send("policy:updated", Map.of("policyId", policyId));
    }

    private void send(String type, Object data) {
        messagingTemplate.convertAndSend(TOPIC, Map.of("type", type, "data", data));
    }
}
