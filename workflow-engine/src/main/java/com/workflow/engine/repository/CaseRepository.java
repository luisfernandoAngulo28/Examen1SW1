package com.workflow.engine.repository;

import com.workflow.engine.model.Case;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CaseRepository extends MongoRepository<Case, String> {
    List<Case> findByPolicyId(String policyId);

    List<Case> findByClientId(String clientId);

    @Query("{ 'tasks.id': ?0 }")
    Optional<Case> findByTasksId(String taskId);
}
