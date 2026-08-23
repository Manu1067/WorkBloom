package com.workbloom.wellness.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.wellness.dto.TravelRecommendationResponse;
import com.workbloom.wellness.service.TravelRecommendationService;

@RestController
@RequestMapping("/api/wellness/travel")
public class TravelRecommendationController {

    private final TravelRecommendationService
            travelRecommendationService;

    public TravelRecommendationController(
            TravelRecommendationService travelRecommendationService) {

        this.travelRecommendationService =
                travelRecommendationService;
    }

    // =====================================================
    // GET TRAVEL RECOMMENDATION
    // =====================================================

    @GetMapping("/recommend")
    public TravelRecommendationResponse recommend(
            @RequestParam Long employeeId) {

        return travelRecommendationService
                .recommend(employeeId);
    }
}