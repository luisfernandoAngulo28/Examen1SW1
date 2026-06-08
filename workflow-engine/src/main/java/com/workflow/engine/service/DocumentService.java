package com.workflow.engine.service;

import com.workflow.engine.model.CaseDocument;
import com.workflow.engine.model.DocumentAudit;
import com.workflow.engine.repository.CaseDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    @Value("${aws.s3.bucket:}")
    private String bucket;

    @Value("${aws.region:${aws.s3.region:sa-east-1}}")
    private String region;

    @Value("${aws.access-key-id:}")
    private String accessKeyId;

    @Value("${aws.secret-access-key:}")
    private String secretAccessKey;

    private final CaseDocumentRepository documentRepository;

    private S3Client s3;
    private S3Presigner presigner;
    private boolean s3Available = false;

    @PostConstruct
    void init() {
        if (accessKeyId.isBlank() || secretAccessKey.isBlank() || bucket.isBlank()) {
            // S3 not configured — service runs in degraded mode (metadata only)
            return;
        }
        try {
            var creds = StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKeyId, secretAccessKey));
            s3 = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(creds)
                    .build();
            presigner = S3Presigner.builder()
                    .region(Region.of(region))
                    .credentialsProvider(creds)
                    .build();
            s3Available = true;
        } catch (Exception e) {
            // Leave s3Available = false
        }
    }

    // ── Upload ────────────────────────────────────────────────────────────────

    public CaseDocument upload(
            MultipartFile file,
            String caseId,
            String nodeId,
            String userId,
            String userName) throws IOException {

        String docId  = UUID.randomUUID().toString();
        String s3Key  = "cases/" + caseId + "/" + docId + "/" + file.getOriginalFilename();

        if (s3Available) {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(s3Key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        }

        CaseDocument doc = new CaseDocument();
        doc.setId(docId);
        doc.setCaseId(caseId);
        doc.setNodeId(nodeId);
        doc.setFileName(file.getOriginalFilename());
        doc.setContentType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setS3Key(s3Key);
        doc.setUploadedBy(userId);
        doc.setUploadedByName(userName);
        doc.setUploadedAt(Instant.now());

        DocumentAudit audit = new DocumentAudit();
        audit.setUserId(userId);
        audit.setUserName(userName);
        audit.setAction("UPLOADED");
        doc.getAuditLogs().add(audit);

        return documentRepository.save(doc);
    }

    // ── List ──────────────────────────────────────────────────────────────────

    public List<CaseDocument> listByCase(String caseId) {
        return documentRepository.findByCaseIdAndDeletedFalse(caseId);
    }

    // ── Pre-signed download URL ───────────────────────────────────────────────

    public String getDownloadUrl(String docId, String userId, String userName) {
        CaseDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        // Audit
        DocumentAudit audit = new DocumentAudit();
        audit.setUserId(userId);
        audit.setUserName(userName);
        audit.setAction("DOWNLOADED");
        doc.getAuditLogs().add(audit);
        documentRepository.save(doc);

        if (!s3Available) {
            return "/api/documents/" + docId + "/content";
        }

        GetObjectPresignRequest presignReq = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(r -> r.bucket(bucket).key(doc.getS3Key()))
                .build();

        PresignedGetObjectRequest presigned = presigner.presignGetObject(presignReq);
        return presigned.url().toString();
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void delete(String docId, String userId, String userName) {
        CaseDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        if (s3Available) {
            try {
                s3.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucket).key(doc.getS3Key()).build());
            } catch (Exception ignored) {}
        }

        DocumentAudit audit = new DocumentAudit();
        audit.setUserId(userId);
        audit.setUserName(userName);
        audit.setAction("DELETED");
        doc.getAuditLogs().add(audit);
        doc.setDeleted(true);
        documentRepository.save(doc);
    }

    // ── Audit log ─────────────────────────────────────────────────────────────

    public List<DocumentAudit> getAudit(String docId, String userId, String userName) {
        CaseDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        DocumentAudit audit = new DocumentAudit();
        audit.setUserId(userId);
        audit.setUserName(userName);
        audit.setAction("VIEWED");
        doc.getAuditLogs().add(audit);
        documentRepository.save(doc);

        return doc.getAuditLogs();
    }

    public boolean isS3Available() { return s3Available; }

    // ── User-level permissions ────────────────────────────────────────────────

    public java.util.Optional<CaseDocument> updateUserPermissions(
            String docId, java.util.Map<String, String> permissions,
            com.workflow.engine.model.User currentUser) {

        return documentRepository.findById(docId).map(doc -> {
            // Only uploader or ADMIN can change permissions
            boolean isUploader = currentUser.getId().equals(doc.getUploadedBy());
            boolean isAdmin = currentUser.getRole() != null &&
                    currentUser.getRole().name().contains("ADMIN");
            if (!isUploader && !isAdmin) return doc; // silently ignore

            doc.getUserPermissions().putAll(permissions);

            DocumentAudit audit = new DocumentAudit();
            audit.setUserId(currentUser.getId());
            audit.setUserName(currentUser.getName());
            audit.setAction("PERMISSIONS_UPDATED");
            doc.getAuditLogs().add(audit);
            return documentRepository.save(doc);
        });
    }

    public String getEffectivePermission(String docId, String userId) {
        return documentRepository.findById(docId).map(doc -> {
            if (doc.getUserPermissions().containsKey(userId)) {
                return doc.getUserPermissions().get(userId);
            }
            return "EDIT"; // default
        }).orElse("NONE");
    }
}
