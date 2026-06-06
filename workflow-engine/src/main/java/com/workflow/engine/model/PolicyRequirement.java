package com.workflow.engine.model;

import lombok.Data;

/**
 * Requisito de documentación configurado por el DESIGNER en un nodo de política.
 * El agente inteligente solicita estos documentos al cliente antes de iniciar el trámite.
 */
@Data
public class PolicyRequirement {
    /** Nombre descriptivo del requisito, ej: "Carnet de identidad" */
    private String name;

    /** Instrucción para el cliente, ej: "Sube una foto clara de ambas caras" */
    private String description;

    /** true = el cliente no puede iniciar el trámite sin este documento */
    private boolean required = true;

    /** Tipos de archivo aceptados, ej: ["image/jpeg","image/png","application/pdf"] */
    private java.util.List<String> acceptedTypes = new java.util.ArrayList<>();
}
