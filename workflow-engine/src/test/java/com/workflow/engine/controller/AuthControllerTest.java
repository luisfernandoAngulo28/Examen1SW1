package com.workflow.engine.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workflow.engine.dto.AuthResponse;
import com.workflow.engine.dto.LoginRequest;
import com.workflow.engine.dto.RegisterRequest;
import com.workflow.engine.dto.UserDto;
import com.workflow.engine.model.Role;
import com.workflow.engine.model.User;
import com.workflow.engine.repository.UserRepository;
import com.workflow.engine.security.JwtUtil;
import com.workflow.engine.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integración del AuthController.
 * Usa Spring Security completa con MockMvc.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    // Necesario para que JwtAuthFilter no falle al arrancar
    @MockBean
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private static final String EMAIL = "test@sw1.com";
    private static final String NAME  = "Test User";
    private static final String UID   = "user-001";

    private AuthResponse mockAuthResponse;

    @BeforeEach
    void setUp() {
        mockAuthResponse = new AuthResponse(
                jwtUtil.generateToken(UID, EMAIL, Role.OFFICER.name()),
                UID, EMAIL, NAME, Role.OFFICER, null
        );
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────

    @Test
    void register_retorna_token_con_datos_correctos() throws Exception {
        when(authService.register(any(RegisterRequest.class))).thenReturn(mockAuthResponse);

        RegisterRequest req = new RegisterRequest();
        req.setEmail(EMAIL);
        req.setName(NAME);
        req.setPassword("Seguro1234!");
        req.setRole(Role.OFFICER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.name").value(NAME))
                .andExpect(jsonPath("$.role").value("OFFICER"));
    }

    @Test
    void register_rechaza_email_invalido() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("no-es-un-email");
        req.setName(NAME);
        req.setPassword("Seguro1234!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_rechaza_password_en_blanco() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail(EMAIL);
        req.setName(NAME);
        req.setPassword("");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────

    @Test
    void login_retorna_token_valido() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenReturn(mockAuthResponse);

        LoginRequest req = new LoginRequest();
        req.setEmail(EMAIL);
        req.setPassword("Seguro1234!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.id").value(UID));
    }

    @Test
    void login_sin_body_es_bad_request() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────

    @Test
    void getMe_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getMe_con_token_devuelve_datos_usuario() throws Exception {
        // Preparar usuario mock para que JwtAuthFilter lo encuentre
        User user = new User();
        user.setId(UID);
        user.setEmail(EMAIL);
        user.setName(NAME);
        user.setRole(Role.OFFICER);
        when(userRepository.findById(UID)).thenReturn(Optional.of(user));

        UserDto dto = new UserDto(UID, NAME, EMAIL, Role.OFFICER, null);
        when(authService.getMe(UID)).thenReturn(dto);

        String token = jwtUtil.generateToken(UID, EMAIL, Role.OFFICER.name());

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.id").value(UID));
    }

    // ── GET /api/auth/users ───────────────────────────────────────────────────

    @Test
    void getAllUsers_sin_token_devuelve_no_autorizado() throws Exception {
        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getAllUsers_con_token_devuelve_lista() throws Exception {
        User user = crearUserMock();
        when(userRepository.findById(UID)).thenReturn(Optional.of(user));

        List<UserDto> lista = List.of(
                new UserDto(UID, NAME, EMAIL, Role.OFFICER, null),
                new UserDto("u2", "Otro", "otro@sw1.com", Role.DESIGNER, null)
        );
        when(authService.getAllUsers()).thenReturn(lista);

        String token = jwtUtil.generateToken(UID, EMAIL, Role.OFFICER.name());

        mockMvc.perform(get("/api/auth/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].email").value(EMAIL));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User crearUserMock() {
        User user = new User();
        user.setId(UID);
        user.setEmail(EMAIL);
        user.setName(NAME);
        user.setRole(Role.OFFICER);
        return user;
    }
}
