package com.ahadu.payroll.service;

import com.ahadu.payroll.model.LeaveRequest;
import com.ahadu.payroll.model.User; // Import User
import com.ahadu.payroll.repository.LeaveRequestRepository;
import com.ahadu.payroll.repository.UserRepository; // Import UserRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing leave requests.
 * Handles the business logic for submitting, retrieving, approving, and
 * rejecting leave requests.
 */
@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository; // Inject UserRepository to get employee names

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
        // Ensure status is pending on submission
        leaveRequest.setStatus("Pending");
        return leaveRequestRepository.save(leaveRequest);
    }

    /**
     * Retrieves all leave requests and populates employee usernames.
     * 
     * @return A list of all LeaveRequest objects with employee usernames.
     */
    public List<LeaveRequest> getAllLeaveRequestsWithUsernames() {
        List<LeaveRequest> leaveRequests = leaveRequestRepository.findAllByOrderByRequestDateDesc();
        return populateUsernames(leaveRequests);
    }

    /**
     * Retrieves leave requests for a specific employee and populates employee
     * username.
     * 
     * @param employeeId The ID of the employee.
     * @return A list of LeaveRequest objects for the specified employee with
     *         employee username.
     */
    public List<LeaveRequest> getLeaveRequestsByEmployeeIdWithUsernames(String employeeId) {
        List<LeaveRequest> leaveRequests = leaveRequestRepository.findByEmployeeIdOrderByRequestDateDesc(employeeId);
        return populateUsernames(leaveRequests);
    }

    /**
     * Helper method to populate the employeeUsername field in a list of
     * LeaveRequest objects.
     * 
     * @param leaveRequests The list of LeaveRequest objects to enrich.
     * @return The enriched list of LeaveRequest objects.
     */
    private List<LeaveRequest> populateUsernames(List<LeaveRequest> leaveRequests) {
        // Get all unique employee IDs from the leave requests
        List<String> employeeIds = leaveRequests.stream()
                .map(LeaveRequest::getEmployeeId)
                .distinct()
                .collect(Collectors.toList());

        // Fetch all users whose IDs are in the list
        List<User> users = userRepository.findAllById(employeeIds);

        // Create a map for quick lookup: employeeId -> username
        Map<String, String> employeeIdToUsernameMap = users.stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        // Populate the employeeUsername for each leave request
        leaveRequests.forEach(leaveRequest -> leaveRequest.setEmployeeUsername(
                employeeIdToUsernameMap.getOrDefault(leaveRequest.getEmployeeId(), "Unknown Employee")));
        return leaveRequests;
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
     * Approves a leave request.
     * 
     * @param requestId The ID of the leave request to approve.
     * @param adminId   The ID of the admin approving the request.
     * @return An Optional containing the approved LeaveRequest if found, or empty
     *         if not.
     */
    public Optional<LeaveRequest> approveLeaveRequest(String requestId, String adminId) {
        return leaveRequestRepository.findById(requestId).map(leaveRequest -> {
            leaveRequest.setStatus("Approved");
            leaveRequest.setApprovedBy(adminId); // Record who approved it
            return leaveRequestRepository.save(leaveRequest);
        });
    }

    /**
     * Rejects a leave request.
     * 
     * @param requestId The ID of the leave request to reject.
     * @param adminId   The ID of the admin rejecting the request.
     * @return An Optional containing the rejected LeaveRequest if found, or empty
     *         if not.
     */
    public Optional<LeaveRequest> rejectLeaveRequest(String requestId, String adminId) {
        return leaveRequestRepository.findById(requestId).map(leaveRequest -> {
            leaveRequest.setStatus("Rejected");
            leaveRequest.setApprovedBy(adminId); // Record who rejected it
            return leaveRequestRepository.save(leaveRequest);
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
