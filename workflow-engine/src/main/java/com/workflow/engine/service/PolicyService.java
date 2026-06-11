package com.workflow.engine.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.engine.model.Policy;
import com.workflow.engine.model.PolicyEdge;
import com.workflow.engine.model.PolicyNode;
import com.workflow.engine.model.PolicyRequirement;
import com.workflow.engine.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final ObjectMapper objectMapper;

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
        existing.setVersion(existing.getVersion() + 1);
        return policyRepository.save(existing);
    }

    @SuppressWarnings("unchecked")
    public Policy updateGraph(String id, Map<String, Object> body) {
        Policy existing = findById(id);

        // Convert raw lists from JSON to typed lists via ObjectMapper
        Object rawNodes = body.get("nodes");
        Object rawEdges = body.get("edges");

        if (rawNodes instanceof List<?>) {
            List<PolicyNode> nodes = objectMapper.convertValue(rawNodes,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, PolicyNode.class));
            existing.setNodes(nodes);
        }
        if (rawEdges instanceof List<?>) {
            List<PolicyEdge> edges = objectMapper.convertValue(rawEdges,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, PolicyEdge.class));
            existing.setEdges(edges);
        }

        existing.setVersion(existing.getVersion() + 1);
        return policyRepository.save(existing);
    }

    public void delete(String id) {
        policyRepository.deleteById(id);
    }

    public Policy updateNodeRequirements(String policyId, String nodeId, List<PolicyRequirement> requirements) {
        Policy policy = findById(policyId);
        policy.getNodes().stream()
                .filter(n -> n.getId().equals(nodeId))
                .findFirst()
                .ifPresent(n -> n.setRequirements(requirements));
        return policyRepository.save(policy);
    }
}
