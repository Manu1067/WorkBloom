package com.workbloom.recognition.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.recognition.dto.RecognitionResponse;
import com.workbloom.recognition.dto.ReactionRequest;
import com.workbloom.recognition.service.RecognitionService;

@RestController
@RequestMapping("/api/recognition")
public class ReactionController {

    private final RecognitionService recognitionService;

    public ReactionController(
            RecognitionService recognitionService) {

        this.recognitionService = recognitionService;
    }

    // ADD / CHANGE REACTION
    @PostMapping("/{recognitionId}/reactions")
    public ResponseEntity<RecognitionResponse> react(
            @PathVariable Long recognitionId,
            @RequestParam Long employeeId,
            @RequestBody ReactionRequest request) {

        return ResponseEntity.ok(
                recognitionService.react(
                        recognitionId,
                        employeeId,
                        request
                )
        );
    }

    // REMOVE REACTION
    @DeleteMapping("/{recognitionId}/reactions")
    public ResponseEntity<Void> removeReaction(
            @PathVariable Long recognitionId,
            @RequestParam Long employeeId) {

        recognitionService.removeReaction(
                recognitionId,
                employeeId
        );

        return ResponseEntity.noContent().build();
    }
}