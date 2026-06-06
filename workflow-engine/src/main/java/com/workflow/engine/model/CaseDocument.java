package com.workflow.engine.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Metadata de un documento almacenado en S3.
 * El contenido real vive en S3; aquí solo guardamos la referencia y el historial.
 */
@Data
@Document(collection = "case_documents")
public class CaseDocument {
    @Id
    private String id;

    /** Trámite al que pertenece este documento */
    private String caseId;

    /** Nodo donde se subió el documento (null = accesible en todo el flujo) */
    private String nodeId;

    private String fileName;
    private String contentType;
    private long fileSize;

    /** Clave en el bucket S3: cases/{caseId}/{id}/{fileName} */
    private String s3Key;

    private String uploadedBy;
    private String uploadedByName;
    private Instant uploadedAt = Instant.now();

    private boolean deleted = false;

    /**
     * Permisos por usuario: userId → "VIEW" | "UPLOAD" | "EDIT" | "ADMIN"
     * Si está vacío, todos los usuarios del trámite tienen VIEW_EDIT por defecto.
     */
    private Map<String, String> userPermissions = new HashMap<>();

    private List<DocumentAudit> auditLogs = new ArrayList<>();
}
