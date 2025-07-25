package com.ahadu.payroll.repository;

import com.ahadu.payroll.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Attendance entities, using MongoDB.
 * Provides standard CRUD operations for the 'attendance' collection.
 */
@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findByEmployeeId(String employeeId);

    Optional<Attendance> findByEmployeeIdAndDate(String employeeId, LocalDate date);

    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<Attendance> findByEmployeeIdAndDateBetween(String employeeId, LocalDate startDate, LocalDate endDate);
}
