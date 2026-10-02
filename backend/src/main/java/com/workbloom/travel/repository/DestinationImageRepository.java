package com.workbloom.travel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.travel.entity.DestinationImage;

public interface DestinationImageRepository
        extends JpaRepository<DestinationImage, Long> {

    List<DestinationImage> findByDestination_IdOrderByDisplayOrderAsc(
            Long destinationId);
}
