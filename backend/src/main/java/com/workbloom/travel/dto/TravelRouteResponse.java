package com.workbloom.travel.dto;

import java.util.List;

public class TravelRouteResponse {

    private List<TravelRoutePointResponse> points;
    private double totalDistanceKm;

    public TravelRouteResponse() {
    }

    public TravelRouteResponse(
            List<TravelRoutePointResponse> points,
            double totalDistanceKm) {

        this.points = points;
        this.totalDistanceKm = totalDistanceKm;
    }

    public List<TravelRoutePointResponse> getPoints() {
        return points;
    }

    public void setPoints(List<TravelRoutePointResponse> points) {
        this.points = points;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }
}
