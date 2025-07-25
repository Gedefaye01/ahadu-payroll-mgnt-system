package com.ahadu.payroll.config; // <<--- Adjusted package name based on your structure

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the Ahadu Payroll System backend.
 * This class allows the frontend application hosted on Vercel and local
 * development
 * servers to make cross-origin requests to the API.
 */
@Configuration // Marks this class as a Spring configuration class
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Apply CORS settings to all API endpoints under /api/**
        // For example, /api/auth/signin, /api/users, etc.
        registry.addMapping("/api/**")
                // Define the allowed origins (frontend URLs)
                // These are the domains from which your frontend applications will make
                // requests.
                .allowedOrigins(
                        "https://ahadu-payroll-system.vercel.app", // Your deployed frontend on Vercel
                        "http://localhost:3000", // Common port for React dev server
                        "http://localhost:5173", // Common port for Vue/Vite dev server
                        "http://localhost:4200", // Common port for Angular dev server
                        "http://127.0.0.1:3000", // Alternative for localhost (React)
                        "http://127.0.0.1:5173", // Alternative for localhost (Vue/Vite)
                        "http://127.0.0.1:4200" // Alternative for localhost (Angular)
                // Add any other specific localhost ports you might be using for development
                // If your frontend runs on a different port, add it here.
                )
                // Define the allowed HTTP methods
                // Ensure POST, GET, OPTIONS, etc., are included if your API uses them.
                // OPTIONS is crucial for preflight requests.
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Define the allowed headers
                // "*" allows all headers. If you need stricter control,
                // list specific headers like "Content-Type", "Authorization".
                .allowedHeaders("*")
                // Allow sending of credentials (cookies, HTTP authentication, Authorization
                // headers)
                // This MUST be 'true' if your frontend sends tokens or cookies.
                // When 'true', allowedOrigins cannot be a wildcard (*).
                .allowCredentials(true)
                // Set the maximum age for the preflight request's result cache.
                // This reduces the number of preflight requests for the same
                // origin/method/headers.
                .maxAge(3600); // 1 hour (in seconds)
    }
}