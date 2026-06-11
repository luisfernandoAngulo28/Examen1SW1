package com.workflow.engine.service;

import com.workflow.engine.dto.CaseDetailDto;
import com.workflow.engine.dto.MyTaskDto;
import com.workflow.engine.model.*;
import com.workflow.engine.model.TaskStatus;
import com.workflow.engine.repository.DepartmentRepository;
import com.workflow.engine.repository.PolicyRepository;
import com.workflow.engine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CaseViewService {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public CaseDetailDto toDetail(Case c) {
        Policy policy = policyRepository.findById(c.getPolicyId()).orElse(null);

        CaseDetailDto dto = new CaseDetailDto();
        dto.setId(c.getId());
        dto.setStatus(c.getStatus().name());
        dto.setCurrentNodeId(c.getCurrentNodeId());
        dto.setClientId(c.getClientId());
        dto.setStartedAt(c.getStartedAt());
        dto.setFinishedAt(c.getFinishedAt());
        dto.setEventLogs(c.getEventLogs());

        if (policy != null) {
            dto.setPolicy(new CaseDetailDto.PolicyRef(policy.getId(), policy.getName()));
        }

        List<CaseDetailDto.TaskDetailDto> taskDtos = c.getTasks().stream().map(t -> {
            CaseDetailDto.TaskDetailDto td = new CaseDetailDto.TaskDetailDto();
            td.setId(t.getId());
            td.setStatus(t.getStatus().name());
            td.setStartedAt(t.getStartedAt());
            td.setFinishedAt(t.getFinishedAt());
            td.setFormSubmission(t.getFormSubmission());

            if (policy != null) {
                PolicyNode node = policy.getNodes().stream()
                        .filter(n -> n.getId().equals(t.getNodeId()))
                        .findFirst().orElse(null);
                if (node != null) {
                    CaseDetailDto.DeptRef deptRef = null;
                    if (node.getDepartmentId() != null) {
                        departmentRepository.findById(node.getDepartmentId()).ifPresent(dept ->
                                td.setNode(buildNodeRef(node, new CaseDetailDto.DeptRef(dept.getId(), dept.getName())))
                        );
                    }
                    if (td.getNode() == null) {
                        td.setNode(buildNodeRef(node, deptRef));
                    }
                }
            }

            if (t.getAssignedUserId() != null) {
                userRepository.findById(t.getAssignedUserId()).ifPresent(u ->
                        td.setAssignedUser(new CaseDetailDto.UserRef(u.getId(), u.getName(), u.getEmail()))
                );
            }

            return td;
        }).toList();

        dto.setTasks(taskDtos);

        // ── Progress percent ──────────────────────────────────────────────────
        long total = c.getTasks().size();
        long done  = c.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        dto.setProgressPercent(total > 0 ? (int) (done * 100 / total) : 0);

        // ── Current department (from the first PENDING or IN_PROGRESS task) ──
        if (policy != null) {
            c.getTasks().stream()
                    .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                    .findFirst()
                    .ifPresent(t -> policy.getNodes().stream()
                            .filter(n -> n.getId().equals(t.getNodeId()))
                            .findFirst()
                            .ifPresent(node -> {
                                if (node.getDepartmentId() != null) {
                                    departmentRepository.findById(node.getDepartmentId())
                                            .ifPresent(dept -> dto.setCurrentDepartment(dept.getName()));
                                }
                                if (dto.getCurrentDepartment() == null) {
                                    dto.setCurrentDepartment(node.getTitle());
                                }
                            }));
        }

        // ── Elapsed hours ─────────────────────────────────────────────────────
        Instant from = c.getStartedAt() != null ? c.getStartedAt() : Instant.now();
        Instant to   = c.getFinishedAt() != null ? c.getFinishedAt() : Instant.now();
        dto.setElapsedHours(ChronoUnit.HOURS.between(from, to));

        return dto;
    }

    public List<CaseDetailDto> toDetailList(List<Case> cases) {
        return cases.stream().map(this::toDetail).toList();
    }

    public MyTaskDto toMyTask(Case c, Task t) {
        Policy policy = policyRepository.findById(c.getPolicyId()).orElse(null);

        MyTaskDto dto = new MyTaskDto();
        dto.setId(t.getId());
        dto.setStatus(t.getStatus().name());
        dto.setStartedAt(t.getStartedAt());
        dto.setCaseInfo(new MyTaskDto.CaseInfo(
                c.getId(),
                new MyTaskDto.PolicyInfo(policy != null ? policy.getName() : "")
        ));

        if (policy != null) {
            policy.getNodes().stream()
                    .filter(n -> n.getId().equals(t.getNodeId()))
                    .findFirst()
                    .ifPresent(node -> {
                        MyTaskDto.DeptInfo deptInfo = null;
                        if (node.getDepartmentId() != null) {
                            deptInfo = departmentRepository.findById(node.getDepartmentId())
                                    .map(d -> new MyTaskDto.DeptInfo(d.getName()))
                                    .orElse(null);
                        }
                        dto.setNode(new MyTaskDto.NodeInfo(node.getTitle(), deptInfo));
                    });
        }

        if (t.getAssignedUserId() != null) {
            userRepository.findById(t.getAssignedUserId()).ifPresent(u ->
                    dto.setAssignedUser(new MyTaskDto.UserInfo(u.getName()))
            );
        }

        return dto;
    }

    private CaseDetailDto.NodeRef buildNodeRef(PolicyNode node, CaseDetailDto.DeptRef deptRef) {
        return new CaseDetailDto.NodeRef(
                node.getId(),
                node.getTitle(),
                node.getNodeType() != null ? node.getNodeType().name() : null,
                deptRef
        );
    }
}
