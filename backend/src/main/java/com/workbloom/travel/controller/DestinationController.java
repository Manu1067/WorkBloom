package com.workbloom.travel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.travel.dto.DestinationImageResponse;
import com.workbloom.travel.dto.DestinationResponse;
import com.workbloom.travel.dto.DestinationSummaryResponse;
import com.workbloom.travel.entity.DestinationCategory;
import com.workbloom.travel.service.DestinationService;

/**
 * Exposes the destination catalog (browse / detail / map data / gallery).
 * Every destination returned here includes id, name, latitude and
 * longitude so the frontend can render it on a map, per the Travel
 * module's map-functionality requirement.
 */
@RestController
@RequestMapping({
        "/api/travel/destinations",
        "/api/wellness/travel/destinations"
})
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    @GetMapping
    public ResponseEntity<List<DestinationSummaryResponse>> listDestinations(
            @RequestParam(required = false) DestinationCategory category) {

        return ResponseEntity.ok(destinationService.listDestinations(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationResponse> getDestination(
            @PathVariable Long id) {

        return ResponseEntity.ok(destinationService.getDestination(id));
    }

    @GetMapping("/{id}/images")
    public ResponseEntity<List<DestinationImageResponse>> getDestinationImages(
            @PathVariable Long id) {

        return ResponseEntity.ok(destinationService.getDestinationImages(id));
    }
}
