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

import java.security.SecureRandom; // For secure password generation
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final SystemSettingService systemSettingService; // Inject SystemSettingService

    @Autowired
    public UserProfileServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                  RoleRepository roleRepository, SystemSettingService systemSettingService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.systemSettingService = systemSettingService; // Initialize SystemSettingService
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
     * Generates a new random password, hashes it, and updates the user in the database.
     * The generated password now adheres to the password policy settings.
     * @param userId The ID of the user whose password is to be reset.
     * @return The new plain-text password (for immediate display to admin, but should be handled securely).
     * @throws RuntimeException if user not found or password generation fails.
     */
    @Override
    public String resetUserPassword(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        // Retrieve password policy settings from SystemSettingService
        int minPasswordLength = systemSettingService.getMinPasswordLength().orElse(6);
        boolean requireUppercase = systemSettingService.getRequireUppercase().orElse(true);
        boolean requireLowercase = systemSettingService.getRequireLowercase().orElse(true);
        boolean requireDigit = systemSettingService.getRequireDigit().orElse(true);
        boolean requireSpecialChar = systemSettingService.getRequireSpecialChar().orElse(false);

        String newPlainTextPassword = generateCompliantPassword(
            minPasswordLength,
            requireUppercase,
            requireLowercase,
            requireDigit,
            requireSpecialChar
        );

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPlainTextPassword)); // Hash and set the new password
        userRepository.save(user); // Save the updated user

        System.out.println("Generated new password for user " + userId + ": " + newPlainTextPassword); // Log for admin
        return newPlainTextPassword;
    }

    /**
     * Generates a random password that complies with the specified policy.
     * @param length Minimum length of the password.
     * @param upperCase If uppercase characters are required.
     * @param lowerCase If lowercase characters are required.
     * @param digit If digits are required.
     * @param specialChar If special characters are required.
     * @return A randomly generated password string.
     */
    private String generateCompliantPassword(int length, boolean upperCase, boolean lowerCase, boolean digit, boolean specialChar) {
        StringBuilder password = new StringBuilder();
        SecureRandom random = new SecureRandom();

        String lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
        String upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String digitChars = "0123456789";
        String specialChars = "!@#$%^&*()-_=+[]{}|;:',.<>?";

        String allChars = "";
        if (lowerCase) allChars += lowerCaseChars;
        if (upperCase) allChars += upperCaseChars;
        if (digit) allChars += digitChars;
        if (specialChar) allChars += specialChars;

        // Ensure at least one of each required type is included
        if (lowerCase) password.append(lowerCaseChars.charAt(random.nextInt(lowerCaseChars.length())));
        if (upperCase) password.append(upperCaseChars.charAt(random.nextInt(upperCaseChars.length())));
        if (digit) password.append(digitChars.charAt(random.nextInt(digitChars.length())));
        if (specialChar) password.append(specialChars.charAt(random.nextInt(specialChars.length())));

        // Fill the rest of the password length
        int remainingLength = length - password.length();
        if (remainingLength < 0) remainingLength = 0; // Handle case where required chars already exceed min length

        for (int i = 0; i < remainingLength; i++) {
            if (allChars.isEmpty()) {
                // Fallback if no character types are selected (should not happen with typical policies)
                password.append((char) (random.nextInt(94) + 33)); // ASCII printable characters
            } else {
                password.append(allChars.charAt(random.nextInt(allChars.length())));
            }
        }

        // Shuffle the characters to ensure randomness in position
        List<Character> charList = password.chars()
                                            .mapToObj(c -> (char) c)
                                            .collect(Collectors.toList());
        Collections.shuffle(charList, random);

        return charList.stream()
                       .map(String::valueOf)
                       .collect(Collectors.joining());
    }
}
