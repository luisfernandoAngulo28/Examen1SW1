package com.workflow.engine.model;

import lombok.Data;

@Data
public class PolicyNode {
    private String id;
    private String departmentId;
    private NodeType nodeType;
    private String title;
    private String description;
    private double positionX;
    private double positionY;
    private Object formTemplate;
}
