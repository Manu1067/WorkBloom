package com.workbloom.travel.service;

import com.workbloom.travel.dto.TravelRecommendationResponse;

public interface TravelRecommendationService {

    TravelRecommendationResponse recommend(Long employeeId);
}