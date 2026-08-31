package com.workbloom.travel.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.travel.dto.TravelRecommendationResponse;
import com.workbloom.travel.entity.TravelPreference;
import com.workbloom.travel.repository.TravelPreferenceRepository;
import com.workbloom.travel.service.TravelRecommendationService;
import com.workbloom.wellness.entity.Moodlog;
import com.workbloom.wellness.entity.WellnessLog;
import com.workbloom.wellness.repository.MoodLogRepository;
import com.workbloom.wellness.repository.WellnessLogRepository;

@Service
@Transactional(readOnly = true)
public class TravelRecommendationServiceImpl
        implements TravelRecommendationService {

    private final MoodLogRepository moodLogRepository;
    private final WellnessLogRepository wellnessLogRepository;
    private final TravelPreferenceRepository travelPreferenceRepository;

    public TravelRecommendationServiceImpl(
            MoodLogRepository moodLogRepository,
            WellnessLogRepository wellnessLogRepository,
            TravelPreferenceRepository travelPreferenceRepository) {

        this.moodLogRepository = moodLogRepository;
        this.wellnessLogRepository = wellnessLogRepository;
        this.travelPreferenceRepository = travelPreferenceRepository;
    }

    @Override
    public TravelRecommendationResponse recommend(Long employeeId) {

        List<Moodlog> moods =
                moodLogRepository
                        .findByEmployee_IdOrderByRecordedAtDesc(employeeId);

        Moodlog latestMood =
                moods.isEmpty() ? null : moods.get(0);

        List<WellnessLog> wellnessLogs =
                wellnessLogRepository
                        .findByEmployee_IdOrderByRecordedAtDesc(employeeId);

        WellnessLog latestWellness =
                wellnessLogs.isEmpty() ? null : wellnessLogs.get(0);

        TravelPreference preferences =
                travelPreferenceRepository
                        .findByEmployee_Id(employeeId)
                        .orElse(null);

        String mood = latestMood != null
                ? latestMood.getMood()
                : "NEUTRAL";

        int stress = latestWellness != null
                ? latestWellness.getStressLevel()
                : 5;

        int energy = latestWellness != null
                ? latestWellness.getEnergyLevel()
                : 5;

        String environment = preferences != null
                ? preferences.getEnvironment()
                : "ANY";

        String tripStyle = preferences != null
                ? preferences.getTripStyle()
                : "ANY";

        String budget = preferences != null
                ? preferences.getBudget()
                : "MODERATE";

        mood = normalize(mood, "NEUTRAL");
        environment = normalize(environment, "ANY");
        tripStyle = normalize(tripStyle, "ANY");
        budget = normalize(budget, "MODERATE");

        if (stress >= 7
                && environment.equals("MOUNTAINS")
                && tripStyle.equals("RELAXING")) {

            return new TravelRecommendationResponse(
                    "Munnar",
                    "A peaceful hill destination surrounded by tea plantations, forests and scenic landscapes.",
                    List.of(
                            "Tea plantation visit",
                            "Nature walk",
                            "Waterfall visit",
                            "Relaxing sightseeing"
                    ),
                    "Your stress level is high and you prefer mountains and a relaxing trip, so Munnar is a suitable choice."
            );
        }

        if (stress >= 7
                && environment.equals("BEACH")
                && tripStyle.equals("RELAXING")) {

            return new TravelRecommendationResponse(
                    "Pondicherry",
                    "A peaceful coastal destination with beaches, cafes and a relaxed atmosphere.",
                    List.of(
                            "Beach walk",
                            "Cafe hopping",
                            "Sunset viewing",
                            "Heritage sightseeing"
                    ),
                    "Your stress level is high and you prefer a relaxing beach environment, so Pondicherry is recommended."
            );
        }

        if (stress >= 7 && environment.equals("NATURE")) {

            return new TravelRecommendationResponse(
                    "Coorg",
                    "A refreshing nature destination known for forests, coffee plantations and waterfalls.",
                    List.of(
                            "Coffee plantation visit",
                            "Nature walk",
                            "Waterfall visit",
                            "Scenic sightseeing"
                    ),
                    "Your stress level is high, so a peaceful nature-focused destination may help you relax."
            );
        }

        if (energy >= 8
                && environment.equals("MOUNTAINS")
                && tripStyle.equals("ADVENTURE")) {

            return new TravelRecommendationResponse(
                    "Manali",
                    "A mountain destination offering adventure activities and beautiful Himalayan landscapes.",
                    List.of(
                            "Trekking",
                            "Mountain sightseeing",
                            "Adventure activities",
                            "River rafting"
                    ),
                    "Your energy level is high and you prefer mountain adventures, making Manali a strong match."
            );
        }

        if (energy >= 8
                && environment.equals("BEACH")
                && tripStyle.equals("ADVENTURE")) {

            return new TravelRecommendationResponse(
                    "Goa",
                    "A lively coastal destination with beaches, water sports and outdoor activities.",
                    List.of(
                            "Water sports",
                            "Beach activities",
                            "Sunset sightseeing",
                            "Local food exploration"
                    ),
                    "Your energy is high and you prefer beach-based adventure activities, so Goa is recommended."
            );
        }

        if (mood.equals("HAPPY")
                && environment.equals("CITY")
                && tripStyle.equals("SOCIAL")) {

            return new TravelRecommendationResponse(
                    "Bangalore",
                    "A vibrant city offering food, entertainment, parks and social experiences.",
                    List.of(
                            "Food exploration",
                            "Cafe hopping",
                            "City sightseeing",
                            "Entertainment activities"
                    ),
                    "Your positive mood and preference for social city experiences make Bangalore a good match."
            );
        }

        if (mood.equals("HAPPY") && energy >= 6) {

            return new TravelRecommendationResponse(
                    "Bangalore",
                    "A vibrant destination offering food, entertainment, parks and nearby experiences.",
                    List.of(
                            "Food exploration",
                            "Park visits",
                            "City sightseeing",
                            "Weekend activities"
                    ),
                    "Your positive mood and good energy make a lively destination suitable for you."
            );
        }

        if ((mood.equals("SAD") || mood.equals("SADNESS"))
                && tripStyle.equals("RELAXING")) {

            return new TravelRecommendationResponse(
                    "Pondicherry",
                    "A peaceful coastal destination with relaxing streets, beaches and cafes.",
                    List.of(
                            "Beach walk",
                            "Cafe hopping",
                            "Sunset viewing",
                            "Heritage sightseeing"
                    ),
                    "Your recent mood suggests you may benefit from a peaceful environment and relaxing activities."
            );
        }

        if (budget.equals("BUDGET")
                && environment.equals("MOUNTAINS")) {

            return new TravelRecommendationResponse(
                    "Ooty",
                    "A cool hill destination suitable for an affordable and relaxing getaway.",
                    List.of(
                            "Hill sightseeing",
                            "Nature walks",
                            "Lake visit",
                            "Local food exploration"
                    ),
                    "You prefer a budget-friendly mountain trip, so Ooty is a suitable option."
            );
        }

        if (budget.equals("PREMIUM")
                && environment.equals("BEACH")) {

            return new TravelRecommendationResponse(
                    "Goa",
                    "A popular coastal destination with premium resorts, beaches and a wide range of experiences.",
                    List.of(
                            "Resort stay",
                            "Beach activities",
                            "Fine dining",
                            "Sunset experience"
                    ),
                    "Your preference for a premium beach experience makes Goa a good match."
            );
        }

        return new TravelRecommendationResponse(
                "Ooty",
                "A cool and peaceful hill destination suitable for a relaxing getaway.",
                List.of(
                        "Hill sightseeing",
                        "Nature walks",
                        "Lake visit",
                        "Local food exploration"
                ),
                "Your current mood, wellness indicators and travel preferences suggest a balanced and relaxing trip."
        );
    }

    private String normalize(String value, String defaultValue) {
        return value == null || value.isBlank()
                ? defaultValue
                : value.trim().toUpperCase();
    }
}