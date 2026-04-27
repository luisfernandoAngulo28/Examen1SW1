package com.workflow.engine.controller;

import com.workflow.engine.model.Policy;
import com.workflow.engine.service.EventPublisher;
import com.workflow.engine.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final EventPublisher eventPublisher;

    @GetMapping
    public ResponseEntity<List<Policy>> findAll() {
        return ResponseEntity.ok(policyService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Policy> findById(@PathVariable String id) {
        return ResponseEntity.ok(policyService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('DESIGNER')")
    public ResponseEntity<Policy> create(@RequestBody Policy policy) {
        return ResponseEntity.ok(policyService.create(policy));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DESIGNER')")
    public ResponseEntity<Policy> update(@PathVariable String id, @RequestBody Policy policy) {
        return ResponseEntity.ok(policyService.update(id, policy));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DESIGNER')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        policyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Saves only nodes+edges (graph topology) without touching other policy fields. */
    @PutMapping("/{id}/graph")
    @PreAuthorize("hasRole('DESIGNER')")
    public ResponseEntity<Policy> updateGraph(@PathVariable String id,
                                               @RequestBody java.util.Map<String, Object> body) {
        Policy saved = policyService.updateGraph(id, body);
        eventPublisher.emitPolicyUpdated(id);
        return ResponseEntity.ok(saved);
    }
}
