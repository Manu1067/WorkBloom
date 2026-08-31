package com.workbloom.recognition.service;

import java.util.List;

import com.workbloom.recognition.dto.CommentRequest;
import com.workbloom.recognition.dto.CommentResponse;
import com.workbloom.recognition.dto.RecognitionRequest;
import com.workbloom.recognition.dto.RecognitionResponse;
import com.workbloom.recognition.entity.Badge;
import com.workbloom.recognition.dto.ReactionRequest;
import com.workbloom.recognition.dto.BadgeRequest;

public interface RecognitionService {

    // Create an achievement / recognition post
    RecognitionResponse createRecognition(
            Long authorId,
            RecognitionRequest request
    );

    // Company-wide feed
    List<RecognitionResponse> getFeed();

    // All recognitions received by an employee
    List<RecognitionResponse> getEmployeeRecognitions(
            Long employeeId
    );

    // Add or change reaction
    RecognitionResponse react(
            Long recognitionId,
            Long employeeId,
            ReactionRequest request
    );

    // Remove reaction
    void removeReaction(
            Long recognitionId,
            Long employeeId
    );

    // Add comment
    CommentResponse addComment(
            Long recognitionId,
            Long employeeId,
            CommentRequest request
    );

    // Get comments
    List<CommentResponse> getComments(
            Long recognitionId
    );

    // Delete own comment
    void deleteComment(
            Long commentId,
            Long employeeId
    );
    // Create a badge
Badge createBadge(
        BadgeRequest request
);

// Get all badges
List<Badge> getAllBadges();
}