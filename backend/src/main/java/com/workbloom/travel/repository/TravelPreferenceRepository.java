package com.workbloom.travel.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.travel.entity.TravelPreference;

@Repository
public interface TravelPreferenceRepository
        extends JpaRepository<TravelPreference, Long> {

    Optional<TravelPreference> findByEmployee_Id(Long employeeId);
}