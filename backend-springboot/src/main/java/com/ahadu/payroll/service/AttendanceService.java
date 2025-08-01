package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Attendance;
import com.ahadu.payroll.model.LeaveRequest;
import com.ahadu.payroll.model.User;
import com.ahadu.payroll.payload.AttendanceOverviewResponse;
import com.ahadu.payroll.repository.AttendanceRepository;
import com.ahadu.payroll.repository.LeaveRequestRepository;
import com.ahadu.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository,
                             LeaveRequestRepository leaveRequestRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    public Attendance saveAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAllAttendanceWithUsernames() {
        List<Attendance> attendances = attendanceRepository.findAll();
        return populateUsernames(attendances);
    }

    public List<Attendance> getAttendanceByEmployeeIdWithUsernames(String employeeId) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeId(employeeId);
        return populateUsernames(attendances);
    }

    public List<Attendance> getAttendanceByEmployeeIdAndDateRangeWithUsernames(String employeeId, LocalDate startDate,
                                                                                 LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        return populateUsernames(attendances);
    }

    private List<Attendance> populateUsernames(List<Attendance> attendances) {
        List<String> employeeIds = attendances.stream()
                .map(Attendance::getEmployeeId)
                .distinct()
                .collect(Collectors.toList());

        List<User> users = userRepository.findAllById(employeeIds);

        Map<String, String> employeeIdToUsernameMap = users.stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        attendances.forEach(attendance -> attendance.setEmployeeUsername(
                employeeIdToUsernameMap.getOrDefault(attendance.getEmployeeId(), "Unknown Employee")));
        return attendances;
    }

    public Optional<Attendance> getAttendanceById(String id) {
        return attendanceRepository.findById(id);
    }

    public Optional<Attendance> updateAttendance(String id, Attendance updatedAttendance) {
        return attendanceRepository.findById(id).map(existingAttendance -> {
            existingAttendance.setClockInTime(updatedAttendance.getClockInTime());
            existingAttendance.setClockOutTime(updatedAttendance.getClockOutTime());
            existingAttendance.setStatus(updatedAttendance.getStatus());
            existingAttendance.setRemarks(updatedAttendance.getRemarks());
            return attendanceRepository.save(existingAttendance);
        });
    }

    public void deleteAttendance(String id) {
        attendanceRepository.deleteById(id);
    }

    /**
     * CORRECTED METHOD: Calculates and returns aggregated attendance overview statistics for today.
     * This method now uses a more robust logic to determine attendance status for each employee.
     * @return AttendanceOverviewResponse DTO containing total employees, present, on leave, and absent counts.
     */
    public AttendanceOverviewResponse getAttendanceOverview() {
        LocalDate today = LocalDate.now();

        // 1. Get all active employees
        List<User> allEmployees = userRepository.findAll().stream()
                .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus()))
                .collect(Collectors.toList());
        
        long totalEmployees = allEmployees.size();

        // 2. Get all approved leave requests for today
        Set<String> onLeaveEmployeeIds = leaveRequestRepository.findByStatus("Approved").stream()
                .filter(leaveRequest -> !leaveRequest.getStartDate().isAfter(today) && !leaveRequest.getEndDate().isBefore(today))
                .map(LeaveRequest::getEmployeeId)
                .collect(Collectors.toSet());

        // 3. Get all attendance records for today
        Set<String> presentEmployeeIds = attendanceRepository.findByDateBetween(today, today).stream()
                .filter(attendance -> "Present".equalsIgnoreCase(attendance.getStatus()))
                .map(Attendance::getEmployeeId)
                .collect(Collectors.toSet());

        // 4. Calculate final counts by iterating through all employees
        long presentToday = 0;
        long onLeaveToday = 0;
        long absentToday = 0;
        
        for (User employee : allEmployees) {
            String employeeId = employee.getId();
            if (presentEmployeeIds.contains(employeeId)) {
                presentToday++;
            } else if (onLeaveEmployeeIds.contains(employeeId)) {
                onLeaveToday++;
            } else {
                // If not present and not on leave, they are considered absent
                absentToday++;
            }
        }

        return new AttendanceOverviewResponse(totalEmployees, presentToday, onLeaveToday, absentToday);
    }
}