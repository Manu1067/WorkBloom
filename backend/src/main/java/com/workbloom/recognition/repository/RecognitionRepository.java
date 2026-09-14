package com.workbloom.recognition.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.recognition.entity.Recognition;

public interface RecognitionRepository
        extends JpaRepository<Recognition, Long> {

    List<Recognition> findAllByOrderByCreatedAtDesc();
}