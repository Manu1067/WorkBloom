package com.workbloom.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.ai.dto.AiWellnessRequest;
import com.workbloom.ai.dto.AiWellnessResponse;
import com.workbloom.ai.service.AiWellnessService;

@RestController
@RequestMapping("/api/ai/wellness")
public class AiWellnessController {

    private final AiWellnessService aiWellnessService;

    public AiWellnessController(
            AiWellnessService aiWellnessService) {

        this.aiWellnessService = aiWellnessService;
    }

    // =========================================================
    // ANALYZE WELLNESS USING AI
    // =========================================================

    @PostMapping("/analyze")
    public ResponseEntity<AiWellnessResponse> analyzeWellness(
            @RequestParam Long employeeId,
            @RequestBody AiWellnessRequest request) {

        return ResponseEntity.ok(
                aiWellnessService.analyzeWellness(
                        employeeId,
                        request
                )
        );
    }
}