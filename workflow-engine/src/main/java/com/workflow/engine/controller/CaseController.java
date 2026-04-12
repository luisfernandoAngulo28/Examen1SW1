package com.workflow.engine.controller;

import com.workflow.engine.model.Case;
import com.workflow.engine.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @GetMapping
    public ResponseEntity<List<Case>> findAll() {
        return ResponseEntity.ok(caseService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Case> findById(@PathVariable String id) {
        return ResponseEntity.ok(caseService.findById(id));
    }

    @PostMapping("/start")
    public ResponseEntity<Case> startCase(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(caseService.startCase(body.get("policyId")));
    }

    @PostMapping("/{id}/advance")
    public ResponseEntity<Case> advanceCase(@PathVariable String id,
                                             @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(caseService.advanceCase(id, body.get("taskId")));
    }
}
