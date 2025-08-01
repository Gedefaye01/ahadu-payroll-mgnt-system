package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.ChangePasswordRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;
import com.ahadu.payroll.payload.ApiResponse;
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

@RestController
// IMPORTANT: Updated to handle multiple endpoints.
// Now, this controller can handle requests for both /api/my-profile and /api/users
@RequestMapping({"/api/my-profile", "/api/users"})
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
    
    // Original endpoint for a single user's profile
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @GetMapping("/api/my-profile")
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return userProfileService.getUserProfile(userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Original endpoint for updating a single user's profile
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @PutMapping("/api/my-profile")
    public ResponseEntity<User> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UserProfileUpdateRequest updateRequest) {
        return userProfileService.updateMyProfile(userDetails.getId(), updateRequest)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Original endpoint for changing password
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @PutMapping("/api/my-profile/change-password")
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

    // Original endpoint for uploading profile picture
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @PostMapping("/api/my-profile/upload-picture")
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
    
    // NEW ENDPOINT: This will handle the request from your AdminPayrollManagement.js file
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/api/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userProfileService.findAllUsers();
        return ResponseEntity.ok(users);
    }
}