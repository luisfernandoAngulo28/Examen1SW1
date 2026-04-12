package com.workflow.engine.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "policies")
public class Policy {
    @Id
    private String id;

    private String name;
    private PolicyStatus status = PolicyStatus.ACTIVE;
    private String createdBy;

    private List<PolicyNode> nodes = new ArrayList<>();
    private List<PolicyEdge> edges = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
