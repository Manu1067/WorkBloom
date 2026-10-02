package com.workbloom.travel.config;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import com.workbloom.travel.repository.DestinationImageRepository;
import com.workbloom.travel.repository.DestinationRepository;
import com.workbloom.travel.repository.TravelQuestionOptionRepository;
import com.workbloom.travel.repository.TravelQuestionRepository;

@ExtendWith(MockitoExtension.class)
class TravelSeedInitializerTest {

    @Mock private JdbcTemplate jdbcTemplate;
    @Mock private TravelQuestionRepository questionRepository;
    @Mock private TravelQuestionOptionRepository optionRepository;
    @Mock private DestinationRepository destinationRepository;
    @Mock private DestinationImageRepository imageRepository;

    private TravelSeedInitializer initializer;

    @BeforeEach
    void setUp() {
        initializer = new TravelSeedInitializer(
                jdbcTemplate, questionRepository, optionRepository, destinationRepository, imageRepository);
    }

    @Test
    void doesNothingWhenAllTravelTablesAlreadyHaveData(@TempDir Path dir) {
        ReflectionTestUtils.setField(initializer, "configuredDirectory", dir.toString());
        when(questionRepository.count()).thenReturn(6L);
        when(optionRepository.count()).thenReturn(27L);
        when(destinationRepository.count()).thenReturn(31L);
        when(imageRepository.count()).thenReturn(62L);

        initializer.run(null);

        verifyNoInteractions(jdbcTemplate);
    }

    @Test
    void appliesQuestionSeedWhenQuestionsTableIsEmpty(@TempDir Path dir) throws IOException {
        String sql = "-- questions seed\nINSERT INTO travel_questions VALUES (1);";
        Files.writeString(dir.resolve(TravelSeedInitializer.QUESTIONS_FILE), sql, StandardCharsets.UTF_8);
        ReflectionTestUtils.setField(initializer, "configuredDirectory", dir.toString());

        when(questionRepository.count()).thenReturn(0L);
        when(destinationRepository.count()).thenReturn(31L);
        when(imageRepository.count()).thenReturn(62L);

        initializer.run(null);

        verify(jdbcTemplate).execute(sql);
    }

    @Test
    void doesNotFailStartupWhenSeedDirectoryIsMissing(@TempDir Path dir) {
        ReflectionTestUtils.setField(initializer, "configuredDirectory", dir.resolve("missing").toString());
        when(questionRepository.count()).thenReturn(0L);

        initializer.run(null);

        verifyNoInteractions(jdbcTemplate);
    }
}
