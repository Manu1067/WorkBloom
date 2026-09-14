package com.workbloom.club.dto;

import java.time.LocalDateTime;

import com.workbloom.club.entity.Club;
import com.workbloom.club.entity.ClubStatus;

public class ClubResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private String imageUrl;
    private Long creatorId;
    private String creatorName;
    private ClubStatus status;
    private long memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClubResponse() {
    }

    public static ClubResponse fromEntity(
            Club club,
            long memberCount) {

        ClubResponse response = new ClubResponse();
        response.setId(club.getId());
        response.setName(club.getName());
        response.setDescription(club.getDescription());
        response.setCategory(club.getCategory());
        response.setImageUrl(club.getImageUrl());
        response.setCreatorId(club.getCreator().getId());
        response.setCreatorName(
                club.getCreator().getFirstName()
                        + " "
                        + (club.getCreator().getLastName() == null
                                ? ""
                                : club.getCreator().getLastName())
        );
        response.setStatus(club.getStatus());
        response.setMemberCount(memberCount);
        response.setCreatedAt(club.getCreatedAt());
        response.setUpdatedAt(club.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public ClubStatus getStatus() {
        return status;
    }

    public void setStatus(ClubStatus status) {
        this.status = status;
    }

    public long getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(long memberCount) {
        this.memberCount = memberCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}