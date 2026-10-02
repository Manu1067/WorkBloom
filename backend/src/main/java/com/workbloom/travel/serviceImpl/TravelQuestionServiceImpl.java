package com.workbloom.travel.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.travel.dto.TravelQuestionResponse;
import com.workbloom.travel.repository.TravelQuestionRepository;
import com.workbloom.travel.service.TravelQuestionService;

@Service
@Transactional(readOnly = true)
public class TravelQuestionServiceImpl implements TravelQuestionService {

    private final TravelQuestionRepository travelQuestionRepository;

    public TravelQuestionServiceImpl(
            TravelQuestionRepository travelQuestionRepository) {

        this.travelQuestionRepository = travelQuestionRepository;
    }

    @Override
    public List<TravelQuestionResponse> getActiveQuestions() {

        return travelQuestionRepository
                .findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(TravelQuestionResponse::fromEntity)
                .toList();
    }
}
