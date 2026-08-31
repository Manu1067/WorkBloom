package com.workbloom.travel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.travel.dto.TravelRecommendationResponse;
import com.workbloom.travel.service.TravelRecommendationService;

@RestController
@RequestMapping({
        "/api/travel",
        "/api/wellness/travel"
})
public class TravelRecommendationController {

    private final TravelRecommendationService travelRecommendationService;

    public TravelRecommendationController(
            TravelRecommendationService travelRecommendationService) {

        this.travelRecommendationService = travelRecommendationService;
    }

    @GetMapping("/recommend")
    public TravelRecommendationResponse recommend(
            @RequestParam Long employeeId) {

        return travelRecommendationService.recommend(employeeId);
    }
}