package com.workbloom.travel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.travel.dto.TravelRouteResponse;
import com.workbloom.travel.service.TravelRouteService;

/**
 * Multi-destination route optimization.
 *
 * Uses a Nearest Neighbor heuristic over Haversine (great-circle) distance
 * - see {@code docs/ROUTE_ALGORITHM.md} for why that is NOT the same as
 * actual road distance/time.
 */
@RestController
@RequestMapping({
        "/api/travel/routes",
        "/api/wellness/travel/routes"
})
public class TravelRouteController {

    private final TravelRouteService travelRouteService;

    public TravelRouteController(TravelRouteService travelRouteService) {
        this.travelRouteService = travelRouteService;
    }

    @PostMapping("/optimize")
    public ResponseEntity<TravelRouteResponse> optimizeRoute(
            @RequestBody List<Long> destinationIds) {

        return ResponseEntity.ok(travelRouteService.buildRoute(destinationIds));
    }
}
