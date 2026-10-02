package com.workbloom.ai.serviceimpl;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import tools.jackson.databind.ObjectMapper;

import com.workbloom.ai.dto.AiWellnessRequest;
import com.workbloom.exception.ServiceUnavailableException;
import com.workbloom.wellness.repository.MoodLogRepository;

/**
 * Verifies that AiWellnessServiceImpl translates n8n/Ollama failures
 * into a typed ServiceUnavailableException.
 */
@ExtendWith(MockitoExtension.class)
class AiWellnessServiceImplTest {

    @Mock
    private MoodLogRepository moodLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    private RestClient restClient;

    private AiWellnessServiceImpl service;

    private static final String WEBHOOK_URL =
            "http://127.0.0.1:5678/webhook/workbloom/wellness";

    @BeforeEach
    void setUp() {

        /*
         * No mood history for employee 1.
         */
        when(
                moodLogRepository
                        .findByEmployee_IdOrderByRecordedAtDesc(1L)
        ).thenReturn(List.of());

        /*
         * Mock RestClient.
         */
        requestBodyUriSpec =
                mock(
                        RestClient.RequestBodyUriSpec.class,
                        RETURNS_DEEP_STUBS
                );

        restClient = mock(RestClient.class);

        when(restClient.post())
                .thenReturn(requestBodyUriSpec);

        when(requestBodyUriSpec.uri(WEBHOOK_URL))
                .thenReturn(requestBodyUriSpec);

        when(requestBodyUriSpec.contentType(any()))
                .thenReturn(requestBodyUriSpec);

        when(requestBodyUriSpec.accept(any()))
                .thenReturn(requestBodyUriSpec);

        when(requestBodyUriSpec.body(any(AiWellnessRequest.class)))
                .thenReturn(requestBodyUriSpec);

        /*
         * Mock RestClient.Builder.
         */
        RestClient.Builder builder =
                mock(RestClient.Builder.class);

        when(builder.build())
                .thenReturn(restClient);

        /*
         * New constructor now includes ObjectMapper.
         */
        service =
                new AiWellnessServiceImpl(
                        builder,
                        WEBHOOK_URL,
                        moodLogRepository,
                        objectMapper
                );
    }

    /**
     * n8n/Ollama connection failure should become
     * ServiceUnavailableException.
     */
    @Test
    void translatesConnectionFailureIntoServiceUnavailable() {

        when(
                requestBodyUriSpec.exchange(any())
        ).thenThrow(
                new ResourceAccessException(
                        "Connection refused"
                )
        );

        assertThatThrownBy(
                () -> service.analyzeWellness(
                        1L,
                        new AiWellnessRequest()
                )
        )
                .isInstanceOf(
                        ServiceUnavailableException.class
                );
    }

    /**
     * HTTP errors returned by n8n should become
     * ServiceUnavailableException.
     */
    @Test
    void translatesNonTwoXxResponseIntoServiceUnavailable() {

        RestClientResponseException upstreamError =
                new RestClientResponseException(
                        "Internal Server Error",
                        HttpStatusCode.valueOf(500),
                        "Internal Server Error",
                        null,
                        null,
                        null
                );

        when(
                requestBodyUriSpec.exchange(any())
        ).thenThrow(upstreamError);

        assertThatThrownBy(
                () -> service.analyzeWellness(
                        1L,
                        new AiWellnessRequest()
                )
        )
                .isInstanceOf(
                        ServiceUnavailableException.class
                );
    }

    /**
     * Empty response from n8n should become
     * ServiceUnavailableException.
     */
    @Test
    void translatesEmptyResponseIntoServiceUnavailable() {

        when(
                requestBodyUriSpec.exchange(any())
        ).thenReturn(null);

        assertThatThrownBy(
                () -> service.analyzeWellness(
                        1L,
                        new AiWellnessRequest()
                )
        )
                .isInstanceOf(
                        ServiceUnavailableException.class
                );
    }
}