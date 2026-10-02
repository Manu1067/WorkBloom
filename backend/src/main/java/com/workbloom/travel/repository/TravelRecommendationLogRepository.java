package com.workbloom.travel.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.travel.entity.TravelRecommendationLog;

public interface TravelRecommendationLogRepository
        extends JpaRepository<TravelRecommendationLog, Long> {

    long countByDestination_Id(Long destinationId);
}
