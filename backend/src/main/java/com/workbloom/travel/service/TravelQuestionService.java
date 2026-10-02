package com.workbloom.travel.service;

import java.util.List;

import com.workbloom.travel.dto.TravelQuestionResponse;

public interface TravelQuestionService {

    List<TravelQuestionResponse> getActiveQuestions();
}
