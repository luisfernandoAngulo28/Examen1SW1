package com.workflow.engine.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "departments")
public class Department {
    @Id
    private String id;
    private String name;

    @CreatedDate
    private Instant createdAt;
}
