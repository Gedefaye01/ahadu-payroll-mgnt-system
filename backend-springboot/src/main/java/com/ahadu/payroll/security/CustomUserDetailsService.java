package com.ahadu.payroll.security;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.UserRepository;
import com.ahadu.payroll.service.UserDetailsImpl; // Import UserDetailsImpl
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Custom implementation of Spring Security's UserDetailsService.
 * This service is responsible for loading user-specific data during the
 * authentication process.
 * It fetches user details from the UserRepository and constructs a
 * UserDetailsImpl object.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepository userRepository;

        @Autowired // Constructor injection is preferred
        public CustomUserDetailsService(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        /**
         * Loads user details by username. This method is called by Spring Security's
         * authentication providers. It attempts to find a user by the provided string
         * first as a username, and if not found, then as an email.
         *
         * @param loginIdentifier The username or email of the user to retrieve.
         * @return A UserDetails object containing the user's information and
         *         authorities.
         * @throws UsernameNotFoundException if the user with the given identifier is
         *                                   not found.
         */
        @Override
        public UserDetails loadUserByUsername(String loginIdentifier) throws UsernameNotFoundException {
                // First, try to find the user by username
                Optional<User> userOptional = userRepository.findByUsername(loginIdentifier);

                // If not found by username, try to find by email
                if (userOptional.isEmpty()) {
                        userOptional = userRepository.findByEmail(loginIdentifier);
                }

                // If still not found, throw UsernameNotFoundException
                User user = userOptional.orElseThrow(() -> new UsernameNotFoundException(
                                "User not found with username or email: " + loginIdentifier));

                // Build and return your custom UserDetailsImpl from the found User entity
                return UserDetailsImpl.build(user);
        }
}