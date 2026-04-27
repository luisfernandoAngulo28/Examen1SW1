package com.workflow.engine.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyTaskDto {

    private String id;
    private String status;
    private Instant startedAt;
    private NodeInfo node;

    @JsonProperty("case")
    private CaseInfo caseInfo;

    private UserInfo assignedUser;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeInfo {
        private String title;
        private DeptInfo department;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeptInfo {
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaseInfo {
        private String id;
        private PolicyInfo policy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyInfo {
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String name;
    }
}
