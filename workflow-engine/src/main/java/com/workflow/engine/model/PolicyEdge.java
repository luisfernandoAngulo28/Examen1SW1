package com.workflow.engine.model;

import lombok.Data;

@Data
public class PolicyEdge {
    private String id;
    private String fromNodeId;
    private String toNodeId;
    private FlowType flowType;
    private String conditionLabel;
    private Object conditionJson;
}
