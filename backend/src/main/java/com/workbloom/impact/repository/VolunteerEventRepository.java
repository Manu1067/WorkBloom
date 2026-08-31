package com.workbloom.impact.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.impact.entity.VolunteerEvent;

public interface VolunteerEventRepository
        extends JpaRepository<VolunteerEvent, Long> {

    List<VolunteerEvent> findByActiveTrue();

}