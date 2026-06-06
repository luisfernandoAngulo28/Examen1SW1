package com.workflow.engine.model;

import lombok.Data;
import java.time.Instant;

@Data
public class DocumentAudit {
    private String userId;
    private String userName;
    /** UPLOADED | VIEWED | DOWNLOADED | DELETED | MODIFIED */
    private String action;
    private Instant timestamp = Instant.now();
}
