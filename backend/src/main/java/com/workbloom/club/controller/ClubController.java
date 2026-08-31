package com.workbloom.club.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.club.dto.ClubMemberResponse;
import com.workbloom.club.dto.ClubRequest;
import com.workbloom.club.dto.ClubResponse;
import com.workbloom.club.service.ClubService;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PostMapping
    public ResponseEntity<ClubResponse> createClub(
            @RequestParam Long creatorId,
            @RequestBody ClubRequest request) {

        return ResponseEntity.ok(
                clubService.createClub(creatorId, request)
        );
    }

    @GetMapping
    public ResponseEntity<List<ClubResponse>> discoverClubs() {
        return ResponseEntity.ok(clubService.discoverClubs());
    }

    @GetMapping("/{clubId}")
    public ResponseEntity<ClubResponse> getClub(
            @PathVariable Long clubId) {

        return ResponseEntity.ok(clubService.getClub(clubId));
    }

    @PutMapping("/{clubId}")
    public ResponseEntity<ClubResponse> updateClub(
            @PathVariable Long clubId,
            @RequestParam Long creatorId,
            @RequestBody ClubRequest request) {

        return ResponseEntity.ok(
                clubService.updateClub(
                        clubId,
                        creatorId,
                        request
                )
        );
    }

    @PatchMapping("/{clubId}/archive")
    public ResponseEntity<ClubResponse> archiveClub(
            @PathVariable Long clubId,
            @RequestParam Long creatorId) {

        return ResponseEntity.ok(
                clubService.archiveClub(clubId, creatorId)
        );
    }

    @PostMapping("/{clubId}/members")
    public ResponseEntity<ClubMemberResponse> joinClub(
            @PathVariable Long clubId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                clubService.joinClub(clubId, employeeId)
        );
    }

    @DeleteMapping("/{clubId}/members")
    public ResponseEntity<Void> leaveClub(
            @PathVariable Long clubId,
            @RequestParam Long employeeId) {

        clubService.leaveClub(clubId, employeeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{clubId}/members")
    public ResponseEntity<List<ClubMemberResponse>> getMembers(
            @PathVariable Long clubId) {

        return ResponseEntity.ok(clubService.getMembers(clubId));
    }

    @DeleteMapping("/{clubId}/members/{employeeId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long clubId,
            @PathVariable Long employeeId,
            @RequestParam Long creatorId) {

        clubService.removeMember(
                clubId,
                employeeId,
                creatorId
        );

        return ResponseEntity.noContent().build();
    }
}