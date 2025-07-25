package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Role;
import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.RoleRepository;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
// import java.util.stream.Collectors;

/**
 * Service class for managing user roles and permissions.
 * Provides methods to retrieve users and update their assigned roles.
 */
@Service
public class UserRoleService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // To validate roles against existing ones

    @Autowired
    public UserRoleService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Retrieves all users with their current roles.
     * 
     * @return A list of all User objects.
     */
    public List<User> getAllUsersWithRoles() {
        return userRepository.findAll();
    }

    /**
     * Updates the roles for a specific user.
     * 
     * @param userId       The ID of the user whose roles are to be updated.
     * @param newRoleNames A set of new role names (e.g., "ADMIN", "USER").
     * @return An Optional containing the updated User if found and updated, or
     *         empty if not found.
     * @throws RuntimeException if a specified role name does not exist in the
     *                          database.
     */
    public Optional<User> updateUserRoles(String userId, Set<String> newRoleNames) {
        return userRepository.findById(userId).map(user -> {
            Set<String> updatedRoles = new HashSet<>();

            if (newRoleNames == null || newRoleNames.isEmpty()) {
                // Default to USER role if no roles are provided in the update
                Role userRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new RuntimeException("Error: Default role 'USER' not found."));
                updatedRoles.add(userRole.getName());
            } else {
                // Validate and add provided roles
                for (String roleName : newRoleNames) {
                    // Normalize role name to uppercase for consistency with stored roles
                    String normalizedRoleName = roleName.toUpperCase();
                    Role role = roleRepository.findByName(normalizedRoleName)
                            .orElseThrow(
                                    () -> new RuntimeException("Error: Role '" + normalizedRoleName + "' not found."));
                    updatedRoles.add(role.getName());
                }
            }

            user.setRoles(updatedRoles);
            return userRepository.save(user);
        });
    }
}
