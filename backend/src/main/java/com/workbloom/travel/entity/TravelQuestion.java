package com.workbloom.travel.entity;

import java.util.ArrayList;
import java.util.List;

import com.workbloom.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "travel_questions")
public class TravelQuestion extends BaseEntity {

    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "question", fetch = FetchType.EAGER)
    @OrderBy("displayOrder ASC")
    private List<TravelQuestionOption> options = new ArrayList<>();

    public TravelQuestion() {
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<TravelQuestionOption> getOptions() {
        return options;
    }

    public void setOptions(List<TravelQuestionOption> options) {
        this.options = options;
    }
}
