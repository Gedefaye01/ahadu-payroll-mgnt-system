package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LoginAttemptService {

    private final UserRepository userRepository;
    private final SystemSettingService systemSettingService; // Inject SystemSettingService

    @Autowired
    public LoginAttemptService(UserRepository userRepository, SystemSettingService systemSettingService) {
        this.userRepository = userRepository;
        this.systemSettingService = systemSettingService;
    }

    /**
     * Records a failed login attempt for a given username/email.
     * If the number of failed attempts exceeds the configured max, the account will be locked.
     * @param username The username or email of the user who failed to log in.
     */
    public void recordFailedLogin(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username); // Try by email if not found by username
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

            int maxLoginAttempts = systemSettingService.getMaxLoginAttempts().orElse(5); // Get from settings
            long lockoutDurationMinutes = systemSettingService.getLockoutDurationMinutes().orElse(30L); // Get from settings

            if (user.getFailedLoginAttempts() >= maxLoginAttempts) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
                // Optionally, you might want to send an email notification to the user or admin here
                System.out.println("Account for user " + username + " locked until " + user.getAccountLockedUntil());
            }
            userRepository.save(user);
        }
    }

    /**
     * Resets failed login attempts for a user upon successful login or account unlock.
     * @param username The username or email of the user.
     */
    public void resetFailedLoginAttempts(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getFailedLoginAttempts() > 0 || user.getAccountLockedUntil() != null) {
                user.setFailedLoginAttempts(0);
                user.setAccountLockedUntil(null); // Ensure it's unlocked
                userRepository.save(user);
                System.out.println("Failed login attempts reset for user: " + username);
            }
        }
    }
}
