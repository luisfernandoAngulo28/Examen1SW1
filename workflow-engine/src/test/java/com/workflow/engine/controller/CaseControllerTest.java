package com.workflow.engine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.engine.dto.CaseDetailDto;
import com.workflow.engine.model.Case;
import com.workflow.engine.model.Role;
import com.workflow.engine.model.User;
import com.workflow.engine.repository.UserRepository;
import com.workflow.engine.security.JwtUtil;
import com.workflow.engine.service.CaseService;
import com.workflow.engine.service.CaseViewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integración del CaseController.
 * Cubre: GET /cases, POST /cases, GET /cases/{id}, GET /cases/my-tasks, PATCH cancellation.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CaseService caseService;

    @MockBean
    private CaseViewService caseViewService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private static final String UID       = "usr-011";
    private static final String EMAIL     = "oficial@sw1.com";
    private static final String POLICY_ID = "pol-xxx";
    private static final String CASE_ID   = "case-001";

    private CaseDetailDto mockDetail;
    private Case mockCase;

    @BeforeEach
    void setUp() {
        // Mock user so filter can resolve it
        User user = new User();
        user.setId(UID);
        user.setEmail(EMAIL);
        user.setName("Oficial Test");
        user.setRole(Role.OFFICER);
        when(userRepository.findById(UID)).thenReturn(Optional.of(user));

        mockCase = new Case();
        mockCase.setId(CASE_ID);

        mockDetail = new CaseDetailDto(
                CASE_ID, "OPEN", "node-1", Instant.now(), null,
                new CaseDetailDto.PolicyRef(POLICY_ID, "Política Demo"),
                List.of(), List.of()
        );
    }

    // ── GET /api/cases ───────────────────────────────────────────────────────

    @Test
    void getCases_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(get("/api/cases"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getCases_con_token_devuelve_lista_vacia() throws Exception {
        when(caseService.findAll()).thenReturn(List.of());
        when(caseViewService.toDetailList(List.of())).thenReturn(List.of());

        mockMvc.perform(get("/api/cases")
                        .header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getCases_con_policyId_filtra_correctamente() throws Exception {
        when(caseService.findByPolicyId(POLICY_ID)).thenReturn(List.of(mockCase));
        when(caseViewService.toDetailList(List.of(mockCase))).thenReturn(List.of(mockDetail));

        mockMvc.perform(get("/api/cases")
                        .param("policyId", POLICY_ID)
                        .header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(CASE_ID));
    }

    // ── POST /api/cases ───────────────────────────────────────────────────────

    @Test
    void createCase_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(post("/api/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("policyId", POLICY_ID))))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void createCase_con_token_y_policyId_inicia_caso() throws Exception {
        when(caseService.startCase(POLICY_ID)).thenReturn(mockCase);
        when(caseViewService.toDetail(mockCase)).thenReturn(mockDetail);

        mockMvc.perform(post("/api/cases")
                        .header("Authorization", "Bearer " + token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("policyId", POLICY_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(CASE_ID))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.policy.id").value(POLICY_ID));
    }

    // ── GET /api/cases/{id} ───────────────────────────────────────────────────

    @Test
    void getCaseById_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(get("/api/cases/" + CASE_ID))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getCaseById_con_token_devuelve_detalle() throws Exception {
        when(caseService.findById(CASE_ID)).thenReturn(mockCase);
        when(caseViewService.toDetail(mockCase)).thenReturn(mockDetail);

        mockMvc.perform(get("/api/cases/" + CASE_ID)
                        .header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(CASE_ID))
                .andExpect(jsonPath("$.policy.name").value("Política Demo"));
    }

    // ── GET /api/cases/my-tasks ───────────────────────────────────────────────

    @Test
    void myTasks_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(get("/api/cases/my-tasks"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void myTasks_con_token_devuelve_lista_vacia_cuando_no_hay_tareas() throws Exception {
        when(caseService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/cases/my-tasks")
                        .header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ── PATCH /api/cases/{id}/cancel ─────────────────────────────────────────

    @Test
    void cancelCase_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(patch("/api/cases/" + CASE_ID + "/cancel"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void cancelCase_con_token_cancela_exitosamente() throws Exception {
        Case cancelledCase = new Case();
        cancelledCase.setId(CASE_ID);
        CaseDetailDto cancelledDetail = new CaseDetailDto(
                CASE_ID, "CANCELLED", null, Instant.now(), Instant.now(),
                new CaseDetailDto.PolicyRef(POLICY_ID, "Política Demo"),
                List.of(), List.of()
        );

        when(caseService.cancelCase(CASE_ID)).thenReturn(cancelledCase);
        when(caseViewService.toDetail(cancelledCase)).thenReturn(cancelledDetail);

        mockMvc.perform(patch("/api/cases/" + CASE_ID + "/cancel")
                        .header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String token() {
        return jwtUtil.generateToken(UID, EMAIL, Role.OFFICER.name());
    }
}
