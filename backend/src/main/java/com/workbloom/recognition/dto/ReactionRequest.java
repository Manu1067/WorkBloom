package com.workbloom.recognition.dto;

import com.workbloom.recognition.entity.ReactionType;

public class ReactionRequest {

    private ReactionType type;

    public ReactionRequest() {
    }

    public ReactionType getType() {
        return type;
    }

    public void setType(ReactionType type) {
        this.type = type;
    }
}