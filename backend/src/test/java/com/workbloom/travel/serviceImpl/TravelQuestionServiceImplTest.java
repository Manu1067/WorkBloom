package com.workbloom.travel.serviceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.workbloom.travel.dto.TravelQuestionResponse;
import com.workbloom.travel.entity.TravelQuestion;
import com.workbloom.travel.entity.TravelQuestionOption;
import com.workbloom.travel.repository.TravelQuestionRepository;

@ExtendWith(MockitoExtension.class)
class TravelQuestionServiceImplTest {

    @Mock
    private TravelQuestionRepository travelQuestionRepository;

    private TravelQuestionServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new TravelQuestionServiceImpl(travelQuestionRepository);
    }

    private TravelQuestionOption option(long id, String label, String value, int order) {
        TravelQuestionOption option = new TravelQuestionOption();
        option.setId(id);
        option.setLabel(label);
        option.setValue(value);
        option.setDisplayOrder(order);
        return option;
    }

    @Test
    void mapsActiveQuestionsWithTheirOptions() {
        TravelQuestion question = new TravelQuestion();
        question.setId(7L);
        question.setQuestionText("Which environment are you drawn to right now?");
        question.setDisplayOrder(2);
        question.setActive(true);
        question.setOptions(List.of(
                option(11L, "Mountains", "ENVIRONMENT:MOUNTAINS", 1),
                option(12L, "Beach / coast", "ENVIRONMENT:BEACH", 2)));

        when(travelQuestionRepository.findByActiveTrueOrderByDisplayOrderAsc())
                .thenReturn(List.of(question));

        List<TravelQuestionResponse> result = service.getActiveQuestions();

        assertThat(result).hasSize(1);
        TravelQuestionResponse response = result.get(0);
        assertThat(response.getId()).isEqualTo(7L);
        assertThat(response.getQuestionText()).isEqualTo("Which environment are you drawn to right now?");
        assertThat(response.getOptions()).extracting("id").containsExactly(11L, 12L);
        assertThat(response.getOptions()).extracting("label").containsExactly("Mountains", "Beach / coast");
        assertThat(response.getOptions()).extracting("value")
                .containsExactly("ENVIRONMENT:MOUNTAINS", "ENVIRONMENT:BEACH");
    }

    @Test
    void returnsEmptyListWhenNoActiveQuestionsExist() {
        when(travelQuestionRepository.findByActiveTrueOrderByDisplayOrderAsc())
                .thenReturn(List.of());

        assertThat(service.getActiveQuestions()).isEmpty();
    }
}
