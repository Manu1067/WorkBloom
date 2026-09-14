package com.workbloom.chat.dto;

import java.time.LocalDateTime;

import com.workbloom.chat.entity.ChatMessage;
import com.workbloom.chat.entity.MessageStatus;

public class ChatMessageResponse {

    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String content;
    private MessageStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;

    public ChatMessageResponse() {
    }

    public static ChatMessageResponse fromEntity(ChatMessage message) {

        ChatMessageResponse response = new ChatMessageResponse();

        response.setId(message.getId());
        response.setConversationId(message.getConversation().getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(
                message.getSender().getFirstName()
                        + " "
                        + (message.getSender().getLastName() == null
                                ? ""
                                : message.getSender().getLastName())
        );
        response.setContent(message.getContent());
        response.setStatus(message.getStatus());
        response.setSentAt(message.getSentAt());
        response.setReadAt(message.getReadAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageStatus getStatus() {
        return status;
    }

    public void setStatus(MessageStatus status) {
        this.status = status;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}