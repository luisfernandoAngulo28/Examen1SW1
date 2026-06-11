package com.workflow.engine.dto;

import com.workflow.engine.model.EventLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaseDetailDto {

    private String id;
    private String status;
    private String currentNodeId;
    private String clientId;
    private Instant startedAt;
    private Instant finishedAt;
    private PolicyRef policy;
    private List<TaskDetailDto> tasks;
    private List<EventLog> eventLogs;

    /** 0–100: percentage of DONE tasks out of total non-initial tasks */
    private int progressPercent;
    /** Name of the department handling the current active task */
    private String currentDepartment;
    /** Hours elapsed since the case was started */
    private long elapsedHours;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyRef {
        private String id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskDetailDto {
        private String id;
        private String status;
        private Instant startedAt;
        private Instant finishedAt;
        private NodeRef node;
        private UserRef assignedUser;
        private Object formSubmission;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeRef {
        private String id;
        private String title;
        private String nodeType;
        private DeptRef department;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeptRef {
        private String id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRef {
        private String id;
        private String name;
        private String email;
    }
}
