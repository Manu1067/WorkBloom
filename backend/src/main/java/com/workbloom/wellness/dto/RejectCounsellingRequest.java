package com.workbloom.wellness.dto;

public class RejectCounsellingRequest {

    private String rejectionReason;

    public RejectCounsellingRequest() {
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}