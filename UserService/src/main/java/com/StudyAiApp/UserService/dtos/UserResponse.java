package com.StudyAiApp.UserService.dtos;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String keycloakId;
    private String email;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
