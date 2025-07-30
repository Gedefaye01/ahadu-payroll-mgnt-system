package com.ahadu.payroll.controller;

import com.ahadu.payroll.model.Attendance;
import com.ahadu.payroll.model.LeaveRequest;
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

    @PutMapping("/attendance/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable String id,
            @RequestBody Attendance updatedAttendance) {
        Optional<Attendance> updated = attendanceService.updateAttendance(id, updatedAttendance);
        return updated.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/attendance/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        List<Attendance> attendanceRecords = attendanceService.getAllAttendance();
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
        List<Attendance> myAttendance = attendanceService.getAttendanceByEmployeeId(userDetails.getId());
        return ResponseEntity.ok(myAttendance);
    }

    @GetMapping("/attendance/employee/{employeeId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Attendance>> getAttendanceByEmployeeId(@PathVariable String employeeId) {
        List<Attendance> attendance = attendanceService.getAttendanceByEmployeeId(employeeId);
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
        List<Attendance> attendance = attendanceService.getAttendanceByEmployeeIdAndDateRange(employeeId, startDate,
                endDate);
        return ResponseEntity.ok(attendance);
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
        leaveRequest.setEmployeeUsername(userDetails.getUsername());
        LeaveRequest submittedRequest = leaveRequestService.submitLeaveRequest(leaveRequest);
        return new ResponseEntity<>(submittedRequest, HttpStatus.CREATED);
    }

    @GetMapping("/leave-requests/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        List<LeaveRequest> leaveRequests = leaveRequestService.getAllLeaveRequests();
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
        List<LeaveRequest> myLeaveRequests = leaveRequestService.getLeaveRequestsByEmployeeId(userDetails.getId());
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