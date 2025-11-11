package com.StudyAiApp.UserService.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;
    @Size(min = 8 , max = 20, message = "usernames must be 8 characters minimum and 20 characters max")
    private String userName;
}
