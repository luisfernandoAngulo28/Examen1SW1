package com.workflow.engine.service;

import com.workflow.engine.model.*;
import com.workflow.engine.repository.CaseRepository;
import com.workflow.engine.repository.DepartmentRepository;
import com.workflow.engine.repository.PolicyRepository;
import com.workflow.engine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EventPublisher eventPublisher;
    private final NotificationService notificationService;
    @Lazy private final CaseViewService caseViewService;

    public List<Case> findAll() {
        return caseRepository.findAll();
    }

    public List<Case> findByClientId(String clientId) {
        return caseRepository.findByClientId(clientId);
    }

    public void deleteById(String id) {
        caseRepository.deleteById(id);
    }

    public void deleteAll() {
        caseRepository.deleteAll();
    }

    public List<Case> findByPolicyId(String policyId) {
        return caseRepository.findByPolicyId(policyId);
    }

    public Case findById(String id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caso no encontrado"));
    }

    public Case startCase(String policyId) {
        return startCaseInternal(policyId, null);
    }

    public Case startCaseForClient(String policyId, String clientId) {
        return startCaseInternal(policyId, clientId);
    }

    private Case startCaseInternal(String policyId, String clientId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Política no encontrada"));

        PolicyNode initialNode = policy.getNodes().stream()
                .filter(n -> n.getNodeType() == NodeType.INITIAL)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("La política no tiene nodo inicial"));

        Case newCase = new Case();
        newCase.setPolicyId(policyId);
        newCase.setStatus(CaseStatus.IN_PROGRESS);
        if (clientId != null) newCase.setClientId(clientId);

        // Auto-complete the INITIAL node immediately — it is structural, not a real user task
        Task initTask = new Task();
        initTask.setId(UUID.randomUUID().toString());
        initTask.setNodeId(initialNode.getId());
        initTask.setStatus(TaskStatus.DONE);
        initTask.setFinishedAt(Instant.now());
        newCase.getTasks().add(initTask);
        newCase.setCurrentNodeId(initialNode.getId());

        // Create the first real task(s) from INITIAL's outgoing edges
        List<PolicyEdge> firstEdges = policy.getEdges().stream()
                .filter(e -> e.getFromNodeId().equals(initialNode.getId()))
                .toList();
        for (PolicyEdge edge : firstEdges) {
            Task firstTask = new Task();
            firstTask.setId(UUID.randomUUID().toString());
            firstTask.setNodeId(edge.getToNodeId());
            firstTask.setStatus(TaskStatus.PENDING);
            newCase.getTasks().add(firstTask);
            newCase.setCurrentNodeId(edge.getToNodeId());
        }

        EventLog log = new EventLog();
        log.setType("CASE_STARTED");
        newCase.getEventLogs().add(log);

        Case saved = caseRepository.save(newCase);
        eventPublisher.emitCaseStarted(caseViewService.toDetail(saved));
        return saved;
    }

    /** Legacy endpoint — kept for backward compat */
    public Case advanceCase(String caseId, String completedTaskId) {
        return processTaskCompletion(caseId, completedTaskId, null);
    }

    /** New: finds the case by taskId and processes completion with optional edge label for DECISION nodes */
    public Case completeTask(String taskId, String chosenEdgeLabel) {
        Case currentCase = caseRepository.findByTasksId(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        return processTaskCompletion(currentCase.getId(), taskId, chosenEdgeLabel);
    }

    public Case assignTask(String taskId, String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Case currentCase = caseRepository.findByTasksId(taskId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        Task task = currentCase.getTasks().stream()
                .filter(t -> t.getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        task.setAssignedUserId(userId);
        if (task.getStatus() == TaskStatus.PENDING) {
            task.setStatus(TaskStatus.IN_PROGRESS);
        }

        // Push notification — inform the assigned user
        userRepository.findById(userId).ifPresent(assignee -> {
            if (assignee.getFcmToken() != null) {
                Policy policy = policyRepository.findById(currentCase.getPolicyId()).orElse(null);
                String taskTitle = null;
                if (policy != null) {
                    taskTitle = policy.getNodes().stream()
                            .filter(n -> n.getId().equals(task.getNodeId()))
                            .map(PolicyNode::getTitle)
                            .findFirst().orElse(null);
                }
                notificationService.notifyTaskAssigned(assignee.getFcmToken(), taskTitle, currentCase.getId());
            }
        });

        EventLog log = new EventLog();
        log.setType("TASK_ASSIGNED");
        currentCase.getEventLogs().add(log);

        Case saved = caseRepository.save(currentCase);
        eventPublisher.emitTaskAssigned(caseViewService.toDetail(saved));
        return saved;
    }

    public Case cancelCase(String caseId) {
        Case currentCase = findById(caseId);
        currentCase.setStatus(CaseStatus.CANCELLED);
        currentCase.setFinishedAt(Instant.now());

        EventLog log = new EventLog();
        log.setType("CASE_CANCELLED");
        currentCase.getEventLogs().add(log);

        Case saved = caseRepository.save(currentCase);
        eventPublisher.emitCaseCancelled(caseViewService.toDetail(saved));
        return saved;
    }

    private Case processTaskCompletion(String caseId, String completedTaskId, String chosenEdgeLabel) {
        Case currentCase = findById(caseId);
        Policy policy = policyRepository.findById(currentCase.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Política no encontrada"));

        Task completedTask = currentCase.getTasks().stream()
                .filter(t -> t.getId().equals(completedTaskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        // Idempotency guard: if already DONE, skip re-processing to avoid duplicate tasks
        if (completedTask.getStatus() == TaskStatus.DONE) {
            return caseRepository.save(currentCase);
        }

        completedTask.setStatus(TaskStatus.DONE);
        completedTask.setFinishedAt(Instant.now());

        String currentNodeId = completedTask.getNodeId();
        List<PolicyEdge> outEdges = policy.getEdges().stream()
                .filter(e -> e.getFromNodeId().equals(currentNodeId))
                .toList();

        // For DECISION nodes: follow only the selected branch
        if (chosenEdgeLabel != null && !chosenEdgeLabel.isBlank()) {
            outEdges = outEdges.stream()
                    .filter(e -> chosenEdgeLabel.equals(e.getConditionLabel()))
                    .toList();
        }

        if (outEdges.isEmpty()) {
            currentCase.setStatus(CaseStatus.COMPLETED);
            currentCase.setFinishedAt(Instant.now());
            addEvent(currentCase, "CASE_COMPLETED");
        } else {
            for (PolicyEdge edge : outEdges) {
                String nextNodeId = edge.getToNodeId();
                PolicyNode nextNode = policy.getNodes().stream()
                        .filter(n -> n.getId().equals(nextNodeId))
                        .findFirst().orElse(null);

                if (nextNode == null) continue;

                if (nextNode.getNodeType() == NodeType.FINAL) {
                    currentCase.setStatus(CaseStatus.COMPLETED);
                    currentCase.setFinishedAt(Instant.now());
                    addEvent(currentCase, "CASE_COMPLETED");

                } else if (nextNode.getNodeType() == NodeType.FORK) {
                    // Auto-complete FORK and spawn all parallel branch tasks
                    Task forkTask = new Task();
                    forkTask.setId(UUID.randomUUID().toString());
                    forkTask.setNodeId(nextNodeId);
                    forkTask.setStatus(TaskStatus.DONE);
                    forkTask.setFinishedAt(Instant.now());
                    currentCase.getTasks().add(forkTask);
                    currentCase.setCurrentNodeId(nextNodeId);
                    addEvent(currentCase, "TASK_CREATED");

                    policy.getEdges().stream()
                            .filter(fe -> fe.getFromNodeId().equals(nextNodeId))
                            .forEach(fe -> {
                                Task parallelTask = new Task();
                                parallelTask.setId(UUID.randomUUID().toString());
                                parallelTask.setNodeId(fe.getToNodeId());
                                parallelTask.setStatus(TaskStatus.PENDING);
                                currentCase.getTasks().add(parallelTask);
                                addEvent(currentCase, "TASK_CREATED");
                            });

                } else if (nextNode.getNodeType() == NodeType.JOIN) {
                    // JOIN: advance only when ALL predecessor parallel-branch nodes are DONE
                    List<String> incomingNodeIds = policy.getEdges().stream()
                            .filter(je -> je.getToNodeId().equals(nextNodeId))
                            .map(PolicyEdge::getFromNodeId)
                            .toList();

                    boolean allBranchesDone = incomingNodeIds.stream().allMatch(srcId ->
                            currentCase.getTasks().stream()
                                    .filter(t -> t.getNodeId().equals(srcId))
                                    .anyMatch(t -> t.getStatus() == TaskStatus.DONE)
                    );

                    if (allBranchesDone) {
                        // Auto-complete JOIN and continue flow
                        Task joinTask = new Task();
                        joinTask.setId(UUID.randomUUID().toString());
                        joinTask.setNodeId(nextNodeId);
                        joinTask.setStatus(TaskStatus.DONE);
                        joinTask.setFinishedAt(Instant.now());
                        currentCase.getTasks().add(joinTask);
                        currentCase.setCurrentNodeId(nextNodeId);
                        addEvent(currentCase, "TASK_CREATED");

                        policy.getEdges().stream()
                                .filter(je -> je.getFromNodeId().equals(nextNodeId))
                                .forEach(je -> {
                                    PolicyNode afterJoin = policy.getNodes().stream()
                                            .filter(n -> n.getId().equals(je.getToNodeId()))
                                            .findFirst().orElse(null);
                                    if (afterJoin != null && afterJoin.getNodeType() == NodeType.FINAL) {
                                        currentCase.setStatus(CaseStatus.COMPLETED);
                                        currentCase.setFinishedAt(Instant.now());
                                        addEvent(currentCase, "CASE_COMPLETED");
                                    } else {
                                        Task postJoinTask = new Task();
                                        postJoinTask.setId(UUID.randomUUID().toString());
                                        postJoinTask.setNodeId(je.getToNodeId());
                                        postJoinTask.setStatus(TaskStatus.PENDING);
                                        currentCase.getTasks().add(postJoinTask);
                                        currentCase.setCurrentNodeId(je.getToNodeId());
                                        addEvent(currentCase, "TASK_CREATED");
                                    }
                                });
                    }
                    // If not all branches done yet: do nothing — JOIN waits silently

                } else if (nextNode.getNodeType() == NodeType.MERGE) {
                    // MERGE (UML 2.5): multiple incoming flows → 1 outgoing, no guards.
                    // Unlike JOIN, MERGE does NOT wait — it forwards the FIRST token that arrives.
                    // Idempotent: only create post-merge task if MERGE has not been traversed yet.
                    boolean alreadyMerged = currentCase.getTasks().stream()
                            .anyMatch(t -> t.getNodeId().equals(nextNodeId));
                    if (!alreadyMerged) {
                        Task mergeTask = new Task();
                        mergeTask.setId(UUID.randomUUID().toString());
                        mergeTask.setNodeId(nextNodeId);
                        mergeTask.setStatus(TaskStatus.DONE);
                        mergeTask.setFinishedAt(Instant.now());
                        currentCase.getTasks().add(mergeTask);
                        currentCase.setCurrentNodeId(nextNodeId);
                        addEvent(currentCase, "TASK_CREATED");

                        policy.getEdges().stream()
                                .filter(me -> me.getFromNodeId().equals(nextNodeId))
                                .forEach(me -> {
                                    PolicyNode afterMerge = policy.getNodes().stream()
                                            .filter(n -> n.getId().equals(me.getToNodeId()))
                                            .findFirst().orElse(null);
                                    if (afterMerge != null && afterMerge.getNodeType() == NodeType.FINAL) {
                                        currentCase.setStatus(CaseStatus.COMPLETED);
                                        currentCase.setFinishedAt(Instant.now());
                                        addEvent(currentCase, "CASE_COMPLETED");
                                    } else {
                                        Task postMergeTask = new Task();
                                        postMergeTask.setId(UUID.randomUUID().toString());
                                        postMergeTask.setNodeId(me.getToNodeId());
                                        postMergeTask.setStatus(TaskStatus.PENDING);
                                        currentCase.getTasks().add(postMergeTask);
                                        currentCase.setCurrentNodeId(me.getToNodeId());
                                        addEvent(currentCase, "TASK_CREATED");
                                    }
                                });
                    }
                    // Subsequent tokens arriving at MERGE are discarded (UML 2.5 semantics)

                } else {
                    Task newTask = new Task();
                    newTask.setId(UUID.randomUUID().toString());
                    newTask.setNodeId(nextNodeId);
                    newTask.setStatus(TaskStatus.PENDING);
                    currentCase.getTasks().add(newTask);
                    currentCase.setCurrentNodeId(nextNodeId);
                    addEvent(currentCase, "TASK_CREATED");
                }
            }
        }

        Case saved = caseRepository.save(currentCase);
        emitCompletionEvents(saved);
        return saved;
    }

    private void emitCompletionEvents(Case saved) {
        var dto = caseViewService.toDetail(saved);
        Policy policy = policyRepository.findById(saved.getPolicyId()).orElse(null);
        String policyName = policy != null ? policy.getName() : null;

        if (saved.getStatus() == CaseStatus.COMPLETED) {
            eventPublisher.emitCaseCompleted(dto);
            // Push notification to every officer who participated
            saved.getTasks().stream()
                    .map(com.workflow.engine.model.Task::getAssignedUserId)
                    .filter(uid -> uid != null)
                    .distinct()
                    .forEach(uid -> userRepository.findById(uid).ifPresent(u -> {
                        if (u.getFcmToken() != null) {
                            notificationService.notifyCaseCompleted(u.getFcmToken(), policyName, saved.getId());
                        }
                    }));
            // Push notification to the client (if exists)
            if (saved.getClientId() != null) {
                userRepository.findById(saved.getClientId()).ifPresent(client -> {
                    if (client.getFcmToken() != null) {
                        notificationService.notifyClientCaseCompleted(client.getFcmToken(), policyName, saved.getId());
                    }
                });
            }
        } else {
            // Case advanced: notify the client about the new active department/task
            if (saved.getClientId() != null && policy != null) {
                // Find the first PENDING task
                saved.getTasks().stream()
                        .filter(t -> t.getStatus() == com.workflow.engine.model.TaskStatus.PENDING)
                        .findFirst()
                        .ifPresent(pendingTask -> {
                            policy.getNodes().stream()
                                    .filter(n -> n.getId().equals(pendingTask.getNodeId()))
                                    .findFirst()
                                    .ifPresent(node -> {
                                        String deptName = null;
                                        if (node.getDepartmentId() != null) {
                                            deptName = departmentRepository.findById(node.getDepartmentId())
                                                    .map(d -> d.getName()).orElse(null);
                                        }
                                        final String dept = deptName;
                                        final String taskTitle = node.getTitle();
                                        userRepository.findById(saved.getClientId()).ifPresent(client -> {
                                            if (client.getFcmToken() != null) {
                                                notificationService.notifyClientCaseAdvanced(
                                                        client.getFcmToken(), dept, taskTitle, saved.getId());
                                            }
                                        });
                                    });
                        });
            }
        }
        eventPublisher.emitTaskCompleted(dto);
    }

    private void addEvent(Case currentCase, String type) {
        EventLog log = new EventLog();
        log.setType(type);
        currentCase.getEventLogs().add(log);
    }
}
