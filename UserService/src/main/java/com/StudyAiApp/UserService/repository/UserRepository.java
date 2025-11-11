package com.StudyAiApp.UserService.repository;

import com.StudyAiApp.UserService.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findById(Long Id);
    Optional<Users> findByEmail(String email);
    Optional<Users> findByKeycloakId(String keycloakId);

    boolean existsByEmail(String email);
    boolean existsByKeycloakId(String keycloakId);
}