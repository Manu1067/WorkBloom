package com.workbloom.buddy.dto;

public class CreateBuddyRequest {

    private Long receiverId;

    public CreateBuddyRequest() {
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }
}