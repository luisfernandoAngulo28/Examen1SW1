package com.workflow.engine.model;

import lombok.Data;
import java.time.Instant;

@Data
public class Task {
    private String id;
    private String nodeId;
    private String assignedUserId;
    private TaskStatus status = TaskStatus.PENDING;
    private FormSubmission formSubmission;
    private Instant startedAt = Instant.now();
    private Instant finishedAt;
    private Instant dueAt;
}
