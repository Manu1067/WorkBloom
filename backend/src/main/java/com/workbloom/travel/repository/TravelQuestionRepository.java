package com.workbloom.travel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.travel.entity.TravelQuestion;

public interface TravelQuestionRepository
        extends JpaRepository<TravelQuestion, Long> {

    List<TravelQuestion> findByActiveTrueOrderByDisplayOrderAsc();

    long countByActiveTrue();
}
