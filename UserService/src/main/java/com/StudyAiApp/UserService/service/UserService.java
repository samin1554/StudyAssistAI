package com.StudyAiApp.UserService.service;

import com.StudyAiApp.UserService.dtos.UserRequest;
import com.StudyAiApp.UserService.dtos.UserResponse;
import com.StudyAiApp.UserService.model.Users;
import com.StudyAiApp.UserService.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    // Register or onboard a user
    public UserResponse registerUser(@Valid UserRequest userRequest, String keycloakId) {

        Optional<Users> existingUser = userRepository.findByKeycloakId(keycloakId);
        if (existingUser.isPresent()) {
            return mapToResponse(existingUser.get());
        }


        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        Users user = new Users();
        user.setKeycloakId(keycloakId);
        user.setEmail(userRequest.getEmail());
        user.setUserName(userRequest.getUserName());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        Users savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    // Get user by keycloak id
    public UserResponse getUserProfileByKeycloakId(String keycloakId) {
        Users user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    // Get user by id or create if not exists
    @Transactional
    public UserResponse getUserProfile(String keycloakId, String email, String username) {
        Optional<Users> optionalUsers = userRepository.findByKeycloakId(keycloakId);
                Users user;
                if(optionalUsers.isPresent()){
                    user = optionalUsers.get();
                } else {
                    user = new Users();
                    user.setKeycloakId(keycloakId);
                    user.setEmail(email);
                    user.setUserName(username);
                    user.setCreatedAt(LocalDateTime.now());
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                }
                return mapToResponse(user);
    }

    // Check if user  in id
    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    // Helper to map
    private UserResponse mapToResponse(Users user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setKeycloakId(user.getKeycloakId());
        response.setEmail(user.getEmail());
        response.setUserName(user.getUserName());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}