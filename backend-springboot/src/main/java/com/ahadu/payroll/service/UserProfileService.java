package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.SignupRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;

import java.util.List;
import java.util.Optional;

public interface UserProfileService {

    Optional<User> updateMyProfile(String id, UserProfileUpdateRequest updateRequest);

    boolean changePassword(String userId, String oldPassword, String newPassword);

    Optional<User> getUserProfile(String userId);

    void registerNewUser(SignupRequest signupRequest);

    void updateProfilePictureUrl(String userId, String imageUrl);

    List<User> findAllUsers();

    // NEW METHOD: Added to support admin-initiated password reset
    String resetUserPassword(String userId);
}
