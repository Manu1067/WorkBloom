package com.workbloom.analytics.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * All figures here are live aggregate counts computed directly from
 * existing database entities at request time - nothing here is
 * hardcoded or fabricated. See AnalyticsServiceImpl for the exact
 * query behind each field.
 */
public class AnalyticsOverviewResponse {

    // ---- Employee ----
    private long totalEmployees;
    private Map<String, Long> employeesByStatus;

    // ---- Wellness ----
    private long totalMoodLogs;
    private Map<String, Long> moodDistribution;
    private long totalWellnessLogs;

    // ---- Events ----
    private long totalEvents;
    private Map<String, Long> eventsByStatus;
    private long totalEventRegistrations;
    private Map<String, Long> eventRegistrationsByStatus;

    // ---- Community ----
    private long totalCommunityPosts;

    // ---- Recognition ----
    private long totalRecognitions;

    // ---- Learning ----
    private long totalCourseEnrollments;

    // ---- Impact / Volunteering ----
    private long totalVolunteerRegistrations;

    // ---- Clubs ----
    private long totalClubs;
    private Map<String, Long> clubMembershipsByStatus;

    // ---- Leave ----
    private Map<String, Long> leaveRequestsByStatus;

    private LocalDateTime generatedAt;

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public Map<String, Long> getEmployeesByStatus() {
        return employeesByStatus;
    }

    public void setEmployeesByStatus(Map<String, Long> employeesByStatus) {
        this.employeesByStatus = employeesByStatus;
    }

    public long getTotalMoodLogs() {
        return totalMoodLogs;
    }

    public void setTotalMoodLogs(long totalMoodLogs) {
        this.totalMoodLogs = totalMoodLogs;
    }

    public Map<String, Long> getMoodDistribution() {
        return moodDistribution;
    }

    public void setMoodDistribution(Map<String, Long> moodDistribution) {
        this.moodDistribution = moodDistribution;
    }

    public long getTotalWellnessLogs() {
        return totalWellnessLogs;
    }

    public void setTotalWellnessLogs(long totalWellnessLogs) {
        this.totalWellnessLogs = totalWellnessLogs;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public Map<String, Long> getEventsByStatus() {
        return eventsByStatus;
    }

    public void setEventsByStatus(Map<String, Long> eventsByStatus) {
        this.eventsByStatus = eventsByStatus;
    }

    public long getTotalEventRegistrations() {
        return totalEventRegistrations;
    }

    public void setTotalEventRegistrations(long totalEventRegistrations) {
        this.totalEventRegistrations = totalEventRegistrations;
    }

    public Map<String, Long> getEventRegistrationsByStatus() {
        return eventRegistrationsByStatus;
    }

    public void setEventRegistrationsByStatus(
            Map<String, Long> eventRegistrationsByStatus) {
        this.eventRegistrationsByStatus = eventRegistrationsByStatus;
    }

    public long getTotalCommunityPosts() {
        return totalCommunityPosts;
    }

    public void setTotalCommunityPosts(long totalCommunityPosts) {
        this.totalCommunityPosts = totalCommunityPosts;
    }

    public long getTotalRecognitions() {
        return totalRecognitions;
    }

    public void setTotalRecognitions(long totalRecognitions) {
        this.totalRecognitions = totalRecognitions;
    }

    public long getTotalCourseEnrollments() {
        return totalCourseEnrollments;
    }

    public void setTotalCourseEnrollments(long totalCourseEnrollments) {
        this.totalCourseEnrollments = totalCourseEnrollments;
    }

    public long getTotalVolunteerRegistrations() {
        return totalVolunteerRegistrations;
    }

    public void setTotalVolunteerRegistrations(
            long totalVolunteerRegistrations) {
        this.totalVolunteerRegistrations = totalVolunteerRegistrations;
    }

    public long getTotalClubs() {
        return totalClubs;
    }

    public void setTotalClubs(long totalClubs) {
        this.totalClubs = totalClubs;
    }

    public Map<String, Long> getClubMembershipsByStatus() {
        return clubMembershipsByStatus;
    }

    public void setClubMembershipsByStatus(
            Map<String, Long> clubMembershipsByStatus) {
        this.clubMembershipsByStatus = clubMembershipsByStatus;
    }

    public Map<String, Long> getLeaveRequestsByStatus() {
        return leaveRequestsByStatus;
    }

    public void setLeaveRequestsByStatus(
            Map<String, Long> leaveRequestsByStatus) {
        this.leaveRequestsByStatus = leaveRequestsByStatus;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}
