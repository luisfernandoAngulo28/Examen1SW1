package com.workflow.engine.repository;

import com.workflow.engine.model.Case;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CaseRepository extends MongoRepository<Case, String> {
    List<Case> findByPolicyId(String policyId);
}
