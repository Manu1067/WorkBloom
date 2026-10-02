package com.workbloom.travel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.DestinationCategory;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByActiveTrueOrderByNameAsc();

    List<Destination> findByActiveTrueAndCategoryOrderByNameAsc(
            DestinationCategory category);

    Optional<Destination> findByNameIgnoreCase(String name);

    long countByActiveTrue();
}
