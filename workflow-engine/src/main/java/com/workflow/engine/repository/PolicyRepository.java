package com.workflow.engine.repository;

import com.workflow.engine.model.Policy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface PolicyRepository extends MongoRepository<Policy, String> {

    @Query("{ 'nodes.id': ?0 }")
    Optional<Policy> findByNodeId(String nodeId);
}
