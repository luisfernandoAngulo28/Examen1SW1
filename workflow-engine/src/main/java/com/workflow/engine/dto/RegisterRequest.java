package com.workflow.engine.dto;

import com.workflow.engine.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String name;
    @NotBlank
    private String password;
    private Role role = Role.OFFICER;
    private String departmentId;
}
