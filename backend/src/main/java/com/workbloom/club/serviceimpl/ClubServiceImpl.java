package com.workbloom.club.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.club.dto.ClubMemberResponse;
import com.workbloom.club.dto.ClubRequest;
import com.workbloom.club.dto.ClubResponse;
import com.workbloom.club.entity.Club;
import com.workbloom.club.entity.ClubMemberRole;
import com.workbloom.club.entity.ClubMembership;
import com.workbloom.club.entity.ClubMembershipStatus;
import com.workbloom.club.entity.ClubStatus;
import com.workbloom.club.repository.ClubMembershipRepository;
import com.workbloom.club.repository.ClubRepository;
import com.workbloom.club.service.ClubService;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;

@Service
@Transactional
public class ClubServiceImpl implements ClubService {

    private final ClubRepository clubRepository;
    private final ClubMembershipRepository membershipRepository;
    private final EmployeeRepository employeeRepository;

    public ClubServiceImpl(
            ClubRepository clubRepository,
            ClubMembershipRepository membershipRepository,
            EmployeeRepository employeeRepository) {

        this.clubRepository = clubRepository;
        this.membershipRepository = membershipRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public ClubResponse createClub(
            Long creatorId,
            ClubRequest request) {

        Employee creator = findEmployee(creatorId);
        validateRequest(request);

        Club club = new Club();
        club.setCreator(creator);
        applyRequest(club, request);
        club.setStatus(ClubStatus.ACTIVE);

        Club savedClub = clubRepository.save(club);
        addMembership(
                savedClub,
                creator,
                ClubMemberRole.ADMIN
        );

        return toResponse(savedClub);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubResponse> discoverClubs() {

        return clubRepository
                .findByStatusOrderByNameAsc(ClubStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClubResponse getClub(Long clubId) {
        return toResponse(findClub(clubId));
    }

    @Override
    public ClubResponse updateClub(
            Long clubId,
            Long creatorId,
            ClubRequest request) {

        Club club = findClub(clubId);
        verifyCreator(club, creatorId);

        if (club.getStatus() == ClubStatus.ARCHIVED) {
            throw new RuntimeException(
                    "Archived clubs cannot be updated");
        }

        validateRequest(request);
        applyRequest(club, request);
        return toResponse(clubRepository.save(club));
    }

    @Override
    public ClubResponse archiveClub(
            Long clubId,
            Long creatorId) {

        Club club = findClub(clubId);
        verifyCreator(club, creatorId);
        club.setStatus(ClubStatus.ARCHIVED);
        return toResponse(clubRepository.save(club));
    }

    @Override
    public ClubMemberResponse joinClub(
            Long clubId,
            Long employeeId) {

        Club club = findClub(clubId);
        Employee employee = findEmployee(employeeId);

        if (club.getStatus() != ClubStatus.ACTIVE) {
            throw new RuntimeException(
                    "Archived clubs cannot accept members");
        }

        ClubMembership membership =
                membershipRepository
                        .findByClub_IdAndEmployee_Id(
                                clubId,
                                employeeId
                        )
                        .orElseGet(ClubMembership::new);

        if (membership.getStatus() == ClubMembershipStatus.ACTIVE) {
            throw new RuntimeException(
                    "Employee is already a club member");
        }

        membership.setClub(club);
        membership.setEmployee(employee);
        membership.setStatus(ClubMembershipStatus.ACTIVE);
        membership.setRole(ClubMemberRole.MEMBER);
        membership.setJoinedAt(LocalDateTime.now());
        membership.setLeftAt(null);

        return ClubMemberResponse.fromEntity(
                membershipRepository.save(membership)
        );
    }

    @Override
    public void leaveClub(
            Long clubId,
            Long employeeId) {

        findClub(clubId);
        ClubMembership membership =
                membershipRepository
                        .findByClub_IdAndEmployee_Id(
                                clubId,
                                employeeId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Club membership not found"));

        if (membership.getStatus() != ClubMembershipStatus.ACTIVE) {
            throw new RuntimeException(
                    "Employee is not an active club member");
        }

        membership.setStatus(ClubMembershipStatus.LEFT);
        membership.setLeftAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubMemberResponse> getMembers(Long clubId) {

        findClub(clubId);

        return membershipRepository
                .findByClub_IdAndStatusOrderByJoinedAtAsc(
                        clubId,
                        ClubMembershipStatus.ACTIVE
                )
                .stream()
                .map(ClubMemberResponse::fromEntity)
                .toList();
    }

    @Override
    public void removeMember(
            Long clubId,
            Long employeeId,
            Long creatorId) {

        Club club = findClub(clubId);
        verifyCreator(club, creatorId);

        ClubMembership membership =
                membershipRepository
                        .findByClub_IdAndEmployee_Id(
                                clubId,
                                employeeId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Club membership not found"));

        if (membership.getStatus() != ClubMembershipStatus.ACTIVE) {
            throw new RuntimeException(
                    "Employee is not an active club member");
        }

        if (membership.getRole() == ClubMemberRole.ADMIN) {
            throw new RuntimeException(
                    "Club administrators cannot be removed");
        }

        membership.setStatus(ClubMembershipStatus.LEFT);
        membership.setLeftAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    private void addMembership(
            Club club,
            Employee employee,
            ClubMemberRole role) {

        ClubMembership membership = new ClubMembership();
        membership.setClub(club);
        membership.setEmployee(employee);
        membership.setRole(role);
        membership.setStatus(ClubMembershipStatus.ACTIVE);
        membership.setJoinedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    private Club findClub(Long clubId) {
        return clubRepository.findById(clubId)
                .orElseThrow(() ->
                        new RuntimeException("Club not found"));
    }

    private Employee findEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));
    }

    private ClubResponse toResponse(Club club) {
        return ClubResponse.fromEntity(
                club,
                membershipRepository.countByClub_IdAndStatus(
                        club.getId(),
                        ClubMembershipStatus.ACTIVE
                )
        );
    }

    private void verifyCreator(
            Club club,
            Long creatorId) {

        if (!club.getCreator().getId().equals(creatorId)) {
            throw new RuntimeException(
                    "Only the club creator can manage this club");
        }
    }

    private void validateRequest(ClubRequest request) {
        if (request == null || request.getName() == null
                || request.getName().isBlank()) {
            throw new RuntimeException("Club name is required");
        }
    }

    private void applyRequest(
            Club club,
            ClubRequest request) {

        club.setName(request.getName().trim());
        club.setDescription(request.getDescription());
        club.setCategory(request.getCategory());
        club.setImageUrl(request.getImageUrl());
    }
}