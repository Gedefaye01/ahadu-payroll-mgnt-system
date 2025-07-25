package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.Role;
import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.AuthResponse;
import com.ahadu.payroll.payload.LoginRequest;
import com.ahadu.payroll.payload.SignupRequest;
import com.ahadu.payroll.repository.RoleRepository;
import com.ahadu.payroll.repository.UserRepository;
import com.ahadu.payroll.security.JwtUtil;
import com.ahadu.payroll.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AuthController {

        @Autowired
        UserRepository userRepository;

        @Autowired
        RoleRepository roleRepository;

        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        PasswordEncoder passwordEncoder;

        @Autowired
        JwtUtil jwtUtil;

        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
                if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                        return ResponseEntity.badRequest().body("Error: Username is already taken!");
                }

                if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                        return ResponseEntity.badRequest().body("Error: Email is already in use!");
                }

                User user = new User(signUpRequest.getUsername(),
                                signUpRequest.getEmail(),
                                passwordEncoder.encode(signUpRequest.getPassword()));

                Set<String> strRoles = signUpRequest.getRoles();
                Set<String> roles = new HashSet<>();

                if (strRoles == null || strRoles.isEmpty()) {
                        Role userRole = roleRepository.findByName("USER")
                                        .orElseThrow(() -> new RuntimeException("Error: Role 'USER' not found."));
                        roles.add(userRole.getName());
                } else {
                        strRoles.forEach(role -> {
                                switch (role.toUpperCase()) {
                                        case "ADMIN":
                                                Role adminRole = roleRepository.findByName("ADMIN")
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "Error: Role 'ADMIN' not found."));
                                                roles.add(adminRole.getName());
                                                break;
                                        case "USER":
                                        default:
                                                Role userRole = roleRepository.findByName("USER")
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "Error: Role 'USER' not found."));
                                                roles.add(userRole.getName());
                                }
                        });
                }

                user.setRoles(roles);
                userRepository.save(user);

                return ResponseEntity.ok("User registered successfully!");
        }

        @PostMapping("/signin")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtil.generateToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                return ResponseEntity.ok(new AuthResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getEmail(),
                                roles));
        }
}
