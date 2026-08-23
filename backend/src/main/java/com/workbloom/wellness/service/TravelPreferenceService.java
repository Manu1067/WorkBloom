package com.workbloom.wellness.service;

import com.workbloom.wellness.dto.TravelPreferenceRequest;
import com.workbloom.wellness.entity.TravelPreference;

public interface TravelPreferenceService {

    TravelPreference saveOrUpdate(
            Long employeeId,
            TravelPreferenceRequest request
    );

    TravelPreference getByEmployeeId(Long employeeId);
}