package com.ahadu.payroll.payload;

/**
 * DTO for sending aggregated attendance overview statistics to the frontend.
 */
public class AttendanceOverviewResponse {
    private long totalEmployees;
    private long presentToday;
    private long onLeaveToday;
    private long absentToday;

    public AttendanceOverviewResponse(long totalEmployees, long presentToday, long onLeaveToday, long absentToday) {
        this.totalEmployees = totalEmployees;
        this.presentToday = presentToday;
        this.onLeaveToday = onLeaveToday;
        this.absentToday = absentToday;
    }

    // Getters
    public long getTotalEmployees() {
        return totalEmployees;
    }

    public long getPresentToday() {
        return presentToday;
    }

    public long getOnLeaveToday() {
        return onLeaveToday;
    }

    public long getAbsentToday() {
        return absentToday;
    }

    // Setters (Optional, but good practice if you plan to build this object
    // incrementally)
    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public void setPresentToday(long presentToday) {
        this.presentToday = presentToday;
    }

    public void setOnLeaveToday(long onLeaveToday) {
        this.onLeaveToday = onLeaveToday;
    }

    public void setAbsentToday(long absentToday) {
        this.absentToday = absentToday;
    }
}
