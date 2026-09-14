package com.workbloom.chat.dto;

import com.workbloom.chat.entity.ConversationParticipant;

public class ParticipantResponse {

    private Long employeeId;
    private String employeeName;

    public ParticipantResponse() {
    }

    public static ParticipantResponse fromEntity(
            ConversationParticipant participant) {

        ParticipantResponse response = new ParticipantResponse();
        response.setEmployeeId(participant.getEmployee().getId());
        response.setEmployeeName(
                participant.getEmployee().getFirstName()
                        + " "
                        + (participant.getEmployee().getLastName() == null
                                ? ""
                                : participant.getEmployee().getLastName())
        );

        return response;
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
}