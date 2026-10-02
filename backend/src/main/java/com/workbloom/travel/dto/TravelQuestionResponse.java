package com.workbloom.travel.dto;

import java.util.List;

import com.workbloom.travel.entity.TravelQuestion;

public class TravelQuestionResponse {

    private Long id;
    private String questionText;
    private int displayOrder;
    private List<TravelQuestionOptionResponse> options;

    public TravelQuestionResponse() {
    }

    public static TravelQuestionResponse fromEntity(
            TravelQuestion question) {

        TravelQuestionResponse response =
                new TravelQuestionResponse();

        response.setId(question.getId());
        response.setQuestionText(question.getQuestionText());
        response.setDisplayOrder(question.getDisplayOrder());
        response.setOptions(
                question.getOptions()
                        .stream()
                        .map(TravelQuestionOptionResponse::fromEntity)
                        .toList());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<TravelQuestionOptionResponse> getOptions() {
        return options;
    }

    public void setOptions(List<TravelQuestionOptionResponse> options) {
        this.options = options;
    }
}
