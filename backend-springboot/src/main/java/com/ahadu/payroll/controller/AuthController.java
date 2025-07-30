package com.ahadu.payroll.controller;

import com.ahadu.payroll.payload.LoginRequest;
import com.ahadu.payroll.payload.JwtResponse;
import com.ahadu.payroll.payload.MessageResponse; // Assuming you have this DTO
import com.ahadu.payroll.payload.SignupRequest; // Import your SignupRequest DTO
import com.ahadu.payroll.security.JwtUtil;
import com.ahadu.payroll.security.UserDetailsImpl;
import com.ahadu.payroll.service.UserProfileService; // Assuming you have a service for user operations

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Autowired
        private AuthenticationManager authenticationManager;

        @Autowired
        private JwtUtil jwtUtil;

        @Autowired
        private UserProfileService userProfileService; // Make sure this service is correctly implemented and wired

        // --- MODIFIED LOGIN ENDPOINT PATH ---
        @PostMapping("/signin") // <--- CHANGED FROM "/login" TO "/signin"
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                String jwt = jwtUtil.generateToken(userDetails.getUsername());

                return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(),
                                userDetails.getEmail(), userDetails.getAuthorities()));
        }
        // --- END MODIFIED LOGIN ENDPOINT PATH ---

        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
                try {
                        userProfileService.registerNewUser(signupRequest);
                        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
                } catch (Exception e) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
                }
        }
}
