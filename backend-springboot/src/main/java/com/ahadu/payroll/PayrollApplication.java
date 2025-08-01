package com.ahadu.payroll;

import com.ahadu.payroll.model.Role;
import com.ahadu.payroll.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling; // Import the annotation

@SpringBootApplication
@EnableScheduling // Add this annotation to enable scheduled tasks
public class PayrollApplication {

    public static void main(String[] args) {
        SpringApplication.run(PayrollApplication.class, args);
    }

    /**
     * CommandLineRunner to initialize default roles in the database if they don't
     * exist.
     * This ensures that 'USER' and 'ADMIN' roles are available for user
     * registration.
     */
    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            // Check if 'USER' role exists, if not, create it
            if (roleRepository.findByName("USER").isEmpty()) {
                roleRepository.save(new Role("USER"));
                System.out.println("Initialized 'USER' role.");
            }

            // Check if 'ADMIN' role exists, if not, create it
            if (roleRepository.findByName("ADMIN").isEmpty()) {
                roleRepository.save(new Role("ADMIN"));
                System.out.println("Initialized 'ADMIN' role.");
            }
        };
    }
}