package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.Attendance;
import com.ahadu.payroll.model.LeaveRequest;
import com.ahadu.payroll.payload.AttendanceOverviewResponse;
import com.ahadu.payroll.security.UserDetailsImpl;
import com.ahadu.payroll.service.AttendanceService;
import com.ahadu.payroll.service.LeaveRequestService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AttendanceLeaveController {

    private final AttendanceService attendanceService;
    private final LeaveRequestService leaveRequestService;

    @Autowired
    public AttendanceLeaveController(AttendanceService attendanceService, LeaveRequestService leaveRequestService) {
        this.attendanceService = attendanceService;
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Attendance> saveAttendance(@RequestBody Attendance attendance) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        attendance.setEmployeeId(userDetails.getId());

        Attendance savedAttendance = attendanceService.saveAttendance(attendance);
        return new ResponseEntity<>(savedAttendance, HttpStatus.CREATED);
    }

    // CORRECTED METHOD
    @PutMapping("/attendance/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')") // Allow both USER and ADMIN roles
    public ResponseEntity<Attendance> updateAttendance(@PathVariable String id,
            @RequestBody Attendance updatedAttendance) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Step 1: Find the existing attendance record
        Optional<Attendance> existingAttendanceOptional = attendanceService.getAttendanceById(id);
        if (existingAttendanceOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Attendance existingAttendance = existingAttendanceOptional.get();
        String authenticatedUserId = userDetails.getId();
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN"));

        // Step 2: Implement authorization check
        // An employee (USER) can only update their own record.
        // An admin can update any record.
        if (!isAdmin && !existingAttendance.getEmployeeId().equals(authenticatedUserId)) {
            // If the user is NOT an admin AND they are NOT the owner of this record,
            // return a 403 Forbidden status.
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        // Step 3: Proceed with the update if authorized
        // We only want to update the remarks and clock-out time for a regular user.
        // The service layer can handle the full update for an admin.

        Optional<Attendance> updated;
        if (isAdmin) {
            // Admins can update the full attendance record
            updated = attendanceService.updateAttendance(id, updatedAttendance);
        } else {
            // For a regular user, we only want to allow updating remarks and clock-out
            // time.
            // Fetch the existing record again to prevent a malicious user from changing
            // other fields.
            existingAttendance.setClockOutTime(updatedAttendance.getClockOutTime());
            existingAttendance.setRemarks(updatedAttendance.getRemarks());
            updated = attendanceService.updateAttendance(id, existingAttendance);
        }

        return updated.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    @GetMapping("/attendance/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        // Service method will now populate employeeUsername
        List<Attendance> attendanceRecords = attendanceService.getAllAttendanceWithUsernames();
        return ResponseEntity.ok(attendanceRecords);
    }

    @GetMapping("/attendance/my")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<List<Attendance>> getMyAttendance() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        // Service method will now populate employeeUsername
        List<Attendance> myAttendance = attendanceService.getAttendanceByEmployeeIdWithUsernames(userDetails.getId());
        return ResponseEntity.ok(myAttendance);
    }

    @GetMapping("/attendance/employee/{employeeId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Attendance>> getAttendanceByEmployeeId(@PathVariable String employeeId) {
        // Service method will now populate employeeUsername
        List<Attendance> attendance = attendanceService.getAttendanceByEmployeeIdWithUsernames(employeeId);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/attendance/employee/{employeeId}/range")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Attendance>> getAttendanceByEmployeeIdAndDateRange(
            @PathVariable String employeeId,
            @RequestParam("startDate") String startDateString,
            @RequestParam("endDate") String endDateString) {
        LocalDate startDate = LocalDate.parse(startDateString);
        LocalDate endDate = LocalDate.parse(endDateString);
        // Service method will now populate employeeUsername
        List<Attendance> attendance = attendanceService.getAttendanceByEmployeeIdAndDateRangeWithUsernames(employeeId,
                startDate,
                endDate);
        return ResponseEntity.ok(attendance);
    }

    /**
     * NEW ENDPOINT: Retrieves aggregated attendance overview statistics for admins.
     * Accessible only by ADMINs.
     * * @return ResponseEntity with AttendanceOverviewResponse DTO.
     */
    @GetMapping("/attendance/admin/overview")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AttendanceOverviewResponse> getAttendanceOverview() {
        AttendanceOverviewResponse overview = attendanceService.getAttendanceOverview();
        return ResponseEntity.ok(overview);
    }

    // --- Leave Request Endpoints ---

    @PostMapping("/leave-requests")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<LeaveRequest> submitLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        leaveRequest.setEmployeeId(userDetails.getId());
        // Frontend already sets this, but backend can re-verify/set
        leaveRequest.setEmployeeUsername(userDetails.getUsername());
        LeaveRequest submittedRequest = leaveRequestService.submitLeaveRequest(leaveRequest);
        return new ResponseEntity<>(submittedRequest, HttpStatus.CREATED);
    }

    @GetMapping("/leave-requests/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        // Assuming leaveRequestService.getAllLeaveRequests() will also be updated to
        // populate employeeUsername
        List<LeaveRequest> leaveRequests = leaveRequestService.getAllLeaveRequestsWithUsernames();
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/leave-requests/my")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<List<LeaveRequest>> getMyLeaveRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        // Assuming leaveRequestService.getLeaveRequestsByEmployeeId() will also be
        // updated to populate employeeUsername
        List<LeaveRequest> myLeaveRequests = leaveRequestService
                .getLeaveRequestsByEmployeeIdWithUsernames(userDetails.getId());
        return ResponseEntity.ok(myLeaveRequests);
    }

    @PutMapping("/leave-requests/{requestId}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(@PathVariable String requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return leaveRequestService.approveLeaveRequest(requestId, userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/leave-requests/{requestId}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<LeaveRequest> rejectLeaveRequest(@PathVariable String requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return leaveRequestService.rejectLeaveRequest(requestId, userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/leave-requests/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<HttpStatus> deleteLeaveRequest(@PathVariable String id) {
        if (leaveRequestService.getLeaveRequestById(id).isPresent()) {
            leaveRequestService.deleteLeaveRequest(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}