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
 */
@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    @Autowired
    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository, UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
    }

    public LeaveRequest submitLeaveRequest(LeaveRequest leaveRequest) {
        if (leaveRequest.getEmployeeId() != null) {
            userRepository.findById(leaveRequest.getEmployeeId()).ifPresent(user -> {
                if (leaveRequest.getEmployeeUsername() == null || leaveRequest.getEmployeeUsername().isEmpty()) {
                    leaveRequest.setEmployeeUsername(user.getUsername());
                }
            });
        }
        leaveRequest.setRequestDate(LocalDateTime.now());
        leaveRequest.setStatus("Pending");
        return leaveRequestRepository.save(leaveRequest);
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAllByOrderByRequestDateDesc();
    }

    public List<LeaveRequest> getLeaveRequestsByEmployeeId(String employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByRequestDateDesc(employeeId);
    }

    public Optional<LeaveRequest> getLeaveRequestById(String id) {
        return leaveRequestRepository.findById(id);
    }

    public Optional<LeaveRequest> approveLeaveRequest(String requestId, String approvedByUserId) {
        return leaveRequestRepository.findById(requestId).map(request -> {
            if ("Pending".equalsIgnoreCase(request.getStatus())) {
                request.setStatus("Approved");
                request.setApprovedBy(approvedByUserId);
                return leaveRequestRepository.save(request);
            }
            return request;
        });
    }

    public Optional<LeaveRequest> rejectLeaveRequest(String requestId, String rejectedByUserId) {
        return leaveRequestRepository.findById(requestId).map(request -> {
            if ("Pending".equalsIgnoreCase(request.getStatus())) {
                request.setStatus("Rejected");
                request.setApprovedBy(rejectedByUserId);
                return leaveRequestRepository.save(request);
            }
            return request;
        });
    }

    public void deleteLeaveRequest(String id) {
        leaveRequestRepository.deleteById(id);
    }
}
