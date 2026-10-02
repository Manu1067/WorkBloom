package com.workbloom.travel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.travel.dto.TravelQuestionResponse;
import com.workbloom.travel.service.TravelQuestionService;

/**
 * Serves the Travel Questions questionnaire (stored in PostgreSQL, never
 * hardcoded in Java - see database/seed/01_travel_questions.sql).
 */
@RestController
@RequestMapping({
        "/api/travel/questions",
        "/api/wellness/travel/questions"
})
public class TravelQuestionController {

    private final TravelQuestionService travelQuestionService;

    public TravelQuestionController(TravelQuestionService travelQuestionService) {
        this.travelQuestionService = travelQuestionService;
    }

    @GetMapping
    public ResponseEntity<List<TravelQuestionResponse>> getActiveQuestions() {
        return ResponseEntity.ok(travelQuestionService.getActiveQuestions());
    }
}
