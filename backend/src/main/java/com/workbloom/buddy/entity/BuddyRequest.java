package com.workbloom.buddy.entity;

import java.time.LocalDateTime;

import com.workbloom.common.entity.BaseEntity;
import com.workbloom.employee.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "buddy_requests")
public class BuddyRequest extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private Employee receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BuddyRequestStatus status;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime respondedAt;

    public BuddyRequest() {
    }

    public BuddyRequest(Employee requester,
                        Employee receiver,
                        BuddyRequestStatus status,
                        LocalDateTime requestedAt) {

        this.requester = requester;
        this.receiver = receiver;
        this.status = status;
        this.requestedAt = requestedAt;
    }

    public Employee getRequester() {
        return requester;
    }

    public void setRequester(Employee requester) {
        this.requester = requester;
    }

    public Employee getReceiver() {
        return receiver;
    }

    public void setReceiver(Employee receiver) {
        this.receiver = receiver;
    }

    public BuddyRequestStatus getStatus() {
        return status;
    }

    public void setStatus(BuddyRequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }
}