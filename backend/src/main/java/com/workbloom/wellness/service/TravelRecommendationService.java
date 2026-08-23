package com.workbloom.wellness.service;

import com.workbloom.wellness.dto.TravelRecommendationResponse;

public interface TravelRecommendationService {

    TravelRecommendationResponse recommend(Long employeeId);
}