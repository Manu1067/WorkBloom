package com.workbloom.travel.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.travel.dto.DestinationImageResponse;
import com.workbloom.travel.dto.DestinationResponse;
import com.workbloom.travel.dto.DestinationSummaryResponse;
import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.entity.DestinationCategory;
import com.workbloom.travel.repository.DestinationImageRepository;
import com.workbloom.travel.repository.DestinationRepository;
import com.workbloom.travel.service.DestinationService;

@Service
@Transactional(readOnly = true)
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;
    private final DestinationImageRepository destinationImageRepository;

    public DestinationServiceImpl(
            DestinationRepository destinationRepository,
            DestinationImageRepository destinationImageRepository) {

        this.destinationRepository = destinationRepository;
        this.destinationImageRepository = destinationImageRepository;
    }

    @Override
    public List<DestinationSummaryResponse> listDestinations(
            DestinationCategory category) {

        List<Destination> destinations = category == null
                ? destinationRepository.findByActiveTrueOrderByNameAsc()
                : destinationRepository
                        .findByActiveTrueAndCategoryOrderByNameAsc(category);

        return destinations.stream()
                .map(DestinationSummaryResponse::fromEntity)
                .toList();
    }

    @Override
    public DestinationResponse getDestination(Long destinationId) {

        Destination destination = destinationRepository.findById(destinationId)
                .filter(Destination::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Destination not found"));

        List<DestinationImageResponse> images =
                getDestinationImages(destinationId);

        return DestinationResponse.fromEntity(destination, images);
    }

    @Override
    public List<DestinationImageResponse> getDestinationImages(
            Long destinationId) {

        if (!destinationRepository.existsById(destinationId)) {
            throw new ResourceNotFoundException("Destination not found");
        }

        return destinationImageRepository
                .findByDestination_IdOrderByDisplayOrderAsc(destinationId)
                .stream()
                .map(DestinationImageResponse::fromEntity)
                .toList();
    }
}
