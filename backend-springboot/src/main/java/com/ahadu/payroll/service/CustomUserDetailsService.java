package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.UserRepository;
import com.ahadu.payroll.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.LockedException; // Import LockedException
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime; // Import LocalDateTime

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemSettingService systemSettingService; // Inject SystemSettingService

    @Override
    public UserDetails loadUserByUsername(String emailOrUsername) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(emailOrUsername)
                .orElseGet(() -> userRepository.findByUsername(emailOrUsername)
                        .orElseThrow(() -> new UsernameNotFoundException(
                                "User not found with email or username: " + emailOrUsername)));

        // Retrieve max login attempts and lockout duration from system settings
        int maxLoginAttempts = systemSettingService.getMaxLoginAttempts().orElse(5);
        long lockoutDurationMinutes = systemSettingService.getLockoutDurationMinutes().orElse(30L);

        // Check if the account is locked
        if (user.getAccountLockedUntil() != null && LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
            // If the account is still locked, throw a LockedException
            throw new LockedException("Account is locked until " + user.getAccountLockedUntil() + " due to too many failed login attempts.");
        }

        // If the account was locked but the lockout period has passed, reset failed attempts
        // This ensures a user can try again after the lockout period without admin intervention
        if (user.getAccountLockedUntil() != null && LocalDateTime.now().isAfter(user.getAccountLockedUntil())) {
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            userRepository.save(user); // Save the updated user state
        }

        // If the user exists and is not currently locked, build UserDetailsImpl
        return UserDetailsImpl.build(user);
    }
}
