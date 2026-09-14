package com.workbloom.recognition.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.workbloom.recognition.dto.CommentRequest;
import com.workbloom.recognition.dto.CommentResponse;
import com.workbloom.recognition.service.RecognitionService;

@RestController
@RequestMapping("/api/recognition")
public class CommentController {

    private final RecognitionService recognitionService;

    public CommentController(
            RecognitionService recognitionService) {

        this.recognitionService = recognitionService;
    }

    // =========================================================
    // ADD COMMENT
    // =========================================================

    @PostMapping("/{recognitionId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long recognitionId,
            @RequestParam Long employeeId,
            @RequestBody CommentRequest request) {

        return ResponseEntity.ok(
                recognitionService.addComment(
                        recognitionId,
                        employeeId,
                        request
                )
        );
    }

    // =========================================================
    // GET COMMENTS
    // =========================================================

    @GetMapping("/{recognitionId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long recognitionId) {

        return ResponseEntity.ok(
                recognitionService.getComments(
                        recognitionId
                )
        );
    }

    // =========================================================
    // DELETE COMMENT
    // =========================================================

    @DeleteMapping("/{recognitionId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long recognitionId,
            @PathVariable Long commentId,
            @RequestParam Long employeeId) {

        recognitionService.deleteComment(
                commentId,
                employeeId
        );

        return ResponseEntity.noContent().build();
    }
}