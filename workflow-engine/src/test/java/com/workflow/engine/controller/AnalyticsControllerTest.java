package com.workflow.engine.controller;

import com.workflow.engine.model.Role;
import com.workflow.engine.model.User;
import com.workflow.engine.repository.UserRepository;
import com.workflow.engine.security.JwtUtil;
import com.workflow.engine.service.AnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integración del AnalyticsController.
 * Verifica que los endpoints requieren autenticación y devuelven la forma correcta.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private static final String UID   = "admin-001";
    private static final String EMAIL = "admin@sw1.com";

    // ── GET /api/analytics/dashboard ────────────────────────────────────────

    @Test
    void dashboard_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(get("/api/analytics/dashboard"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void dashboard_con_token_devuelve_campos_esperados() throws Exception {
        configurarUserMock(Role.DESIGNER);

        Map<String, Object> stats = Map.of(
                "totalCases", 5,
                "activeCases", 3,
                "completedCases", 2,
                "cancelledCases", 0,
                "totalTasks", 10,
                "pendingTasks", 4
        );
        when(analyticsService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/analytics/dashboard")
                        .header("Authorization", "Bearer " + token(Role.DESIGNER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCases").value(5))
                .andExpect(jsonPath("$.activeCases").value(3))
                .andExpect(jsonPath("$.completedCases").value(2))
                .andExpect(jsonPath("$.pendingTasks").value(4));
    }

    @Test
    void dashboard_retorna_objeto_vacio_cuando_no_hay_datos() throws Exception {
        configurarUserMock(Role.OFFICER);
        when(analyticsService.getDashboardStats()).thenReturn(Map.of(
                "totalCases", 0, "activeCases", 0, "completedCases", 0,
                "cancelledCases", 0, "totalTasks", 0, "pendingTasks", 0
        ));

        mockMvc.perform(get("/api/analytics/dashboard")
                        .header("Authorization", "Bearer " + token(Role.OFFICER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCases").value(0));
    }

    // ── GET /api/analytics/policy/{policyId} ─────────────────────────────────

    @Test
    void policyAnalytics_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(get("/api/analytics/policy/any-id"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void policyAnalytics_con_token_devuelve_estructura_correcta() throws Exception {
        configurarUserMock(Role.DESIGNER);
        String policyId = "pol-001";

        Map<String, Object> resp = Map.of(
                "totalCases", 3,
                "completedCases", 1,
                "avgCaseDurationMinutes", 120.0,
                "bottlenecks", java.util.List.of(),
                "aiInsights", java.util.List.of("Sistema funcionando correctamente")
        );
        when(analyticsService.getPolicyAnalytics(policyId)).thenReturn(resp);

        mockMvc.perform(get("/api/analytics/policy/" + policyId)
                        .header("Authorization", "Bearer " + token(Role.DESIGNER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCases").value(3))
                .andExpect(jsonPath("$.completedCases").value(1))
                .andExpect(jsonPath("$.avgCaseDurationMinutes").value(120.0))
                .andExpect(jsonPath("$.aiInsights", hasSize(1)));
    }

    @Test
    void policyAnalytics_id_distinto_llama_servicio_con_ese_id() throws Exception {
        configurarUserMock(Role.OFFICER);
        String policyId = "policy-xyz-999";

        when(analyticsService.getPolicyAnalytics(policyId)).thenReturn(Map.of(
                "totalCases", 0, "completedCases", 0,
                "avgCaseDurationMinutes", 0.0,
                "bottlenecks", java.util.List.of(),
                "aiInsights", java.util.List.of()
        ));

        mockMvc.perform(get("/api/analytics/policy/" + policyId)
                        .header("Authorization", "Bearer " + token(Role.OFFICER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCases").value(0));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void configurarUserMock(Role role) {
        User user = new User();
        user.setId(UID);
        user.setEmail(EMAIL);
        user.setName("Admin Test");
        user.setRole(role);
        when(userRepository.findById(UID)).thenReturn(Optional.of(user));
    }

    private String token(Role role) {
        return jwtUtil.generateToken(UID, EMAIL, role.name());
    }
}
