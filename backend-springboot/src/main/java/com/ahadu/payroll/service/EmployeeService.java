package com.ahadu.payroll.service;

import com.ahadu.payroll.model.User;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final UserRepository userRepository;

    @Autowired
    public EmployeeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllEmployees() {
        return userRepository.findAll();
    }

    public Optional<User> getEmployeeById(String id) {
        return userRepository.findById(id);
    }

    public User createEmployee(User user) {
        return userRepository.save(user);
    }

    public Optional<User> updateEmployee(String id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setPhone(updatedUser.getPhone());
            user.setAddress(updatedUser.getAddress());
            // update other fields as needed
            return userRepository.save(user);
        });
    }

    public void deleteEmployee(String id) {
        userRepository.deleteById(id);
    }
}
