package com.workflow.engine.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "cases")
public class Case {
    @Id
    private String id;

    private String policyId;
    private String currentNodeId;
    private CaseStatus status = CaseStatus.OPEN;

    /** Id del cliente (role=CLIENT) que inició este trámite, puede ser null si fue creado internamente */
    private String clientId;

    private List<Task> tasks = new ArrayList<>();
    private List<EventLog> eventLogs = new ArrayList<>();

    private Instant startedAt = Instant.now();
    private Instant finishedAt;
}
