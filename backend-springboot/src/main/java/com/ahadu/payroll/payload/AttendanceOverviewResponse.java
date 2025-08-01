package com.ahadu.payroll.payload;

public class AttendanceOverviewResponse {
    private long totalEmployees;
    private long presentToday;
    private long onLeaveToday;
    private long absentToday;
    private long lateToday;

    public AttendanceOverviewResponse(long totalEmployees, long presentToday, long lateToday, long onLeaveToday, long absentToday) {
        this.totalEmployees = totalEmployees;
        this.presentToday = presentToday;
        this.lateToday = lateToday;
        this.onLeaveToday = onLeaveToday;
        this.absentToday = absentToday;
    }

    // Getters
    public long getTotalEmployees() { return totalEmployees; }
    public long getPresentToday() { return presentToday; }
    public long getLateToday() { return lateToday; }
    public long getOnLeaveToday() { return onLeaveToday; }
    public long getAbsentToday() { return absentToday; }

    // Setters
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }
    public void setPresentToday(long presentToday) { this.presentToday = presentToday; }
    public void setLateToday(long lateToday) { this.lateToday = lateToday; }
    public void setOnLeaveToday(long onLeaveToday) { this.onLeaveToday = onLeaveToday; }
    public void setAbsentToday(long absentToday) { this.absentToday = absentToday; }
}