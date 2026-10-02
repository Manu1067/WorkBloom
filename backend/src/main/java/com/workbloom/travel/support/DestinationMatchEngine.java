package com.workbloom.travel.support;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.workbloom.travel.entity.BudgetLevel;
import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.DestinationCategory;

/**
 * Real, database-backed compatibility scoring for Travel recommendations.
 *
 * Replaces the previous hardcoded if/else destination-name chain. Every
 * signal used here comes from either the employee's own wellbeing data
 * (mood, stress, energy), their saved {@code TravelPreference}, or the
 * answers they picked on the Travel Questions screen - never a hardcoded
 * destination name.
 *
 * Scoring is a simple, transparent weighted-match model against fields
 * that already exist on {@link Destination}: moodTags, category,
 * environment, activities, budgetLevel and duration. Each destination
 * gets a 0-100 score; recommendations are the destinations sorted by
 * score, descending.
 */
@Component
public class DestinationMatchEngine {

    // Weights are additive; total is capped at 100 in score().
    private static final int WEIGHT_MOOD = 25;
    private static final int WEIGHT_ENVIRONMENT = 25;
    private static final int WEIGHT_TRIP_STYLE = 20;
    private static final int WEIGHT_BUDGET = 15;
    private static final int WEIGHT_ACTIVITY = 10;
    private static final int WEIGHT_DURATION = 5;
    private static final int WEIGHT_WELLNESS_SIGNAL = 5;

    /**
     * Trip-style values (from TravelPreference.tripStyle or a question
     * option tagged TRIPSTYLE:xxx) map loosely onto destination categories,
     * since the domain model does not have a separate "trip style" field
     * on Destination itself.
     */
    private static final Map<String, List<DestinationCategory>> TRIP_STYLE_TO_CATEGORY = Map.of(
            "RELAXING", List.of(DestinationCategory.RELAXATION, DestinationCategory.SPIRITUAL, DestinationCategory.NATURE),
            "ADVENTURE", List.of(DestinationCategory.ADVENTURE, DestinationCategory.MOUNTAINS),
            "SOCIAL", List.of(DestinationCategory.CITY, DestinationCategory.CULTURAL),
            "CULTURAL", List.of(DestinationCategory.CULTURAL, DestinationCategory.HERITAGE),
            "SPIRITUAL", List.of(DestinationCategory.SPIRITUAL, DestinationCategory.HERITAGE)
    );

    /**
     * All the normalized signals that can feed into a match. Anything left
     * null/empty is simply skipped when scoring (no penalty).
     */
    public static class MatchCriteria {
        private String mood;
        private String environment;
        private String tripStyle;
        private BudgetLevel budgetLevel;
        private List<String> desiredActivities = new ArrayList<>();
        private Integer stressLevel;
        private Integer energyLevel;
        private String duration;

        public String getMood() {
            return mood;
        }

        public MatchCriteria setMood(String mood) {
            this.mood = normalize(mood);
            return this;
        }

        public String getEnvironment() {
            return environment;
        }

        public MatchCriteria setEnvironment(String environment) {
            this.environment = normalize(environment);
            return this;
        }

        public String getTripStyle() {
            return tripStyle;
        }

        public MatchCriteria setTripStyle(String tripStyle) {
            this.tripStyle = normalize(tripStyle);
            return this;
        }

        public BudgetLevel getBudgetLevel() {
            return budgetLevel;
        }

        public MatchCriteria setBudgetLevel(BudgetLevel budgetLevel) {
            this.budgetLevel = budgetLevel;
            return this;
        }

        public MatchCriteria setBudgetLevel(String budgetLevel) {
            if (budgetLevel == null || budgetLevel.isBlank()) {
                this.budgetLevel = null;
                return this;
            }
            try {
                this.budgetLevel = BudgetLevel.valueOf(normalize(budgetLevel));
            } catch (IllegalArgumentException ex) {
                this.budgetLevel = null;
            }
            return this;
        }

        public List<String> getDesiredActivities() {
            return desiredActivities;
        }

        public MatchCriteria addDesiredActivity(String activity) {
            if (activity != null && !activity.isBlank()) {
                this.desiredActivities.add(normalize(activity));
            }
            return this;
        }

        public Integer getStressLevel() {
            return stressLevel;
        }

        public MatchCriteria setStressLevel(Integer stressLevel) {
            this.stressLevel = stressLevel;
            return this;
        }

        public Integer getEnergyLevel() {
            return energyLevel;
        }

        public MatchCriteria setEnergyLevel(Integer energyLevel) {
            this.energyLevel = energyLevel;
            return this;
        }

        public String getDuration() {
            return duration;
        }

        public MatchCriteria setDuration(String duration) {
            this.duration = normalize(duration);
            return this;
        }

