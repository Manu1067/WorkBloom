package com.workbloom.travel.service;

import com.workbloom.travel.dto.TravelPreferenceRequest;
import com.workbloom.travel.dto.TravelPreferenceResponse;

public interface TravelPreferenceService {

    TravelPreferenceResponse saveOrUpdate(
            Long employeeId,
            TravelPreferenceRequest request
    );

    TravelPreferenceResponse getByEmployeeId(Long employeeId);
}