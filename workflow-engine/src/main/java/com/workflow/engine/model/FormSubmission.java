package com.workflow.engine.model;

import lombok.Data;
import java.time.Instant;

@Data
public class FormSubmission {
    private String id;
    private Object payloadJson;
    private InputMode inputMode = InputMode.MANUAL;
    private Instant createdAt = Instant.now();
}
