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
     */
    public AttendanceOverviewResponse getAttendanceOverview() {
        LocalDate today = LocalDate.now();

        List<User> allEmployees = userRepository.findAll().stream()
                .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus()))
                .collect(Collectors.toList());
        
        long totalEmployees = allEmployees.size();

        Set<String> onLeaveEmployeeIds = leaveRequestRepository.findByStatus("Approved").stream()
                .filter(leaveRequest -> !leaveRequest.getStartDate().isAfter(today) && !leaveRequest.getEndDate().isBefore(today))
                .map(LeaveRequest::getEmployeeId)
                .collect(Collectors.toSet());

        Set<String> presentAndLateEmployeeIds = attendanceRepository.findByDateBetween(today, today).stream()
                .filter(attendance -> "Present".equalsIgnoreCase(attendance.getStatus()) || "Late".equalsIgnoreCase(attendance.getStatus()))
                .map(Attendance::getEmployeeId)
                .collect(Collectors.toSet());
        
        long presentToday = attendanceRepository.findByDateBetween(today, today).stream()
                .filter(attendance -> "Present".equalsIgnoreCase(attendance.getStatus()))
                .count();

        long lateToday = attendanceRepository.findByDateBetween(today, today).stream()
                .filter(attendance -> "Late".equalsIgnoreCase(attendance.getStatus()))
                .count();

        long onLeaveToday = onLeaveEmployeeIds.size();

        // Calculate absent by excluding those who are present, late, or on leave
        Set<String> presentLateAndOnLeaveIds = presentAndLateEmployeeIds;
        presentLateAndOnLeaveIds.addAll(onLeaveEmployeeIds);
        long absentToday = totalEmployees - presentLateAndOnLeaveIds.size();

        // Ensure absent count is not negative
        if (absentToday < 0) {
            absentToday = 0;
        }

        return new AttendanceOverviewResponse(totalEmployees, presentToday, onLeaveToday, absentToday);
    }

    /**
     * NEW METHOD: Creates a daily "Absent" record for any employee who has not clocked in.
     */
    public void createAbsentRecordsForToday() {
        LocalDate today = LocalDate.now();

        // 1. Get all employee IDs who are supposed to be working
        List<String> allEmployeeIds = userRepository.findAll().stream()
                .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus()))
                .map(User::getId)
                .collect(Collectors.toList());

        // 2. Get IDs of employees who are already present or late today
        Set<String> presentOrLateEmployeeIds = attendanceRepository.findByDateBetween(today, today).stream()
                .map(Attendance::getEmployeeId)
                .collect(Collectors.toSet());

        // 3. Get IDs of employees who have an approved leave for today
        leaveRequestRepository.findByStatus("Approved").stream()
                .filter(leaveRequest -> !leaveRequest.getStartDate().isAfter(today) && !leaveRequest.getEndDate().isBefore(today))
                .map(LeaveRequest::getEmployeeId)
                .forEach(presentOrLateEmployeeIds::add);

        // 4. Find all employees who are neither present, late, nor on leave
        List<String> absentEmployeeIds = allEmployeeIds.stream()
                .filter(employeeId -> !presentOrLateEmployeeIds.contains(employeeId))
                .collect(Collectors.toList());

        // 5. Create and save an "Absent" record for each of them
        List<Attendance> absentRecords = absentEmployeeIds.stream()
                .map(employeeId -> {
                    Attendance absentRecord = new Attendance();
                    absentRecord.setEmployeeId(employeeId);
                    absentRecord.setDate(today);
                    absentRecord.setStatus("Absent");
                    return absentRecord;
                })
                .collect(Collectors.toList());

        if (!absentRecords.isEmpty()) {
            attendanceRepository.saveAll(absentRecords);
            System.out.println("Created " + absentRecords.size() + " absent records for today.");
        }
    }
}