package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.LeaveRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for LeaveRequest entities, using MongoDB.
 * Provides standard CRUD operations for the 'leave_requests' collection.
 */
@Repository
public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByEmployeeIdOrderByRequestDateDesc(String employeeId);

    List<LeaveRequest> findByStatus(String status); // e.g., "Pending", "Approved", "Rejected"

    List<LeaveRequest> findAllByOrderByRequestDateDesc(); // Get all requests, newest first
}
