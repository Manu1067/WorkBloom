package com.workbloom.travel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.travel.dto.MoodTravelRecommendationRequest;
import com.workbloom.travel.dto.TravelRecommendationResponse;
import com.workbloom.travel.service.TravelRecommendationService;

import jakarta.validation.Valid;

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

    // =========================================================
    // SINGLE BEST-MATCH RECOMMENDATION
    // Based on the employee's latest mood, wellness log and saved
    // travel preferences - all read from PostgreSQL.
    // =========================================================

    @GetMapping("/recommend")
    public TravelRecommendationResponse recommend(
            @RequestParam Long employeeId) {

        return travelRecommendationService.recommend(employeeId);
    }

    // =========================================================
    // RANKED RECOMMENDATIONS FROM THE TRAVEL QUESTIONS FLOW
    // Body carries the employeeId and the TravelQuestionOption ids the
    // employee selected; response is every active destination, sorted
    // by compatibility score (highest first).
    // =========================================================

    @PostMapping("/recommendations")
    public ResponseEntity<List<TravelRecommendationResponse>> recommendFromAnswers(
            @Valid @RequestBody MoodTravelRecommendationRequest request) {

        return ResponseEntity.ok(
                travelRecommendationService.recommendFromAnswers(
                        request.getEmployeeId(),
                        request.getSelectedOptionIds()));
    }
}
