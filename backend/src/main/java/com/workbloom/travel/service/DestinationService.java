package com.workbloom.travel.service;

import java.util.List;

import com.workbloom.travel.dto.DestinationImageResponse;
import com.workbloom.travel.dto.DestinationResponse;
import com.workbloom.travel.dto.DestinationSummaryResponse;
import com.workbloom.travel.entity.DestinationCategory;

public interface DestinationService {

    List<DestinationSummaryResponse> listDestinations(
            DestinationCategory category);

    DestinationResponse getDestination(Long destinationId);

    List<DestinationImageResponse> getDestinationImages(
            Long destinationId);
}
