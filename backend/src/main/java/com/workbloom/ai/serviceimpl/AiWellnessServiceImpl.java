package com.workbloom.ai.serviceimpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.workbloom.ai.dto.AiWellnessRequest;
import com.workbloom.ai.dto.AiWellnessResponse;
import com.workbloom.ai.service.AiWellnessService;
import com.workbloom.wellness.entity.Moodlog;
import com.workbloom.wellness.repository.MoodLogRepository;

@Service
public class AiWellnessServiceImpl implements AiWellnessService {

    private final RestClient restClient;
    private final String n8nWebhookUrl;
    private final MoodLogRepository moodLogRepository;

    public AiWellnessServiceImpl(
            RestClient.Builder restClientBuilder,
            @Value("${n8n.wellness.webhook-url}") String n8nWebhookUrl,
            MoodLogRepository moodLogRepository) {

        this.restClient = restClientBuilder.build();
        this.n8nWebhookUrl = n8nWebhookUrl;
        this.moodLogRepository = moodLogRepository;
    }

    // =========================================================
    // ANALYZE WELLNESS USING AI
    // =========================================================

    @Override
    public AiWellnessResponse analyzeWellness(
            Long employeeId,
            AiWellnessRequest request) {

        System.out.println("=================================");
        System.out.println("1. SPRING REQUEST RECEIVED");
        System.out.println("Employee ID: " + employeeId);
        System.out.println("=================================");

        request.setEmployeeId(employeeId);

        // =====================================================
        // GET LATEST MOOD FROM DATABASE
        // =====================================================

        List<Moodlog> moods =
                moodLogRepository
                        .findByEmployee_IdOrderByRecordedAtDesc(employeeId);

        if (!moods.isEmpty()) {

            Moodlog latestMood = moods.get(0);

            request.setMood(
                    latestMood.getMood()
            );

            System.out.println(
                    "Latest Mood: " + latestMood.getMood()
            );
        } else {

            System.out.println(
                    "No mood history found for employee."
            );
        }

        // =====================================================
        // CALL N8N
        // =====================================================

        System.out.println("2. CALLING N8N...");
        System.out.println("URL: " + n8nWebhookUrl);

        AiWellnessResponse response =
                restClient.post()
                        .uri(n8nWebhookUrl)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(request)
                        .retrieve()
                        .body(AiWellnessResponse.class);

        System.out.println("3. RESPONSE RECEIVED FROM N8N");

        if (response == null) {
            throw new RuntimeException(
                    "No response received from n8n"
            );
        }

        System.out.println(
                "4. WELLNESS SCORE: "
                + response.getWellnessScore()
        );

        System.out.println(
                "5. RISK LEVEL: "
                + response.getRiskLevel()
        );

        return response;
    }
}