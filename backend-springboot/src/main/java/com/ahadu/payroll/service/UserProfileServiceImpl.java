package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Role;
import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.SignupRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;
import com.ahadu.payroll.repository.RoleRepository;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern; // Import Pattern for regex validation
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final SystemSettingService systemSettingService;

    @Autowired
    public UserProfileServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                  RoleRepository roleRepository, SystemSettingService systemSettingService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.systemSettingService = systemSettingService;
    }

    @Override
    public Optional<User> updateMyProfile(String id, UserProfileUpdateRequest updateRequest) {
        Optional<User> existingUserOpt = userRepository.findById(id);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            if (updateRequest.getUsername() != null && !updateRequest.getUsername().trim().isEmpty()) {
                user.setUsername(updateRequest.getUsername().trim());
            }
            if (updateRequest.getEmail() != null && !updateRequest.getEmail().trim().isEmpty()) {
                user.setEmail(updateRequest.getEmail().trim());
            }
            if (updateRequest.getPhone() != null && !updateRequest.getPhone().trim().isEmpty()) {
                user.setPhone(updateRequest.getPhone().trim());
            }
            if (updateRequest.getAddress() != null && !updateRequest.getAddress().trim().isEmpty()) {
                user.setAddress(updateRequest.getAddress().trim());
            }
            if (updateRequest.getEmergencyContactName() != null
                    && !updateRequest.getEmergencyContactName().trim().isEmpty()) {
                user.setEmergencyContactName(updateRequest.getEmergencyContactName().trim());
            }
            if (updateRequest.getEmergencyContactPhone() != null
                    && !updateRequest.getEmergencyContactPhone().trim().isEmpty()) {
                user.setEmergencyContactPhone(updateRequest.getEmergencyContactPhone().trim());
            }

            userRepository.save(user);
            return Optional.of(user);
        }
        return Optional.empty();
    }

    @Override
    public boolean changePassword(String userId, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                // Validate new password against system settings before changing
                validatePasswordPolicy(newPassword);
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    @Override
    public Optional<User> getUserProfile(String userId) {
        return userRepository.findById(userId);
    }

    @Override
    public void registerNewUser(SignupRequest signupRequest) {
        if (userRepository.findByUsername(signupRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use!");
        }

        // Validate password against system settings during registration
        validatePasswordPolicy(signupRequest.getPassword());

        User user = new User(
                signupRequest.getUsername(),
                signupRequest.getEmail(),
                passwordEncoder.encode(signupRequest.getPassword())
        );

        Set<String> strRoles = signupRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Error: Role 'USER' not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName("ADMIN")
                                .orElseThrow(() -> new RuntimeException("Error: Role 'ADMIN' not found."));
                        roles.add(adminRole);
                        break;
                    case "user":
                        Role userRole = roleRepository.findByName("USER")
                                .orElseThrow(() -> new RuntimeException("Error: Role 'USER' not found."));
                        roles.add(userRole);
                        break;
                    default:
                        throw new RuntimeException("Error: Role '" + role + "' is not supported.");
                }
            });
        }
        user.setRoles(roles.stream().map(Role::getName).collect(Collectors.toSet()));

        userRepository.save(user);
    }

    @Override
    public void updateProfilePictureUrl(String userId, String imageUrl) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setProfilePictureUrl(imageUrl);
            userRepository.save(user);
        });
    }
    
    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Admin-initiated password reset for a specific user.
     * Accepts a new password from the admin, validates it against system password policies,
     * hashes it, and updates the user in the database.
     * @param userId The ID of the user whose password is to be reset.
     * @param newPassword The new plain-text password provided by the admin.
     * @throws RuntimeException if user not found or password does not meet policy.
     */
    @Override
    public void resetUserPassword(String userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        // Validate the provided new password against system settings
        validatePasswordPolicy(newPassword);

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword)); // Hash and set the new password
        userRepository.save(user); // Save the updated user
    }

    /**
     * Validates a given password against the system's defined password policy.
     * @param password The password string to validate.
     * @throws RuntimeException if the password does not meet the policy requirements.
     */
    private void validatePasswordPolicy(String password) {
        int minPasswordLength = systemSettingService.getMinPasswordLength().orElse(6);
        boolean requireUppercase = systemSettingService.getRequireUppercase().orElse(true);
        boolean requireLowercase = systemSettingService.getRequireLowercase().orElse(true);
        boolean requireDigit = systemSettingService.getRequireDigit().orElse(true);
        boolean requireSpecialChar = systemSettingService.getRequireSpecialChar().orElse(false);

        if (password.length() < minPasswordLength) {
            throw new RuntimeException("Password must be at least " + minPasswordLength + " characters long.");
        }
        if (requireUppercase && !Pattern.compile(".*[A-Z].*").matcher(password).matches()) {
            throw new RuntimeException("Password must contain at least one uppercase letter.");
        }
        if (requireLowercase && !Pattern.compile(".*[a-z].*").matcher(password).matches()) {
            throw new RuntimeException("Password must contain at least one lowercase letter.");
        }
        if (requireDigit && !Pattern.compile(".*\\d.*").matcher(password).matches()) {
            throw new RuntimeException("Password must contain at least one digit.");
        }
        if (requireSpecialChar && !Pattern.compile(".*[!@#$%^&*()-_=+\\[\\]{}|;:',.<>/?].*").matcher(password).matches()) {
            throw new RuntimeException("Password must contain at least one special character.");
        }
    }
}
