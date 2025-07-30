package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.UserRepository;
import com.ahadu.payroll.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String emailOrUsername) throws UsernameNotFoundException {
                User user = userRepository.findByEmail(emailOrUsername)
                                .orElseGet(() -> userRepository.findByUsername(emailOrUsername)
                                                .orElseThrow(() -> new UsernameNotFoundException(
                                                                "User not found with email or username: "
                                                                                + emailOrUsername)));

                return UserDetailsImpl.build(user);
        }
}
