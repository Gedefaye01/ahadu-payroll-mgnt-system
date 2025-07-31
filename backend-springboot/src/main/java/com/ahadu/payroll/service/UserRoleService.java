package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.RoleRepository;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserRoleService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // To validate and retrieve Role objects

    @Autowired
    public UserRoleService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Retrieves all users from the database with their assigned roles.
     * 
     * @return A list of all User objects.
     */
    public List<User> getAllUsersWithRoles() {
        // Assuming User model already has 'roles' field populated from DB
        return userRepository.findAll();
    }

    /**
     * Updates the roles for a specific user.
     * This method will replace the existing roles with the new set of roles
     * provided.
     * It validates that the new roles exist in the Role collection.
     * 
     * @param userId       The ID of the user to update.
     * @param newRoleNames A Set of strings representing the names of the new roles
     *                     (e.g., "USER", "ADMIN").
     * @return An Optional containing the updated User object, or empty if the user
     *         is not found.
     * @throws RuntimeException if any of the provided role names do not exist in
     *                          the database.
     */
    public Optional<User> updateUserRoles(String userId, Set<String> newRoleNames) {
        return userRepository.findById(userId).map(user -> {
            Set<String> rolesToAssign = new HashSet<>();

            // Validate and add roles
            for (String roleName : newRoleNames) {
                if (roleRepository.findByName(roleName).isPresent()) {
                    rolesToAssign.add(roleName);
                } else {
                    // Throw an exception if an invalid role name is provided, as per controller's
                    // catch block
                    throw new RuntimeException("Role '" + roleName + "' not found in database.");
                }
            }

            user.setRoles(rolesToAssign);
            return userRepository.save(user);
        });
    }

    // You might also add other user-related service methods here,
    // e.g., createUser, getUserById, deleteUser, changePassword, etc.
}
