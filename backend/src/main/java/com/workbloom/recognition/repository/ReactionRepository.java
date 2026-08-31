package com.workbloom.recognition.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.recognition.entity.Reaction;

public interface ReactionRepository
        extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByRecognitionIdAndEmployeeId(
            Long recognitionId,
            Long employeeId
    );

    long countByRecognitionId(Long recognitionId);

    void deleteByRecognitionIdAndEmployeeId(
            Long recognitionId,
            Long employeeId
    );
}