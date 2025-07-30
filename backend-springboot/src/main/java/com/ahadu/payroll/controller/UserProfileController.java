package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.ChangePasswordRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;
import com.ahadu.payroll.payload.ApiResponse; // ADDED: Assuming you have this DTO
import com.ahadu.payroll.security.UserDetailsImpl;
import com.ahadu.payroll.service.UserProfileService;
import com.ahadu.payroll.service.FileStorageService; // ADDED: Import FileStorageService

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // ADDED for convenience
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // ADDED for file upload

import jakarta.validation.Valid;

/**
 * REST Controller for managing an authenticated user's own profile.
 * Provides endpoints for retrieving and updating personal profile information,
 * changing passwords, and now uploading profile pictures.
 * Accessible by both USERs and ADMINs (to manage their own profile).
 */
@RestController
@RequestMapping("/api/my-profile")
// IMPORTANT: Adjust origins to your *actual* frontend URL in production
// For development, "*" is fine, but specify exact URL for production security.
@CrossOrigin(origins = "https://ahadu-payroll-mgnt-system-frontend.onrender.com", maxAge = 3600)
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final FileStorageService fileStorageService; // ADDED

    @Autowired
    public UserProfileController(UserProfileService userProfileService, FileStorageService fileStorageService) { // MODIFIED:
                                                                                                                 // Add
                                                                                                                 // FileStorageService
        this.userProfileService = userProfileService;
        this.fileStorageService = fileStorageService; // ADDED
    }

    /**
     * Retrieves the profile of the authenticated user.
     *
     * @return ResponseEntity with the User object or not found status.
     */
    @GetMapping
    public ResponseEntity<User> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return userProfileService.getUserProfile(userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Updates the profile of the authenticated user.
     *
     * @param updateRequest The DTO containing the updated profile details.
     * @return ResponseEntity with the updated User object or an error status.
     */
    @PutMapping
    public ResponseEntity<User> updateMyProfile(@Valid @RequestBody UserProfileUpdateRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return userProfileService.updateMyProfile(userDetails.getId(), updateRequest)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Endpoint for an authenticated user to change their password.
     *
     * @param request DTO containing old password, new password, and confirmation.
     * @return ResponseEntity indicating success or failure.
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

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
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * NEW ENDPOINT: Uploads a profile picture for the authenticated user.
     *
     * @param userDetails    The authenticated user's details.
     * @param profilePicture The multipart file containing the image.
     * @return ResponseEntity with success/error message and the URL of the uploaded
     *         picture.
     */
    @PostMapping("/upload-picture")
    public ResponseEntity<ApiResponse> uploadProfilePicture(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestPart("profilePicture") MultipartFile profilePicture) { // "profilePicture" must match frontend's
                                                                           // FormData key
        try {
            if (profilePicture.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Please select a file to upload."));
            }

            // Store the file and get its URL
            String fileUrl = fileStorageService.storeProfilePicture(profilePicture, userDetails.getId());

            // Update the user's profile picture URL in the database
            userProfileService.updateProfilePictureUrl(userDetails.getId(), fileUrl);

            // Return success response with the URL
            return ResponseEntity.ok(new ApiResponse(true, "Profile picture uploaded successfully!", fileUrl));

        } catch (Exception e) {
            // Log the exception for debugging on the server side
            System.err.println("Error uploading profile picture: " + e.getMessage()); // Consider using a proper logger
                                                                                      // (e.g., SLF4J)
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to upload profile picture: " + e.getMessage()));
        }
    }
}