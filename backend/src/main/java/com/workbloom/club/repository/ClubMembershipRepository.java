package com.workbloom.club.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.club.entity.ClubMembership;
import com.workbloom.club.entity.ClubMembershipStatus;

@Repository
public interface ClubMembershipRepository
        extends JpaRepository<ClubMembership, Long> {

    Optional<ClubMembership> findByClub_IdAndEmployee_Id(
            Long clubId,
            Long employeeId
    );

    List<ClubMembership> findByClub_IdAndStatusOrderByJoinedAtAsc(
            Long clubId,
            ClubMembershipStatus status
    );

    long countByClub_IdAndStatus(
            Long clubId,
            ClubMembershipStatus status
    );
}