        private static String normalize(String value) {
            return value == null || value.isBlank()
                    ? null
                    : value.trim().toUpperCase(Locale.ROOT);
        }
    }

    public static class ScoredDestination {
        private final Destination destination;
        private final int score;
        private final String reason;

        public ScoredDestination(Destination destination, int score, String reason) {
            this.destination = destination;
            this.score = score;
            this.reason = reason;
        }

        public Destination getDestination() {
            return destination;
        }

        public int getScore() {
            return score;
        }

        public String getReason() {
            return reason;
        }
    }

    /**
     * Scores and ranks the given active destinations against the criteria,
     * highest score first. Every destination in {@code candidates} is
     * returned (never filtered out), so the caller can decide how many
     * top matches to keep.
     */
    public List<ScoredDestination> rank(List<Destination> candidates, MatchCriteria criteria) {
        return candidates.stream()
                .map(destination -> score(destination, criteria))
                .sorted(Comparator.comparingInt(ScoredDestination::getScore).reversed())
                .collect(Collectors.toList());
    }

    private ScoredDestination score(Destination destination, MatchCriteria criteria) {
        int total = 0;
        List<String> matchedReasons = new ArrayList<>();

        // ---- Mood tags ----
        if (criteria.getMood() != null && destination.getMoodTags() != null) {
            boolean moodMatch = destination.getMoodTags().stream()
                    .anyMatch(tag -> tag != null && tag.equalsIgnoreCase(criteria.getMood()));
            if (moodMatch) {
                total += WEIGHT_MOOD;
                matchedReasons.add("matches your current mood");
            }
        }

        // ---- Environment ----
        if (criteria.getEnvironment() != null && destination.getEnvironment() != null) {
            if (destination.getEnvironment().equalsIgnoreCase(criteria.getEnvironment())) {
                total += WEIGHT_ENVIRONMENT;
                matchedReasons.add("matches your preferred environment (" + destination.getEnvironment() + ")");
            }
        }

        // ---- Trip style -> category ----
        if (criteria.getTripStyle() != null && destination.getCategory() != null) {
            List<DestinationCategory> mappedCategories =
                    TRIP_STYLE_TO_CATEGORY.getOrDefault(criteria.getTripStyle(), List.of());
            if (mappedCategories.contains(destination.getCategory())) {
                total += WEIGHT_TRIP_STYLE;
                matchedReasons.add("fits a " + criteria.getTripStyle().toLowerCase(Locale.ROOT) + " trip style");
            }
        }

        // ---- Budget ----
        if (criteria.getBudgetLevel() != null && destination.getBudgetLevel() != null) {
            if (destination.getBudgetLevel() == criteria.getBudgetLevel()) {
                total += WEIGHT_BUDGET;
                matchedReasons.add("fits your " + criteria.getBudgetLevel().name().toLowerCase(Locale.ROOT) + " budget");
            }
        }

        // ---- Activities overlap ----
        if (!criteria.getDesiredActivities().isEmpty() && destination.getActivities() != null) {
            boolean activityMatch = destination.getActivities().stream()
                    .anyMatch(activity -> activity != null
                            && criteria.getDesiredActivities().contains(activity.toUpperCase(Locale.ROOT)));
            if (activityMatch) {
                total += WEIGHT_ACTIVITY;
                matchedReasons.add("offers activities you're looking for");
            }
        }

        // ---- Duration ----
        if (criteria.getDuration() != null && destination.getDuration() != null) {
            if (destination.getDuration().equalsIgnoreCase(criteria.getDuration())) {
                total += WEIGHT_DURATION;
                matchedReasons.add("matches your preferred trip length");
            }
        }

        // ---- Wellness signal (stress/energy) bonus on top of the above ----
        if (criteria.getStressLevel() != null && criteria.getStressLevel() >= 7
                && destination.getCategory() != null
                && List.of(DestinationCategory.RELAXATION, DestinationCategory.SPIRITUAL, DestinationCategory.NATURE)
                        .contains(destination.getCategory())) {
            total += WEIGHT_WELLNESS_SIGNAL;
            matchedReasons.add("well-suited for unwinding when stress is high");
        }

        if (criteria.getEnergyLevel() != null && criteria.getEnergyLevel() >= 8
                && destination.getCategory() != null
                && List.of(DestinationCategory.ADVENTURE, DestinationCategory.MOUNTAINS)
                        .contains(destination.getCategory())) {
            total += WEIGHT_WELLNESS_SIGNAL;
            matchedReasons.add("matches your high energy level");
        }

        int cappedScore = Math.min(100, total);

        String reason = matchedReasons.isEmpty()
                ? "A balanced option based on your overall travel profile."
                : "Recommended because it " + String.join(", ", matchedReasons) + ".";

        return new ScoredDestination(destination, cappedScore, reason);
    }
}
