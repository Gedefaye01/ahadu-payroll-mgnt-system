package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.SignupRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;

import java.util.Optional;

public interface UserProfileService {
    Optional<User> getUserProfile(String userId);

    Optional<User> updateMyProfile(String userId, UserProfileUpdateRequest updateRequest);

    boolean changePassword(String userId, String oldPassword, String newPassword);

    void registerNewUser(SignupRequest signupRequest);
}
