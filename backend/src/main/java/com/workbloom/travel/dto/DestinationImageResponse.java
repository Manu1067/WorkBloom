package com.workbloom.travel.dto;

import com.workbloom.travel.entity.DestinationImage;

public class DestinationImageResponse {

    private Long id;
    private String imageUrl;
    private String altText;
    private boolean primaryImage;
    private int displayOrder;

    public DestinationImageResponse() {
    }

    public static DestinationImageResponse fromEntity(
            DestinationImage image) {

        DestinationImageResponse response =
                new DestinationImageResponse();

        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        response.setAltText(image.getAltText());
        response.setPrimaryImage(image.isPrimaryImage());
        response.setDisplayOrder(image.getDisplayOrder());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public boolean isPrimaryImage() {
        return primaryImage;
    }

    public void setPrimaryImage(boolean primaryImage) {
        this.primaryImage = primaryImage;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
