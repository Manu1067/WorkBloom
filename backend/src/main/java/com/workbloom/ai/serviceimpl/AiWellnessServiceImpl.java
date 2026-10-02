package com.workbloom.ai.serviceimpl;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import tools.jackson.databind.ObjectMapper;

import com.workbloom.ai.dto.AiWellnessRequest;
import com.workbloom.ai.dto.AiWellnessResponse;
import com.workbloom.ai.service.AiWellnessService;
import com.workbloom.exception.ServiceUnavailableException;
import com.workbloom.wellness.entity.Moodlog;
import com.workbloom.wellness.repository.MoodLogRepository;

@Service
public class AiWellnessServiceImpl implements AiWellnessService {

    private static final Logger log =
            LoggerFactory.getLogger(AiWellnessServiceImpl.class);

    private final RestClient restClient;
    private final String n8nWebhookUrl;
    private final MoodLogRepository moodLogRepository;
    private final ObjectMapper objectMapper;

    public AiWellnessServiceImpl(
            RestClient.Builder restClientBuilder,
            @Value("${n8n.wellness.webhook-url}") String n8nWebhookUrl,
            MoodLogRepository moodLogRepository,
            ObjectMapper objectMapper) {

        this.restClient = restClientBuilder.build();
        this.n8nWebhookUrl = n8nWebhookUrl;
        this.moodLogRepository = moodLogRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public AiWellnessResponse analyzeWellness(
            Long employeeId,
            AiWellnessRequest request) {

        log.debug(
                "AI wellness analysis requested for employeeId={}",
                employeeId
        );

        /*
         * Always use the authenticated employee ID.
         */
        request.setEmployeeId(employeeId);

        /*
         * Get the latest mood recorded by this employee.
         */
        List<Moodlog> moods =
                moodLogRepository
                        .findByEmployee_IdOrderByRecordedAtDesc(employeeId);

        if (!moods.isEmpty()) {

            Moodlog latestMood = moods.get(0);

            request.setMood(latestMood.getMood());

            log.debug(
                    "Using latest mood '{}' for employeeId={}",
                    latestMood.getMood(),
                    employeeId
            );

        } else {

            log.debug(
                    "No mood history found for employeeId={}",
                    employeeId
            );
        }

        log.info(
                "Calling n8n wellness webhook at {} for employeeId={}",
                n8nWebhookUrl,
                employeeId
        );

        try {

            /*
             * IMPORTANT:
             *
             * n8n is returning application/octet-stream to the Java
             * RestClient even though the actual body is JSON.
             *
             * Therefore we deliberately use exchange() and read the
             * response body directly as bytes.
             *
             * This avoids Spring's normal HttpMessageConverter trying
             * to deserialize application/octet-stream.
             */
            String rawResponse =
                    restClient.post()
                            .uri(n8nWebhookUrl)
                            .contentType(MediaType.APPLICATION_JSON)
                            .accept(MediaType.APPLICATION_JSON)
                            .body(request)
                            .exchange(
                                    (clientRequest, clientResponse) -> {

                                        if (clientResponse.getBody() == null) {
                                            return null;
                                        }

                                        return new String(
                                                clientResponse
                                                        .getBody()
                                                        .readAllBytes(),
                                                StandardCharsets.UTF_8
                                        );
                                    }
                            );

            log.info(
                    "Raw n8n wellness response for employeeId={}: {}",
                    employeeId,
                    rawResponse
            );

            /*
             * Make sure n8n actually returned something.
             */
            if (rawResponse == null || rawResponse.isBlank()) {

                log.error(
                        "n8n wellness webhook returned an empty response for employeeId={}",
                        employeeId
                );

                throw new ServiceUnavailableException(
                        "The AI wellness service returned an empty response."
                );
            }

            /*
             * Convert the raw JSON returned by n8n into our DTO.
             *
             * WorkBloom uses Jackson 3 through Spring Boot 4.1,
             * hence tools.jackson.databind.ObjectMapper.
             */
            AiWellnessResponse response =
                    objectMapper.readValue(
                            rawResponse,
                            AiWellnessResponse.class
                    );

            if (response == null) {

                log.error(
                        "n8n wellness response could not be converted for employeeId={}",
                        employeeId
                );

                throw new ServiceUnavailableException(
                        "The AI wellness service returned an invalid response."
                );
            }

            log.info(
                    "AI wellness analysis complete for employeeId={}: score={}, riskLevel={}",
                    employeeId,
                    response.getWellnessScore(),
                    response.getRiskLevel()
            );

            return response;

        } catch (ResourceAccessException ex) {

            /*
             * Connection refused / timeout / n8n unavailable.
             */
            log.error(
                    "n8n wellness webhook unreachable or timed out for employeeId={}: {}",
                    employeeId,
                    ex.getMessage(),
                    ex
            );

            throw new ServiceUnavailableException(
                    "The AI wellness service (n8n) is currently unreachable. Please try again shortly.",
                    ex
            );

        } catch (RestClientResponseException ex) {

            /*
             * n8n returned an HTTP error such as 400/404/500.
             */
            log.error(
                    "n8n wellness webhook returned HTTP {} for employeeId={}: {}",
                    ex.getStatusCode().value(),
                    employeeId,
                    ex.getResponseBodyAsString(),
                    ex
            );

            throw new ServiceUnavailableException(
                    "The AI wellness service returned an error (HTTP "
                            + ex.getStatusCode().value()
                            + "). Please try again shortly.",
                    ex
            );

        } catch (RestClientException ex) {

            /*
             * Other RestClient failures.
             */
            log.error(
                    "n8n wellness webhook call failed for employeeId={}: {}",
                    employeeId,
                    ex.getMessage(),
                    ex
            );

            throw new ServiceUnavailableException(
                    "The AI wellness service returned an unreadable response. Please try again shortly.",
                    ex
            );

        } catch (ServiceUnavailableException ex) {

            /*
             * Do not wrap our own ServiceUnavailableException again.
             */
            throw ex;

        } catch (Exception ex) {

            /*
             * JSON parsing or any unexpected failure.
             */
            log.error(
                    "Failed to process n8n wellness response for employeeId={}: {}",
                    employeeId,
                    ex.getMessage(),
                    ex
            );

            throw new ServiceUnavailableException(
                    "The AI wellness service returned an invalid response. Please try again shortly.",
                    ex
            );
        }
    }
}