package com.workflow.engine.controller;

import com.workflow.engine.model.*;
import com.workflow.engine.repository.CaseRepository;
import com.workflow.engine.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormsController {

    private final PolicyRepository policyRepository;
    private final CaseRepository caseRepository;

    /** Returns the form template (schemaJson) for a given policy node. */
    @GetMapping("/template/{nodeId}")
    public ResponseEntity<Map<String, Object>> getTemplate(@PathVariable String nodeId) {
        return policyRepository.findByNodeId(nodeId)
                .flatMap(policy -> policy.getNodes().stream()
                        .filter(n -> n.getId().equals(nodeId))
                        .findFirst())
                .filter(node -> node.getFormTemplate() != null)
                .map(node -> ResponseEntity.ok(Map.of("schemaJson", node.getFormTemplate())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Returns the saved form submission for a task. */
    @GetMapping("/submission/{taskId}")
    public ResponseEntity<?> getSubmission(@PathVariable String taskId) {
        return caseRepository.findByTasksId(taskId)
                .flatMap(c -> c.getTasks().stream()
                        .filter(t -> t.getId().equals(taskId))
                        .findFirst())
                .filter(t -> t.getFormSubmission() != null)
                .map(t -> ResponseEntity.ok(t.getFormSubmission()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Saves (or replaces) the form template schema on a policy node. */
    @PutMapping("/template/{nodeId}")
    public ResponseEntity<?> saveTemplate(@PathVariable String nodeId,
                                          @RequestBody Map<String, Object> body) {
        return policyRepository.findByNodeId(nodeId).map(policy -> {
            policy.getNodes().stream()
                    .filter(n -> n.getId().equals(nodeId))
                    .findFirst()
                    .ifPresent(n -> n.setFormTemplate(body.get("schemaJson")));
            policyRepository.save(policy);
            return ResponseEntity.ok(Map.of("ok", true));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Saves (or overwrites) a form submission for a task. */
    @PostMapping("/submit/{taskId}")
    public ResponseEntity<?> submitForm(@PathVariable String taskId,
                                        @RequestBody Map<String, Object> body) {
        return caseRepository.findByTasksId(taskId).map(currentCase -> {
            Task task = currentCase.getTasks().stream()
                    .filter(t -> t.getId().equals(taskId))
                    .findFirst()
                    .orElse(null);
            if (task == null) return ResponseEntity.notFound().build();

            FormSubmission submission = new FormSubmission();
            submission.setId(UUID.randomUUID().toString());
            submission.setPayloadJson(body.get("payloadJson"));

            if (body.containsKey("inputMode")) {
                try {
                    submission.setInputMode(InputMode.valueOf((String) body.get("inputMode")));
                } catch (IllegalArgumentException ignored) {}
            }

            task.setFormSubmission(submission);
            caseRepository.save(currentCase);
            return ResponseEntity.ok((Object) submission);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
