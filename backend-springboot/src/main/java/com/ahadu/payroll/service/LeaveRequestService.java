package com.ahadu.payroll.service;

import com.ahadu.payroll.model.LeaveRequest;
import com.ahadu.payroll.repository.LeaveRequestRepository;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing employee leave requests.
 * Provides methods for submitting, retrieving, and approving/rejecting leave
 * requests.
 */
@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository; // To fetch employee username

    @Autowired
    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository, UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
    }

    /**
     * Submits a new leave request.
     * 
     * @param leaveRequest The LeaveRequest object to be saved.
     * @return The saved LeaveRequest object.
     */
    public LeaveRequest submitLeaveRequest(LeaveRequest leaveRequest) {
        // Ensure employeeUsername is populated from the User model if not already set
        // This helps prevent NullPointerExceptions if username isn't passed from
        // frontend
        if (leaveRequest.getEmployeeId() != null) {
            userRepository.findById(leaveRequest.getEmployeeId()).ifPresent(user -> {
                if (leaveRequest.getEmployeeUsername() == null || leaveRequest.getEmployeeUsername().isEmpty()) {
                    leaveRequest.setEmployeeUsername(user.getUsername());
                }
            });
        }
        leaveRequest.setRequestDate(LocalDateTime.now()); // Set current request date
        leaveRequest.setStatus("Pending"); // Ensure status is Pending on submission
        return leaveRequestRepository.save(leaveRequest);
    }

    /**
     * Retrieves all leave requests, ordered by request date descending.
     * 
     * @return A list of all LeaveRequest objects.
     */
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAllByOrderByRequestDateDesc();
    }

    /**
     * Retrieves leave requests for a specific employee.
     * 
     * @param employeeId The ID of the employee.
     * @return A list of LeaveRequest objects for the specified employee.
     */
    public List<LeaveRequest> getLeaveRequestsByEmployeeId(String employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByRequestDateDesc(employeeId);
    }

    /**
     * Retrieves a single leave request by its ID.
     * 
     * @param id The ID of the leave request.
     * @return An Optional containing the LeaveRequest if found, or empty if not.
     */
    public Optional<LeaveRequest> getLeaveRequestById(String id) {
        return leaveRequestRepository.findById(id);
    }

    /**
     * Approves a pending leave request.
     * 
     * @param requestId        The ID of the leave request to approve.
     * @param approvedByUserId The ID of the admin user who approves the request.
     * @return An Optional containing the updated LeaveRequest if found and
     *         approved, or empty if not found/not pending.
     */
    public Optional<LeaveRequest> approveLeaveRequest(String requestId, String approvedByUserId) {
        return leaveRequestRepository.findById(requestId).map(request -> {
            if ("Pending".equalsIgnoreCase(request.getStatus())) {
                request.setStatus("Approved");
                request.setApprovedBy(approvedByUserId);
                return leaveRequestRepository.save(request);
            }
            return request; // Return original if not pending
        });
    }

    /**
     * Rejects a pending leave request.
     * 
     * @param requestId        The ID of the leave request to reject.
     * @param rejectedByUserId The ID of the admin user who rejects the request.
     * @return An Optional containing the updated LeaveRequest if found and
     *         rejected, or empty if not found/not pending.
     */
    public Optional<LeaveRequest> rejectLeaveRequest(String requestId, String rejectedByUserId) {
        return leaveRequestRepository.findById(requestId).map(request -> {
            if ("Pending".equalsIgnoreCase(request.getStatus())) {
                request.setStatus("Rejected");
                request.setApprovedBy(rejectedByUserId); // Use approvedBy for who processed it
                return leaveRequestRepository.save(request);
            }
            return request; // Return original if not pending
        });
    }

    /**
     * Deletes a leave request by its ID.
     * 
     * @param id The ID of the leave request to delete.
     */
    public void deleteLeaveRequest(String id) {
        leaveRequestRepository.deleteById(id);
    }
}
