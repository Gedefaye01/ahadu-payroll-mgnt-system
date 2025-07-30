package com.ahadu.payroll.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileStorageService {
    String storeProfilePicture(MultipartFile file, String userId) throws IOException;
    // You can add more methods here if you need to load files, delete them, etc.
    // Path loadFileAsResource(String fileName);
}