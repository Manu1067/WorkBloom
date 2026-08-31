package com.workbloom.club.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.club.entity.Club;
import com.workbloom.club.entity.ClubStatus;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByStatusOrderByNameAsc(ClubStatus status);
}