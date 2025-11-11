package com.StudyAiApp.UserService.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Table(name = "users")
@Entity
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String keycloakId;


    @Column(nullable = false , unique = true)
    private String email;


    @Column(nullable = true)
    private String userName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


}
