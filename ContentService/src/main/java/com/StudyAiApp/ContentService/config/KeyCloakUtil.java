package com.StudyAiApp.ContentService.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class KeyCloakUtil {

    // Extracts Keycloak user ID
    public static String getKeycloakId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            return jwt.getClaimAsString("sub");
        }

        throw new IllegalStateException("No Keycloak authentication found or invalid token type");
    }

    public String getUserIdFromJwt(Jwt jwt) {
        return jwt.getClaimAsString("sub"); // Unique Keycloak user ID
    }

    public String getEmailFromJwt(Jwt jwt) {
        return jwt.getClaimAsString("email");
    }

    public String getUsernameFromJwt(Jwt jwt) {
        return jwt.getClaimAsString("preferred_username");
    }
}