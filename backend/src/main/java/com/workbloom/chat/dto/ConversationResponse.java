package com.workbloom.chat.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ConversationResponse {

    private Long id;
    private String title;
    private boolean groupConversation;
    private List<ParticipantResponse> participants;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;

    public ConversationResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isGroupConversation() {
        return groupConversation;
    }

    public void setGroupConversation(boolean groupConversation) {
        this.groupConversation = groupConversation;
    }

    public List<ParticipantResponse> getParticipants() {
        return participants;
    }

    public void setParticipants(
            List<ParticipantResponse> participants) {
        this.participants = participants;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }
}