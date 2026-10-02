package com.workbloom.travel.dto;

import com.workbloom.travel.entity.TravelQuestionOption;

public class TravelQuestionOptionResponse {

    private Long id;
    private String label;
    private String value;
    private int displayOrder;

    public TravelQuestionOptionResponse() {
    }

    public static TravelQuestionOptionResponse fromEntity(
            TravelQuestionOption option) {

        TravelQuestionOptionResponse response =
                new TravelQuestionOptionResponse();

        response.setId(option.getId());
        response.setLabel(option.getLabel());
        response.setValue(option.getValue());
        response.setDisplayOrder(option.getDisplayOrder());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
