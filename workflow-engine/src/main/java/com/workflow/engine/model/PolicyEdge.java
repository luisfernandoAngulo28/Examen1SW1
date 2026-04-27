package com.workflow.engine.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
public class PolicyEdge {
    @Field("id")
    private String id;
    private String fromNodeId;
    private String toNodeId;
    private FlowType flowType;
    private String conditionLabel;
    private Object conditionJson;
}
