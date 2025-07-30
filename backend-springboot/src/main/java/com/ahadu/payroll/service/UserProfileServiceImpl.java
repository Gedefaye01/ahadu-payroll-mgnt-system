package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Role; // Assuming you have a Role model
import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.SignupRequest;
import com.ahadu.payroll.payload.UserProfileUpdateRequest;
import com.ahadu.payroll.repository.RoleRepository; // Assuming you have a RoleRepository
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors; // For stream operations

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository; // Inject RoleRepository

    @Autowired
    public UserProfileServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
            RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository; // Initialize RoleRepository
    }

    @Override
    public Optional<User> updateMyProfile(String id, UserProfileUpdateRequest updateRequest) {
        Optional<User> existingUserOpt = userRepository.findById(id);

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();

            // Update fields only if they are provided in the request
            // Note: The frontend sends 'fullName' as 'username' in the payload.
            // Ensure consistency or map correctly.
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

            // IMPORTANT: Do NOT update profilePictureUrl here if it's handled by a separate
            // /upload-picture endpoint
            // The frontend will send profilePictureUrl separately.

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

            // Verify old password matches
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                // Encode and update new password
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
        // 1. Check if username or email already exists
        if (userRepository.findByUsername(signupRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use!");
        }

        // 2. Create new User instance
        User user = new User(
                signupRequest.getUsername(),
                signupRequest.getEmail(),
                passwordEncoder.encode(signupRequest.getPassword()) // Hash the password
        );

        // 3. Assign roles
        Set<String> strRoles = signupRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            // Default role if none specified
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Error: Role 'USER' not found. Please initialize roles."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName("ADMIN")
                                .orElseThrow(() -> new RuntimeException(
                                        "Error: Role 'ADMIN' not found. Please initialize roles."));
                        roles.add(adminRole);
                        break;
                    case "user":
                        Role userRole = roleRepository.findByName("USER")
                                .orElseThrow(() -> new RuntimeException(
                                        "Error: Role 'USER' not found. Please initialize roles."));
                        roles.add(userRole);
                        break;
                    default:
                        // Handle unknown roles, perhaps throw an error or default to USER
                        throw new RuntimeException("Error: Role '" + role + "' is not supported.");
                }
            });
        }
        // Assuming your User model's setRoles method accepts Set<String>
        user.setRoles(roles.stream().map(Role::getName).collect(Collectors.toSet()));

        // 4. Save the user
        userRepository.save(user);
    }

    // --- NEW METHOD IMPLEMENTATION FOR PROFILE PICTURE URL ---
    @Override
    public void updateProfilePictureUrl(String userId, String imageUrl) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setProfilePictureUrl(imageUrl);
            userRepository.save(user);
        });
    }
}