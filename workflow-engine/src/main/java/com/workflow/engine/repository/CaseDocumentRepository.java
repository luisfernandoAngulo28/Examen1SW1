package com.workflow.engine.repository;

import com.workflow.engine.model.CaseDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CaseDocumentRepository extends MongoRepository<CaseDocument, String> {
    List<CaseDocument> findByCaseIdAndDeletedFalse(String caseId);
    List<CaseDocument> findByCaseIdAndNodeIdAndDeletedFalse(String caseId, String nodeId);
}
