package com.StudyAiApp.UserService.config;

import com.StudyAiApp.UserService.model.Users;
import com.StudyAiApp.UserService.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationSuccessListener {

    private final UserRepository userRepository;

    @EventListener
    public void handleAuthenticationSuccess(AuthenticationSuccessEvent event) {
        if (event.getAuthentication().getPrincipal() instanceof Jwt jwt) {
            String keycloakId = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            String username = jwt.getClaimAsString("preferred_username");

            // Check if user exists in our database
            Optional<Users> existingUser = userRepository.findByKeycloakId(keycloakId);
            
            if (existingUser.isEmpty()) {
                // User doesn't exist in our database, so create them
                Users newUser = new Users();
                newUser.setKeycloakId(keycloakId);
                newUser.setEmail(email != null ? email : "");
                newUser.setUserName(username != null ? username : "");
                newUser.setCreatedAt(LocalDateTime.now());
                newUser.setUpdatedAt(LocalDateTime.now());
                
                Users savedUser = userRepository.save(newUser);
                log.info("New user automatically registered with Keycloak ID: {}", savedUser.getKeycloakId());
            }
        }
    }
}