package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.ChangePasswordRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;
import com.ahadu.payroll.payload.ApiResponse; // Assuming ApiResponse is a DTO for general responses
import com.ahadu.payroll.payload.MessageResponse; // Assuming MessageResponse is a DTO for simple messages
import com.ahadu.payroll.security.UserDetailsImpl;
import com.ahadu.payroll.service.UserProfileService;
import com.ahadu.payroll.service.FileStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api") // Base path for the controller
@CrossOrigin(origins = "https://ahadu-payroll-mgnt-system-frontend.onrender.com", maxAge = 3600)
public class UserProfileController {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileController.class);

    private final UserProfileService userProfileService;
    private final FileStorageService fileStorageService;

    @Autowired
    public UserProfileController(UserProfileService userProfileService, FileStorageService fileStorageService) {
        this.userProfileService = userProfileService;
        this.fileStorageService = fileStorageService;
    }

    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @GetMapping("/my-profile")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return userProfileService.getUserProfile(userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @PutMapping("/my-profile")
    public ResponseEntity<User> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UserProfileUpdateRequest updateRequest) {
        return userProfileService.updateMyProfile(userDetails.getId(), updateRequest)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @PutMapping("/my-profile/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            return new ResponseEntity<>("New password and confirmation do not match.", HttpStatus.BAD_REQUEST);
        }

        try {
            boolean passwordChanged = userProfileService.changePassword(
                    userDetails.getId(),
                    request.getOldPassword(),
                    request.getNewPassword());

            if (passwordChanged) {
                return new ResponseEntity<>("Password changed successfully!", HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                        "Failed to change password. Old password might be incorrect or new password is too similar.",
                        HttpStatus.BAD_REQUEST);
            }
        } catch (RuntimeException e) {
            logger.error("Error changing password for user {}: {}", userDetails.getId(), e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @PostMapping("/my-profile/upload-picture")
    public ResponseEntity<ApiResponse> uploadProfilePicture(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestPart("profilePicture") MultipartFile profilePicture) {
        try {
            if (profilePicture.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Please select a file to upload."));
            }

            String fileUrl = fileStorageService.storeProfilePicture(profilePicture, userDetails.getId());
            userProfileService.updateProfilePictureUrl(userDetails.getId(), fileUrl);

            return ResponseEntity.ok(new ApiResponse(true, "Profile picture uploaded successfully!", fileUrl));

        } catch (Exception e) {
            logger.error("Error uploading profile picture for user {}: {}", userDetails.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to upload profile picture: " + e.getMessage()));
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userProfileService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Admin-initiated password reset for a specific employee.
     * Generates a new random password and updates it for the given user ID.
     * Requires ADMIN role.
     * @param id The ID of the employee whose password is to be reset.
     * @return ResponseEntity indicating success or failure.
     */
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/employees/{id}/reset-password") // New endpoint for password reset
    public ResponseEntity<?> resetEmployeePassword(@PathVariable String id) {
        try {
            // Call the service method to handle the password reset logic
            String newPassword = userProfileService.resetUserPassword(id);
            // For security, you generally wouldn't return the plain password in a real app.
            // Instead, you might send it via email or a secure notification.
            // For this example, we'll confirm success.
            return ResponseEntity.ok(new MessageResponse("Employee password for ID " + id + " reset successfully."));
        } catch (RuntimeException e) {
            logger.error("Error resetting password for user {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST) // Use BAD_REQUEST if user not found, or INTERNAL_SERVER_ERROR for other issues
                                 .body(new MessageResponse("Failed to reset password: " + e.getMessage()));
        }
    }
}
