package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserProfileServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Optional<User> getUserProfile(String userId) {
        return userRepository.findById(userId);
    }

    @Override
    public Optional<User> updateMyProfile(String userId, UserProfileUpdateRequest updateRequest) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }
        User user = userOpt.get();

        // Update only allowed fields
        if (updateRequest.getUsername() != null && !updateRequest.getUsername().isBlank()) {
            user.setUsername(updateRequest.getUsername());
        }
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().isBlank()) {
            user.setEmail(updateRequest.getEmail());
        }
        if (updateRequest.getPhone() != null) {
            user.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getAddress() != null) {
            user.setAddress(updateRequest.getAddress());
        }
        if (updateRequest.getEmergencyContactName() != null) {
            user.setEmergencyContactName(updateRequest.getEmergencyContactName());
        }
        if (updateRequest.getEmergencyContactPhone() != null) {
            user.setEmergencyContactPhone(updateRequest.getEmergencyContactPhone());
        }

        userRepository.save(user);
        return Optional.of(user);
    }

    @Override
    public boolean changePassword(String userId, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();

        // Verify old password matches
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }

        // Optionally, add checks to prevent setting a new password too similar to old
        // one

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }
}
