package com.workbloom.travel.entity;

import java.util.ArrayList;
import java.util.List;

import com.workbloom.common.entity.BaseEntity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "destinations")
public class Destination extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String country;

    private String state;

    private String city;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String bestTimeToVisit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DestinationCategory category;

    @Column(nullable = false)
    private String environment;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "destination_mood_tags",
            joinColumns = @JoinColumn(name = "destination_id"))
    @Column(name = "mood_tag", nullable = false)
    private List<String> moodTags = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "destination_activities",
            joinColumns = @JoinColumn(name = "destination_id"))
    @Column(name = "activity", nullable = false)
    private List<String> activities = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetLevel budgetLevel;

    private String duration;

    private String imageUrl;

    private String mapImageUrl;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "destination", fetch = FetchType.LAZY)
    private List<DestinationImage> images = new ArrayList<>();

    public Destination() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getBestTimeToVisit() {
        return bestTimeToVisit;
    }

    public void setBestTimeToVisit(String bestTimeToVisit) {
        this.bestTimeToVisit = bestTimeToVisit;
    }

    public DestinationCategory getCategory() {
        return category;
    }

    public void setCategory(DestinationCategory category) {
        this.category = category;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public List<String> getMoodTags() {
        return moodTags;
    }

    public void setMoodTags(List<String> moodTags) {
        this.moodTags = moodTags;
    }

    public List<String> getActivities() {
        return activities;
    }

    public void setActivities(List<String> activities) {
        this.activities = activities;
    }

    public BudgetLevel getBudgetLevel() {
        return budgetLevel;
    }

    public void setBudgetLevel(BudgetLevel budgetLevel) {
        this.budgetLevel = budgetLevel;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getMapImageUrl() {
        return mapImageUrl;
    }

    public void setMapImageUrl(String mapImageUrl) {
        this.mapImageUrl = mapImageUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<DestinationImage> getImages() {
        return images;
    }

    public void setImages(List<DestinationImage> images) {
        this.images = images;
    }

    public String getLocationLabel() {
        StringBuilder builder = new StringBuilder();
        if (city != null && !city.isBlank()) {
            builder.append(city);
        }
        if (state != null && !state.isBlank()) {
            if (builder.length() > 0) {
                builder.append(", ");
            }
            builder.append(state);
        }
        if (country != null && !country.isBlank()) {
            if (builder.length() > 0) {
                builder.append(", ");
            }
            builder.append(country);
        }
        return builder.toString();
    }
}
