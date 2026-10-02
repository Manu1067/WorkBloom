package com.workbloom.travel.service;

import java.util.List;

import com.workbloom.travel.dto.TravelRecommendationResponse;

public interface TravelRecommendationService {

    /**
     * Single best-match recommendation, derived from the employee's latest
     * mood log, latest wellness log and saved travel preferences - all
     * read from PostgreSQL and scored against real Destination records.
     */
    TravelRecommendationResponse recommend(Long employeeId);

    /**
     * Ranked list of recommendations built from the employee's answers to
     * the Travel Questions flow (moods/environment/trip style/budget/
     * duration/activities), combined with their mood + wellness history.
     * Returns every active destination, sorted by compatibility score
     * (highest first).
     */
    List<TravelRecommendationResponse> recommendFromAnswers(
            Long employeeId,
            List<Long> selectedOptionIds);
}