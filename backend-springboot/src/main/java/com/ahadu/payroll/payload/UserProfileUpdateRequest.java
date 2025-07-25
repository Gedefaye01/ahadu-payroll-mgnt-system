// UserProfileUpdateRequest.java (Backend DTO)
package com.ahadu.payroll.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor; // Added AllArgsConstructor
import lombok.Data;
import lombok.NoArgsConstructor; // Added NoArgsConstructor

/**
 * DTO for updating user profile details.
 */
@Data
@NoArgsConstructor // Lombok will generate a no-args constructor
@AllArgsConstructor // Lombok will generate a constructor with all fields
public class UserProfileUpdateRequest {
    @NotBlank(message = "Username cannot be empty")
    private String username; // This field name must match the payload from frontend

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email cannot be empty")
    private String email;

    private String phone;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
