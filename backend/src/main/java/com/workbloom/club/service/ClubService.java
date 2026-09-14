package com.workbloom.club.service;

import java.util.List;

import com.workbloom.club.dto.ClubMemberResponse;
import com.workbloom.club.dto.ClubRequest;
import com.workbloom.club.dto.ClubResponse;

public interface ClubService {

    ClubResponse createClub(
            Long creatorId,
            ClubRequest request
    );

    List<ClubResponse> discoverClubs();

    ClubResponse getClub(Long clubId);

    ClubResponse updateClub(
            Long clubId,
            Long creatorId,
            ClubRequest request
    );

    ClubResponse archiveClub(
            Long clubId,
            Long creatorId
    );

    ClubMemberResponse joinClub(
            Long clubId,
            Long employeeId
    );

    void leaveClub(
            Long clubId,
            Long employeeId
    );

    List<ClubMemberResponse> getMembers(Long clubId);

    void removeMember(
            Long clubId,
            Long employeeId,
            Long creatorId
    );
}