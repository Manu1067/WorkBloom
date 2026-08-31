package com.workbloom.dashboard.dto;

import java.util.List;

import com.workbloom.notification.dto.NotificationResponse;

public class EmployeeDashboardResponse {

    private Long employeeId;
    private String fullName;
    private String email;
    private String department;
    private String designation;
    private String profileImage;
    private List<DashboardEventResponse> upcomingEvents;
    private List<NotificationResponse> unreadNotifications;
    private int unreadNotificationCount;
    private long recognitionReceivedCount;
    private long communityPostCount;
    private String latestMood;
    private Integer latestStressLevel;
    private Integer latestEnergyLevel;

    public EmployeeDashboardResponse() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public List<DashboardEventResponse> getUpcomingEvents() {
        return upcomingEvents;
    }

    public void setUpcomingEvents(
            List<DashboardEventResponse> upcomingEvents) {
        this.upcomingEvents = upcomingEvents;
    }

    public List<NotificationResponse> getUnreadNotifications() {
        return unreadNotifications;
    }

    public void setUnreadNotifications(
            List<NotificationResponse> unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }

    public int getUnreadNotificationCount() {
        return unreadNotificationCount;
    }

    public void setUnreadNotificationCount(int unreadNotificationCount) {
        this.unreadNotificationCount = unreadNotificationCount;
    }

    public long getRecognitionReceivedCount() {
        return recognitionReceivedCount;
    }

    public void setRecognitionReceivedCount(
            long recognitionReceivedCount) {
        this.recognitionReceivedCount = recognitionReceivedCount;
    }

    public long getCommunityPostCount() {
        return communityPostCount;
    }

    public void setCommunityPostCount(long communityPostCount) {
        this.communityPostCount = communityPostCount;
    }

    public String getLatestMood() {
        return latestMood;
    }

    public void setLatestMood(String latestMood) {
        this.latestMood = latestMood;
    }

    public Integer getLatestStressLevel() {
        return latestStressLevel;
    }

    public void setLatestStressLevel(Integer latestStressLevel) {
        this.latestStressLevel = latestStressLevel;
    }

    public Integer getLatestEnergyLevel() {
        return latestEnergyLevel;
    }

    public void setLatestEnergyLevel(Integer latestEnergyLevel) {
        this.latestEnergyLevel = latestEnergyLevel;
    }
}