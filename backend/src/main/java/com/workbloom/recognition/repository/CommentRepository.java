package com.workbloom.recognition.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.recognition.entity.Comment;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment> findByRecognitionIdOrderByCreatedAtAsc(
            Long recognitionId
    );

    long countByRecognitionId(Long recognitionId);
}