package com.ahadu.payroll.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir; // Inject the upload directory from application.properties

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose the upload directory as a static resource handler
        // Files stored in ./uploads/ will be accessible via /uploads/**
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + Paths.get(uploadDir).toAbsolutePath().normalize().toString() + "/");
        // For production on Render, consider using an external storage service
        // and pointing this to an external URL, or ensure Render's persistent disk
        // is correctly configured and mounted for /uploads/.
        // Render's ephemeral disk means files uploaded there will be lost on restart.
    }
}