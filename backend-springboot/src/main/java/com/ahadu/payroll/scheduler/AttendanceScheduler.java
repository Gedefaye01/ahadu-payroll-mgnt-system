package com.ahadu.payroll.scheduler;

import com.ahadu.payroll.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AttendanceScheduler {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceScheduler(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * This method runs every night at 11:59 PM to create absent records.
     */
    @Scheduled(cron = "0 59 23 * * *")
    public void createDailyAbsentRecords() {
        System.out.println("Scheduled task started: Creating daily absent records...");
        attendanceService.createAbsentRecordsForToday();
    }
}