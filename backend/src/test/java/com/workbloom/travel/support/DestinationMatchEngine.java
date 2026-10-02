package com.workbloom.travel.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.workbloom.travel.entity.BudgetLevel;
import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.DestinationCategory;
import com.workbloom.travel.support.DestinationMatchEngine.MatchCriteria;
import com.workbloom.travel.support.DestinationMatchEngine.ScoredDestination;

/**
 * Verifies that recommendations are driven purely by destination data
 * (moodTags/category/environment/activities/budgetLevel) and the given
 * criteria - never a hardcoded destination name.
 */
class DestinationMatchEngineTest {

    private final DestinationMatchEngine engine = new DestinationMatchEngine();

    private Destination destination(
            long id,
            String name,
            DestinationCategory category,
            String environment,
            List<String> moodTags,
            List<String> activities,
            BudgetLevel budgetLevel) {

        Destination destination = new Destination();
        destination.setId(id);
        destination.setName(name);
        destination.setDescription(name + " description");
        destination.setCountry("India");
        destination.setLatitude(10.0);
        destination.setLongitude(76.0);
        destination.setCategory(category);
        destination.setEnvironment(environment);
        destination.setMoodTags(moodTags);
        destination.setActivities(activities);
        destination.setBudgetLevel(budgetLevel);
        destination.setActive(true);
        return destination;
    }

    @Test
    void highStressPreferringMountainsAndRelaxingRanksMountainRelaxationDestinationFirst() {

        Destination hillRetreat = destination(
                1L, "Hill Retreat", DestinationCategory.RELAXATION, "MOUNTAINS",
                List.of("PEACEFUL", "CALM"), List.of("NATURE WALK"), BudgetLevel.MODERATE);

        Destination beachParty = destination(
                2L, "Beach Party Town", DestinationCategory.ADVENTURE, "BEACH",
                List.of("ENERGIZED"), List.of("WATER SPORTS"), BudgetLevel.PREMIUM);

        MatchCriteria criteria = new MatchCriteria()
                .setEnvironment("MOUNTAINS")
                .setTripStyle("RELAXING")
                .setStressLevel(8);

        List<ScoredDestination> ranked = engine.rank(List.of(beachParty, hillRetreat), criteria);

        assertThat(ranked.get(0).getDestination().getName()).isEqualTo("Hill Retreat");
        assertThat(ranked.get(0).getScore()).isGreaterThan(ranked.get(1).getScore());
    }

    @Test
    void highEnergyPreferringAdventureRanksAdventureDestinationFirst() {

        Destination hillRetreat = destination(
                1L, "Hill Retreat", DestinationCategory.RELAXATION, "MOUNTAINS",
                List.of("PEACEFUL"), List.of("NATURE WALK"), BudgetLevel.MODERATE);

        Destination adventureCamp = destination(
                2L, "Adventure Camp", DestinationCategory.ADVENTURE, "MOUNTAINS",
                List.of("ENERGIZED"), List.of("TREKKING", "RIVER RAFTING"), BudgetLevel.MODERATE);

        MatchCriteria criteria = new MatchCriteria()
                .setEnvironment("MOUNTAINS")
                .setTripStyle("ADVENTURE")
                .setEnergyLevel(9)
                .addDesiredActivity("TREKKING");

        List<ScoredDestination> ranked = engine.rank(List.of(hillRetreat, adventureCamp), criteria);

        assertThat(ranked.get(0).getDestination().getName()).isEqualTo("Adventure Camp");
    }

    @Test
    void budgetMatchContributesToScore() {

        Destination budgetFriendly = destination(
                1L, "Budget Hills", DestinationCategory.MOUNTAINS, "MOUNTAINS",
                List.of("PEACEFUL"), List.of("SIGHTSEEING"), BudgetLevel.BUDGET);

        Destination premiumHills = destination(
                2L, "Premium Hills", DestinationCategory.MOUNTAINS, "MOUNTAINS",
                List.of("PEACEFUL"), List.of("SIGHTSEEING"), BudgetLevel.PREMIUM);

        MatchCriteria criteria = new MatchCriteria().setBudgetLevel("BUDGET");

        List<ScoredDestination> ranked = engine.rank(List.of(premiumHills, budgetFriendly), criteria);

        assertThat(ranked.get(0).getDestination().getName()).isEqualTo("Budget Hills");
    }

    @Test
    void noCriteriaStillReturnsEveryDestinationWithZeroOrLowScore() {

        Destination destination = destination(
                1L, "Anywhere", DestinationCategory.CITY, "CITY",
                List.of("HAPPY"), List.of("FOOD"), BudgetLevel.MODERATE);

        List<ScoredDestination> ranked = engine.rank(List.of(destination), new MatchCriteria());

        assertThat(ranked).hasSize(1);
        assertThat(ranked.get(0).getScore()).isEqualTo(0);
        assertThat(ranked.get(0).getReason()).isNotBlank();
    }

    @Test
    void scoreNeverExceedsOneHundred() {

        Destination perfectMatch = destination(
                1L, "Perfect Match", DestinationCategory.RELAXATION, "MOUNTAINS",
                List.of("PEACEFUL"), List.of("SPA"), BudgetLevel.BUDGET);

        MatchCriteria criteria = new MatchCriteria()
                .setMood("PEACEFUL")
                .setEnvironment("MOUNTAINS")
                .setTripStyle("RELAXING")
                .setBudgetLevel("BUDGET")
                .addDesiredActivity("SPA")
                .setStressLevel(9)
                .setEnergyLevel(9);

        List<ScoredDestination> ranked = engine.rank(List.of(perfectMatch), criteria);

        assertThat(ranked.get(0).getScore()).isLessThanOrEqualTo(100);
    }
}
