package com.workflow.engine.controller;

import com.workflow.engine.dto.CaseDetailDto;
import com.workflow.engine.dto.MyTaskDto;
import com.workflow.engine.model.Case;
import com.workflow.engine.model.Role;
import com.workflow.engine.model.TaskStatus;
import com.workflow.engine.model.User;
import com.workflow.engine.service.CaseService;
import com.workflow.engine.service.CaseViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final CaseViewService caseViewService;

    @GetMapping
    public ResponseEntity<List<CaseDetailDto>> findAll(@RequestParam(required = false) String policyId) {
        List<Case> cases = (policyId != null && !policyId.isBlank())
                ? caseService.findByPolicyId(policyId)
                : caseService.findAll();
        return ResponseEntity.ok(caseViewService.toDetailList(cases));
    }

    /** My tasks: returns all PENDING/IN_PROGRESS tasks assigned to the authenticated user. */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<MyTaskDto>> getMyTasks() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        String userId = currentUser.getId();

        List<MyTaskDto> result = caseService.findAll().stream()
                .flatMap(c -> c.getTasks().stream()
                        .filter(t -> userId.equals(t.getAssignedUserId())
                                && (t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS))
                        .map(t -> caseViewService.toMyTask(c, t)))
                .toList();
        return ResponseEntity.ok(result);
    }

    /** My cases: returns all cases initiated by the authenticated CLIENT user */
    @GetMapping("/my-cases")
    public ResponseEntity<List<CaseDetailDto>> getMyCases() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        List<Case> cases = caseService.findByClientId(currentUser.getId());
        return ResponseEntity.ok(caseViewService.toDetailList(cases));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDetailDto> findById(@PathVariable String id) {
        return ResponseEntity.ok(caseViewService.toDetail(caseService.findById(id)));
    }

    /** Called by frontend as POST /cases with body {policyId}
     *  If the caller has role CLIENT, the case is associated to them as client. */
    @PostMapping
    public ResponseEntity<CaseDetailDto> createCase(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        Case started;
        if (currentUser.getRole() == Role.CLIENT) {
            started = caseService.startCaseForClient(body.get("policyId"), currentUser.getId());
        } else {
            started = caseService.startCase(body.get("policyId"));
        }
        return ResponseEntity.ok(caseViewService.toDetail(started));
    }

    /** Legacy: POST /cases/start */
    @PostMapping("/start")
    public ResponseEntity<CaseDetailDto> startCase(@RequestBody Map<String, String> body) {
        Case started = caseService.startCase(body.get("policyId"));
        return ResponseEntity.ok(caseViewService.toDetail(started));
    }

    /** Legacy: POST /cases/{id}/advance */
    @PostMapping("/{id}/advance")
    public ResponseEntity<CaseDetailDto> advanceCase(@PathVariable String id,
                                                      @RequestBody Map<String, String> body) {
        Case advanced = caseService.advanceCase(id, body.get("taskId"));
        return ResponseEntity.ok(caseViewService.toDetail(advanced));
    }

    /** Complete a task, with optional DECISION branch selection */
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<CaseDetailDto> completeTask(@PathVariable String taskId,
                                                       @RequestBody Map<String, String> body) {
        String chosenEdgeLabel = body.getOrDefault("chosenEdgeLabel", null);
        Case updated = caseService.completeTask(taskId, chosenEdgeLabel);
        return ResponseEntity.ok(caseViewService.toDetail(updated));
    }

    /** Assign a task to a user */
    @PatchMapping("/tasks/{taskId}/assign")
    public ResponseEntity<CaseDetailDto> assignTask(@PathVariable String taskId,
                                                     @RequestBody Map<String, String> body) {
        Case updated = caseService.assignTask(taskId, body.get("userId"));
        return ResponseEntity.ok(caseViewService.toDetail(updated));
    }

    /** Cancel a case */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<CaseDetailDto> cancelCase(@PathVariable String id) {
        Case updated = caseService.cancelCase(id);
        return ResponseEntity.ok(caseViewService.toDetail(updated));
    }

    /** Delete a case (dev/demo use only) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable String id) {
        caseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Delete ALL cases (dev/demo reset) */
    @DeleteMapping
    public ResponseEntity<Void> deleteAllCases() {
        caseService.deleteAll();
        return ResponseEntity.noContent().build();
    }
}
