package com.workflow.engine.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Data
public class PolicyNode {
    @Field("id")
    private String id;
    private String departmentId;
    private NodeType nodeType;
    private String title;
    private String description;
    private double positionX;
    private double positionY;
    private Object formTemplate;

    /**
     * Nivel de acceso a documentos que tienen los funcionarios que procesan este nodo.
     * NONE = sin acceso, VIEW = solo lectura, VIEW_EDIT = lectura+subida, FULL = + eliminar
     */
    private String documentPermission = "VIEW_EDIT";

    /**
     * Documentos/requisitos que el cliente debe entregar.
     * El agente inteligente los solicita uno a uno durante el inicio del trámite.
     * Solo relevante en el nodo INITIAL de la política.
     */
    private List<PolicyRequirement> requirements = new ArrayList<>();
}
