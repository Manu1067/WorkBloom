package com.workbloom.travel.dto;

public class TravelRoutePointResponse {

    private Long destinationId;
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private int order;

    public TravelRoutePointResponse() {
    }

    public TravelRoutePointResponse(
            Long destinationId,
            String name,
            String location,
            Double latitude,
            Double longitude,
            int order) {

        this.destinationId = destinationId;
        this.name = name;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.order = order;
    }

    public Long getDestinationId() {
        return destinationId;
    }

    public void setDestinationId(Long destinationId) {
        this.destinationId = destinationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }
}
