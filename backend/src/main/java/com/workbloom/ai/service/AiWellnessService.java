package com.workbloom.ai.service;

import com.workbloom.ai.dto.AiWellnessRequest;
import com.workbloom.ai.dto.AiWellnessResponse;

public interface AiWellnessService {

    AiWellnessResponse analyzeWellness(
            Long employeeId,
            AiWellnessRequest request
    );
}