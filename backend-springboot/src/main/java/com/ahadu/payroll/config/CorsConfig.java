package com.ahadu.payroll.config; // <<--- Adjusted package name based on your structure

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

/**
 * Global CORS configuration for the Ahadu Payroll System backend.
 * This class allows the frontend application hosted on Vercel and local
 * development
 * servers to make cross-origin requests to the API.
 */
@Configuration // Marks this class as a Spring configuration class
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "https://ahadubank-payroll-system.vercel.app/",
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "http://localhost:4200",
                        "http://127.0.0.1:3000",
                        "http://127.0.0.1:5173",
                        "http://127.0.0.1:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}