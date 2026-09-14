package com.workbloom.recognition.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.recognition.dto.BadgeRequest;
import com.workbloom.recognition.dto.RecognitionRequest;
import com.workbloom.recognition.dto.RecognitionResponse;
import com.workbloom.recognition.entity.Badge;
import com.workbloom.recognition.service.RecognitionService;
import com.workbloom.recognition.dto.BadgeRequest;
import com.workbloom.recognition.entity.Badge;
@RestController
@RequestMapping("/api/recognition")
public class RecognitionController {

    private final RecognitionService recognitionService;

    public RecognitionController(
            RecognitionService recognitionService) {

        this.recognitionService = recognitionService;
    }

    // CREATE RECOGNITION / ACHIEVEMENT
    @PostMapping
    public ResponseEntity<RecognitionResponse> createRecognition(
            @RequestParam Long authorId,
            @RequestBody RecognitionRequest request) {

        return ResponseEntity.ok(
                recognitionService.createRecognition(
                        authorId,
                        request
                )
        );
    }

    // COMPANY FEED
    @GetMapping("/feed")
    public ResponseEntity<List<RecognitionResponse>> getFeed() {

        return ResponseEntity.ok(
                recognitionService.getFeed()
        );
    }

    // EMPLOYEE ACHIEVEMENTS
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<RecognitionResponse>>
    getEmployeeRecognitions(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                recognitionService.getEmployeeRecognitions(
                        employeeId
                )
        );
    }
    @PostMapping("/badges")
public ResponseEntity<Badge> createBadge(
        @RequestBody BadgeRequest request) {

    return ResponseEntity.ok(
            recognitionService.createBadge(request)
    );
}

@GetMapping("/badges")
public ResponseEntity<List<Badge>> getAllBadges() {

    return ResponseEntity.ok(
            recognitionService.getAllBadges()
    );
}
}