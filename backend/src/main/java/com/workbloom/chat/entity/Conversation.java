package com.workbloom.chat.entity;

import com.workbloom.common.entity.BaseEntity;
import com.workbloom.employee.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_conversations")
public class Conversation extends BaseEntity {

    @Column(length = 150)
    private String title;

    @Column(nullable = false)
    private boolean groupConversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private Employee createdBy;

    @Column(nullable = false)
    private boolean active = true;

    public Conversation() {
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

    public Employee getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Employee createdBy) {
        this.createdBy = createdBy;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}