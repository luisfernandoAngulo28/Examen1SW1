package com.workflow.engine.service;

import com.workflow.engine.dto.*;
import com.workflow.engine.model.User;
import com.workflow.engine.repository.UserRepository;
import com.workflow.engine.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setName(req.getName());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        user.setDepartmentId(req.getDepartmentId());

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getDepartmentId());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getDepartmentId());
    }

    public UserDto getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getDepartmentId());
    }

    public java.util.List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getDepartmentId()))
                .toList();
    }

    public void deleteAllUsers() {
        userRepository.deleteAll();
    }

    /** Store (or refresh) the FCM device token for a user. Called by the mobile app after login. */
    public void updateFcmToken(String userId, String fcmToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        user.setFcmToken(fcmToken);
        userRepository.save(user);
    }
}
