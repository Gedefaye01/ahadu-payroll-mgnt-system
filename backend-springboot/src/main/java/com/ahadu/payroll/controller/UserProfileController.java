package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.ChangePasswordRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;
import com.ahadu.payroll.security.UserDetailsImpl;
import com.ahadu.payroll.service.UserProfileService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Keep this import
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST Controller for managing an authenticated user's own profile.
 * Provides endpoints for retrieving and updating personal profile information,
 * and now also for changing passwords.
 * Accessible by both USERs and ADMINs (to manage their own profile).
 */
@RestController
@RequestMapping("/api/my-profile")
@CrossOrigin(origins = "*", maxAge = 3600)
// --- FIX IS HERE: Removed "ROLE_" prefix from hasAnyAuthority ---
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Autowired
    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
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
}