package com.workbloom.club.dto;

import java.time.LocalDateTime;

import com.workbloom.club.entity.ClubMembership;
import com.workbloom.club.entity.ClubMemberRole;

public class ClubMemberResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private ClubMemberRole role;
    private LocalDateTime joinedAt;

    public ClubMemberResponse() {
    }

    public static ClubMemberResponse fromEntity(
            ClubMembership membership) {

        ClubMemberResponse response = new ClubMemberResponse();
        response.setId(membership.getId());
        response.setEmployeeId(membership.getEmployee().getId());
        response.setEmployeeName(
                membership.getEmployee().getFirstName()
                        + " "
                        + (membership.getEmployee().getLastName() == null
                                ? ""
                                : membership.getEmployee().getLastName())
        );
        response.setRole(membership.getRole());
        response.setJoinedAt(membership.getJoinedAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public ClubMemberRole getRole() {
        return role;
    }

    public void setRole(ClubMemberRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}