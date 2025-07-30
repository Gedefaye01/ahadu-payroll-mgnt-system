package com.ahadu.payroll.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID; // For unique filenames

@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageServiceImpl(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeProfilePicture(MultipartFile file, String userId) throws IOException {

        // ADDED: Handle potential null or empty filename from getOriginalFilename()
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new IllegalArgumentException("Original filename cannot be null or empty for profile picture upload.");
        }

        // Clean the path after ensuring it's not null
        String cleanedFileName = StringUtils.cleanPath(originalFileName);

        String fileExtension = "";
        int dotIndex = cleanedFileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < cleanedFileName.length() - 1) {
            fileExtension = cleanedFileName.substring(dotIndex);
        }

        // Generate unique file name to avoid clashes and provide a cleaner URL
        // Using userId to prefix can help with organization if needed
        String uniqueFileName = userId + "_" + UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);

        // Copy file to the target location
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return the path that the frontend can use to access the image
        // This assumes your Spring Boot app is serving files from /uploads/**
        return "/uploads/" + uniqueFileName;
    }
}