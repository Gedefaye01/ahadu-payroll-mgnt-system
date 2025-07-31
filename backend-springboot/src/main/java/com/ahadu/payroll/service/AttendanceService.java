package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Attendance;
// import com.ahadu.payroll.model.LeaveRequest; // Import LeaveRequest
import com.ahadu.payroll.model.User; // Import User
import com.ahadu.payroll.payload.AttendanceOverviewResponse; // Import the new DTO
import com.ahadu.payroll.repository.AttendanceRepository;
import com.ahadu.payroll.repository.LeaveRequestRepository; // Import LeaveRequestRepository
import com.ahadu.payroll.repository.UserRepository; // Import UserRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
// import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service class for managing employee attendance records.
 * Provides methods for recording, retrieving, and updating attendance,
 * and now for generating attendance overview statistics.
 */
@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository; // Inject UserRepository to get employee names
    private final LeaveRequestRepository leaveRequestRepository; // Inject LeaveRequestRepository for on-leave status

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository,
            LeaveRequestRepository leaveRequestRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    /**
     * Records an employee's attendance (clock-in/out or status update).
     * * @param attendance The Attendance object to be saved.
     * 
     * @return The saved Attendance object.
     */
    public Attendance saveAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    /**
     * Retrieves all attendance records and populates employee usernames.
     * * @return A list of all Attendance objects with employee usernames.
     */
    public List<Attendance> getAllAttendanceWithUsernames() {
        List<Attendance> attendances = attendanceRepository.findAll();
        return populateUsernames(attendances);
    }

    /**
     * Retrieves attendance records for a specific employee and populates employee
     * username.
     * * @param employeeId The ID of the employee.
     * 
     * @return A list of Attendance objects for the specified employee with employee
     *         username.
     */
    public List<Attendance> getAttendanceByEmployeeIdWithUsernames(String employeeId) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeId(employeeId);
        return populateUsernames(attendances);
    }

    /**
     * Retrieves attendance records for a specific employee within a date range and
     * populates employee username.
     * * @param employeeId The ID of the employee.
     * 
     * @param startDate The start date of the range.
     * @param endDate   The end date of the range.
     * @return A list of Attendance objects for the specified employee and date
     *         range with employee username.
     */
    public List<Attendance> getAttendanceByEmployeeIdAndDateRangeWithUsernames(String employeeId, LocalDate startDate,
            LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate,
                endDate);
        return populateUsernames(attendances);
    }

    /**
     * Helper method to populate the employeeUsername field in a list of Attendance
     * objects.
     * * @param attendances The list of Attendance objects to enrich.
     * 
     * @return The enriched list of Attendance objects.
     */
    private List<Attendance> populateUsernames(List<Attendance> attendances) {
        // Get all unique employee IDs from the attendance records
        List<String> employeeIds = attendances.stream()
                .map(Attendance::getEmployeeId)
                .distinct()
                .collect(Collectors.toList());

        // Fetch all users whose IDs are in the list
        List<User> users = userRepository.findAllById(employeeIds);

        // Create a map for quick lookup: employeeId -> username
        Map<String, String> employeeIdToUsernameMap = users.stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        // Populate the employeeUsername for each attendance record
        attendances.forEach(attendance -> attendance.setEmployeeUsername(
                employeeIdToUsernameMap.getOrDefault(attendance.getEmployeeId(), "Unknown Employee")));
        return attendances;
    }

    /**
     * Retrieves a single attendance record by its ID.
     * * @param id The ID of the attendance record.
     * 
     * @return An Optional containing the Attendance if found, or empty if not.
     */
    public Optional<Attendance> getAttendanceById(String id) {
        return attendanceRepository.findById(id);
    }

    /**
     * Updates an existing attendance record.
     * * @param id The ID of the attendance record to update.
     * 
     * @param updatedAttendance The Attendance object with updated details.
     * @return An Optional containing the updated Attendance if found and updated,
     *         or empty if not found.
     */
    public Optional<Attendance> updateAttendance(String id, Attendance updatedAttendance) {
        return attendanceRepository.findById(id).map(existingAttendance -> {
            existingAttendance.setClockInTime(updatedAttendance.getClockInTime());
            existingAttendance.setClockOutTime(updatedAttendance.getClockOutTime());
            existingAttendance.setStatus(updatedAttendance.getStatus());
            existingAttendance.setRemarks(updatedAttendance.getRemarks());
            return attendanceRepository.save(existingAttendance);
        });
    }

    /**
     * Deletes an attendance record by its ID.
     * * @param id The ID of the attendance record to delete.
     */
    public void deleteAttendance(String id) {
        attendanceRepository.deleteById(id);
    }

    /**
     * NEW METHOD: Calculates and returns aggregated attendance overview statistics
     * for today.
     * * @return AttendanceOverviewResponse DTO containing total employees, present,
     * on leave, and absent counts.
     */
    public AttendanceOverviewResponse getAttendanceOverview() {
        LocalDate today = LocalDate.now();

        // Total Employees: Count all active users
        long totalEmployees = userRepository.findAll().stream()
                .filter(user -> "Active".equalsIgnoreCase(user.getEmployeeStatus())) // Assuming getEmployeeStatus is
                                                                                     // implemented in User model
                .count();

        // Present Today: Count attendance records for today with 'Present' status
        long presentToday = attendanceRepository.findByDateBetween(today, today).stream()
                .filter(attendance -> "Present".equalsIgnoreCase(attendance.getStatus()))
                .count();

        // On Leave Today: Count leave requests that are approved and cover today's date
        long onLeaveToday = leaveRequestRepository.findByStatus("Approved").stream()
                .filter(leaveRequest -> !leaveRequest.getStartDate().isAfter(today)
                        && !leaveRequest.getEndDate().isBefore(today))
                .count();

        // Absent Today: Total Employees - Present Today - On Leave Today
        // This is a simplified calculation. A more robust system would explicitly track
        // absences.
        long absentToday = totalEmployees - presentToday - onLeaveToday;
        if (absentToday < 0)
            absentToday = 0; // Ensure it doesn't go negative due to data inconsistencies

        return new AttendanceOverviewResponse(totalEmployees, presentToday, onLeaveToday, absentToday);
    }
}
