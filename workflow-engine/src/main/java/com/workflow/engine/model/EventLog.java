package com.workflow.engine.model;

import lombok.Data;
import java.time.Instant;

@Data
public class EventLog {
    private String type;
    private String userId;
    private String userName;
    private Object payloadJson;
    private Instant createdAt = Instant.now();
}
