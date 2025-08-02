package com.ahadu.payroll.security;

import com.ahadu.payroll.service.LoginAttemptService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.format.DateTimeFormatter; // Import for formatting LocalDateTime

@Component
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    private final LoginAttemptService loginAttemptService;

    public CustomAuthenticationFailureHandler(LoginAttemptService loginAttemptService) {
        this.loginAttemptService = loginAttemptService;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        String username = request.getParameter("username"); // Assuming username is passed as a parameter in login form

        if (username != null) {
            loginAttemptService.recordFailedLogin(username);
        }

        String errorMessage;
        if (exception instanceof LockedException) {
            // If the exception is a LockedException (thrown by CustomUserDetailsService)
            errorMessage = exception.getMessage(); // Use the message from the LockedException
        } else if (exception instanceof BadCredentialsException) {
            // For incorrect username/password, provide a generic message for security
            errorMessage = "Invalid username or password.";
            if (username != null) {
                // Optionally, provide more specific feedback if the account is now locked
                // This requires fetching the user again, which might be slightly redundant
                // but provides better UX without revealing too much info.
                // For simplicity, we'll rely on the LockedException from CustomUserDetailsService
                // to give the specific lockout message.
            }
        } else {
            errorMessage = "Authentication failed. Please try again.";
        }

        // Set response status to 401 Unauthorized
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        // Set content type to JSON
        response.setContentType("application/json");
        // Write the error message to the response body
        response.getWriter().write("{\"message\": \"" + errorMessage + "\"}");
    }
}
