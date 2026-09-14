package com.workbloom.wellness.service;

import java.util.List;

import com.workbloom.wellness.dto.MoodRequest;
import com.workbloom.wellness.dto.WellnessRequest;
import com.workbloom.wellness.dto.WellnessResponse;

public interface WellnessService {

    // Record employee mood
    WellnessResponse recordMood(
            Long employeeId,
            MoodRequest request
    );

    // Record employee wellness data
    WellnessResponse recordWellness(
            Long employeeId,
            WellnessRequest request
    );

    // Get employee's wellness history
    List<WellnessResponse> getEmployeeWellness(
            Long employeeId
    );

    // Get employee's mood history
    List<WellnessResponse> getEmployeeMoodHistory(
            Long employeeId
    );
}