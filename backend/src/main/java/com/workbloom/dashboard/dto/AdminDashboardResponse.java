package com.workbloom.dashboard.dto;

public class AdminDashboardResponse {

    private long employeeCount;
    private long activeEventCount;
    private long communityPostCount;
    private long recognitionCount;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            long employeeCount,
            long activeEventCount,
            long communityPostCount,
            long recognitionCount) {

        this.employeeCount = employeeCount;
        this.activeEventCount = activeEventCount;
        this.communityPostCount = communityPostCount;
        this.recognitionCount = recognitionCount;
    }

    public long getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(long employeeCount) {
        this.employeeCount = employeeCount;
    }

    public long getActiveEventCount() {
        return activeEventCount;
    }

    public void setActiveEventCount(long activeEventCount) {
        this.activeEventCount = activeEventCount;
    }

    public long getCommunityPostCount() {
        return communityPostCount;
    }

    public void setCommunityPostCount(long communityPostCount) {
        this.communityPostCount = communityPostCount;
    }

    public long getRecognitionCount() {
        return recognitionCount;
    }

    public void setRecognitionCount(long recognitionCount) {
        this.recognitionCount = recognitionCount;
    }
}