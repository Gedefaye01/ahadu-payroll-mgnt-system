package com.ahadu.payroll.service;

import com.ahadu.payroll.model.Attendance;
import com.ahadu.payroll.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing employee attendance records.
 * Provides methods for recording, retrieving, and updating attendance.
 */
@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    /**
     * Records an employee's attendance (clock-in/out or status update).
     * 
     * @param attendance The Attendance object to be saved.
     * @return The saved Attendance object.
     */
    public Attendance saveAttendance(Attendance attendance) {
        // You might add logic here to check for existing record for the day
        // and update it instead of creating a new one for clock-out.
        return attendanceRepository.save(attendance);
    }

    /**
     * Retrieves all attendance records.
     * 
     * @return A list of all Attendance objects.
     */
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    /**
     * Retrieves attendance records for a specific employee.
     * 
     * @param employeeId The ID of the employee.
     * @return A list of Attendance objects for the specified employee.
     */
    public List<Attendance> getAttendanceByEmployeeId(String employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    /**
     * Retrieves attendance records for a specific employee within a date range.
     * 
     * @param employeeId The ID of the employee.
     * @param startDate  The start date of the range.
     * @param endDate    The end date of the range.
     * @return A list of Attendance objects for the specified employee and date
     *         range.
     */
    public List<Attendance> getAttendanceByEmployeeIdAndDateRange(String employeeId, LocalDate startDate,
            LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
    }

    /**
     * Retrieves a single attendance record by its ID.
     * 
     * @param id The ID of the attendance record.
     * @return An Optional containing the Attendance if found, or empty if not.
     */
    public Optional<Attendance> getAttendanceById(String id) {
        return attendanceRepository.findById(id);
    }

    /**
     * Updates an existing attendance record.
     * 
     * @param id                The ID of the attendance record to update.
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
            // Date and employeeId are typically immutable for an existing record
            return attendanceRepository.save(existingAttendance);
        });
    }

    /**
     * Deletes an attendance record by its ID.
     * 
     * @param id The ID of the attendance record to delete.
     */
    public void deleteAttendance(String id) {
        attendanceRepository.deleteById(id);
    }
}
