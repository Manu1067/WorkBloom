package com.workbloom.chat.dto;

import java.util.List;

public class ConversationRequest {

    private String title;
    private List<Long> participantIds;

    public ConversationRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<Long> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<Long> participantIds) {
        this.participantIds = participantIds;
    }
}