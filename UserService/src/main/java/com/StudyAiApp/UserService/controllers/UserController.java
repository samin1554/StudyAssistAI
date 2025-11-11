package com.StudyAiApp.UserService.controllers;
import com.StudyAiApp.UserService.config.KeycloakUtil;
import com.StudyAiApp.UserService.dtos.UserRequest;
import com.StudyAiApp.UserService.dtos.UserResponse;
import com.StudyAiApp.UserService.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Fetch current user's profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        String keycloakId = KeycloakUtil.getKeycloakId();
        UserResponse response = userService.getUserProfileByKeycloakId(keycloakId);
        return ResponseEntity.ok(response);
    }

    // Register user
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserRequest userRequest) {
        String keycloakId = KeycloakUtil.getKeycloakId();
        UserResponse response = userService.registerUser(userRequest, keycloakId);
        return ResponseEntity.ok(response);
    }

    // check if user exists by DB ID
    @GetMapping("/validate/{id}")
    public ResponseEntity<Boolean> validateUser(@PathVariable Long id) {
        boolean exists = userService.existsById(id);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/validate/keycloak/{keycloakId}")
    public ResponseEntity<Boolean> validateUserByKeycloakId(@PathVariable String keycloakId) {
        try {
            UserResponse user = userService.getUserProfileByKeycloakId(keycloakId);
            return ResponseEntity.ok(true);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(false);
        }
    }

}