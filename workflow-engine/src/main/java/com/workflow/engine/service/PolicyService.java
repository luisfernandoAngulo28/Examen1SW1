package com.workflow.engine.service;

import com.workflow.engine.model.Policy;
import com.workflow.engine.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;

    public List<Policy> findAll() {
        return policyRepository.findAll();
    }

    public Policy findById(String id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Política no encontrada"));
    }

    public Policy create(Policy policy) {
        return policyRepository.save(policy);
    }

    public Policy update(String id, Policy policy) {
        Policy existing = findById(id);
        existing.setName(policy.getName());
        existing.setStatus(policy.getStatus());
        existing.setNodes(policy.getNodes());
        existing.setEdges(policy.getEdges());
        return policyRepository.save(existing);
    }

    public void delete(String id) {
        policyRepository.deleteById(id);
    }
}
