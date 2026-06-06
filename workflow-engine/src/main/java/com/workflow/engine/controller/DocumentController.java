package com.workflow.engine.controller;

import com.workflow.engine.model.CaseDocument;
import com.workflow.engine.model.DocumentAudit;
import com.workflow.engine.model.User;
import com.workflow.engine.repository.PolicyRepository;
import com.workflow.engine.repository.CaseRepository;
import com.workflow.engine.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Document management endpoints — Mejora 1 (Ciclo 2).
 *
 * GET  /api/documents/case/{caseId}         — lista documentos del trámite
 * POST /api/documents/upload                — subir documento (multipart)
 * GET  /api/documents/{id}/download-url     — URL pre-firmada S3 (15 min)
 * GET  /api/documents/{id}/audit            — historial de accesos
 * DELETE /api/documents/{id}               — borrado lógico
 * GET  /api/documents/{caseId}/permissions/{nodeId} — permisos del nodo actual
 */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final PolicyRepository policyRepository;
    private final CaseRepository caseRepository;

    // ── List documents for a case ─────────────────────────────────────────────

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<CaseDocument>> listByCase(@PathVariable String caseId) {
        return ResponseEntity.ok(documentService.listByCase(caseId));
    }

    // ── Upload ────────────────────────────────────────────────────────────────

    @PostMapping("/upload")
    public ResponseEntity<CaseDocument> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("caseId") String caseId,
            @RequestParam(value = "nodeId", required = false) String nodeId) throws IOException {

        User currentUser = currentUser();
        CaseDocument doc = documentService.upload(
                file, caseId, nodeId, currentUser.getId(), currentUser.getName());
        return ResponseEntity.ok(doc);
    }

    // ── Download URL ──────────────────────────────────────────────────────────

    @GetMapping("/{id}/download-url")
    public ResponseEntity<Map<String, Object>> downloadUrl(@PathVariable String id) {
        User currentUser = currentUser();
        String url = documentService.getDownloadUrl(id, currentUser.getId(), currentUser.getName());
        return ResponseEntity.ok(Map.of(
                "url", url,
                "s3Available", documentService.isS3Available()
        ));
    }

    // ── Audit log ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}/audit")
    public ResponseEntity<List<DocumentAudit>> getAudit(@PathVariable String id) {
        User currentUser = currentUser();
        return ResponseEntity.ok(
                documentService.getAudit(id, currentUser.getId(), currentUser.getName()));
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        User currentUser = currentUser();
        documentService.delete(id, currentUser.getId(), currentUser.getName());
        return ResponseEntity.noContent().build();
    }

    // ── User-level permissions ────────────────────────────────────────────────

    /**
     * Updates per-user permissions on a document.
     * Body: { "userId": "permission" }  (VIEW | UPLOAD | EDIT | ADMIN)
     * Only the uploader or an ADMIN can change permissions.
     */
    @PutMapping("/{id}/user-permissions")
    public ResponseEntity<CaseDocument> updateUserPermissions(
            @PathVariable String id,
            @RequestBody Map<String, String> permissions) {

        return documentService.updateUserPermissions(id, permissions, currentUser())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Returns effective permission for the current user on a document.
     * VIEW | UPLOAD | EDIT | ADMIN | NONE
     */
    @GetMapping("/{id}/my-permission")
    public ResponseEntity<Map<String, String>> myPermission(@PathVariable String id) {
        String perm = documentService.getEffectivePermission(id, currentUser().getId());
        return ResponseEntity.ok(Map.of("permission", perm));
    }

    // ── Node document permissions ─────────────────────────────────────────────

    /**
     * Returns the documentPermission value for a given node in the case's policy.
     * Frontend uses this to show/hide upload and delete buttons.
     */
    @GetMapping("/{caseId}/permissions/{nodeId}")
    public ResponseEntity<Map<String, String>> getNodePermission(
            @PathVariable String caseId,
            @PathVariable String nodeId) {

        String permission = caseRepository.findById(caseId)
                .flatMap(c -> policyRepository.findById(c.getPolicyId()))
                .flatMap(p -> p.getNodes().stream()
                        .filter(n -> n.getId().equals(nodeId))
                        .findFirst())
                .map(n -> n.getDocumentPermission() != null ? n.getDocumentPermission() : "VIEW_EDIT")
                .orElse("VIEW_EDIT");

        return ResponseEntity.ok(Map.of("permission", permission));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
