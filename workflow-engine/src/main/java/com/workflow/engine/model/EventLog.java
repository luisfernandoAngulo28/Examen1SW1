package com.workflow.engine.model;

import lombok.Data;
import java.time.Instant;

@Data
public class EventLog {
    private String type;
    private Object payloadJson;
    private Instant createdAt = Instant.now();
}
