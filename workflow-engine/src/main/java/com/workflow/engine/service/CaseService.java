package com.workflow.engine.service;

import com.workflow.engine.model.*;
import com.workflow.engine.repository.CaseRepository;
import com.workflow.engine.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final PolicyRepository policyRepository;

    public List<Case> findAll() {
        return caseRepository.findAll();
    }

    public Case findById(String id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caso no encontrado"));
    }

    public Case startCase(String policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Política no encontrada"));

        // Find initial node
        PolicyNode initialNode = policy.getNodes().stream()
                .filter(n -> n.getNodeType() == NodeType.INITIAL)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("La política no tiene nodo inicial"));

        Case newCase = new Case();
        newCase.setPolicyId(policyId);
        newCase.setCurrentNodeId(initialNode.getId());
        newCase.setStatus(CaseStatus.IN_PROGRESS);

        // Create first task
        Task task = new Task();
        task.setId(UUID.randomUUID().toString());
        task.setNodeId(initialNode.getId());
        task.setStatus(TaskStatus.PENDING);
        newCase.getTasks().add(task);

        // Log event
        EventLog log = new EventLog();
        log.setType("CASE_STARTED");
        newCase.getEventLogs().add(log);

        return caseRepository.save(newCase);
    }

    public Case advanceCase(String caseId, String completedTaskId) {
        Case currentCase = findById(caseId);
        Policy policy = policyRepository.findById(currentCase.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Política no encontrada"));

        // Mark task as done
        Task completedTask = currentCase.getTasks().stream()
                .filter(t -> t.getId().equals(completedTaskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        completedTask.setStatus(TaskStatus.DONE);
        completedTask.setFinishedAt(Instant.now());

        // Find next nodes via edges
        String currentNodeId = completedTask.getNodeId();
        List<PolicyEdge> outEdges = policy.getEdges().stream()
                .filter(e -> e.getFromNodeId().equals(currentNodeId))
                .toList();

        if (outEdges.isEmpty()) {
            // No more edges - case completed
            currentCase.setStatus(CaseStatus.COMPLETED);
            currentCase.setFinishedAt(Instant.now());

            EventLog log = new EventLog();
            log.setType("CASE_COMPLETED");
            currentCase.getEventLogs().add(log);
        } else {
            // Create tasks for next nodes
            for (PolicyEdge edge : outEdges) {
                String nextNodeId = edge.getToNodeId();
                PolicyNode nextNode = policy.getNodes().stream()
                        .filter(n -> n.getId().equals(nextNodeId))
                        .findFirst().orElse(null);

                if (nextNode != null && nextNode.getNodeType() == NodeType.FINAL) {
                    currentCase.setStatus(CaseStatus.COMPLETED);
                    currentCase.setFinishedAt(Instant.now());

                    EventLog log = new EventLog();
                    log.setType("CASE_COMPLETED");
                    currentCase.getEventLogs().add(log);
                } else {
                    Task newTask = new Task();
                    newTask.setId(UUID.randomUUID().toString());
                    newTask.setNodeId(nextNodeId);
                    newTask.setStatus(TaskStatus.PENDING);
                    currentCase.getTasks().add(newTask);

                    currentCase.setCurrentNodeId(nextNodeId);

                    EventLog log = new EventLog();
                    log.setType("TASK_CREATED");
                    currentCase.getEventLogs().add(log);
                }
            }
        }

        return caseRepository.save(currentCase);
    }
}
