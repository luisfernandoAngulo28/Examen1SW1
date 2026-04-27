package com.workflow.engine.controller;

import com.workflow.engine.dto.*;
import com.workflow.engine.model.User;
import com.workflow.engine.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(authService.getMe(user.getId()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    /** Delete ALL users (dev/demo reset) */
    @DeleteMapping("/users")
    public ResponseEntity<Void> deleteAllUsers() {
        authService.deleteAllUsers();
        return ResponseEntity.noContent().build();
    }

    /**
     * Register or refresh the FCM device token for push notifications.
     * Flutter calls this right after a successful login.
     * Body: { "fcmToken": "<device-token>" }
     */
    @PutMapping("/fcm-token")
    public ResponseEntity<Void> updateFcmToken(@RequestBody java.util.Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        String token = body.get("fcmToken");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        authService.updateFcmToken(user.getId(), token);
        return ResponseEntity.noContent().build();
    }
}
