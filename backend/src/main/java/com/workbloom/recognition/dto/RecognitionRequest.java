package com.workbloom.recognition.dto;

import com.workbloom.recognition.entity.RecognitionType;

public class RecognitionRequest {

    private Long employeeId;

    private String title;

    private String message;

    private String imageUrl;

    private RecognitionType type;

    public RecognitionRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public RecognitionType getType() {
        return type;
    }

    public void setType(RecognitionType type) {
        this.type = type;
    }
}