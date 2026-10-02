package com.workbloom.travel.serviceImpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.travel.dto.TravelRoutePointResponse;
import com.workbloom.travel.dto.TravelRouteResponse;
import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.repository.DestinationRepository;
import com.workbloom.travel.service.TravelRouteService;

@Service
@Transactional(readOnly = true)
public class TravelRouteServiceImpl implements TravelRouteService {

    private final DestinationRepository destinationRepository;

    public TravelRouteServiceImpl(
            DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @Override
    public TravelRouteResponse buildRoute(List<Long> destinationIds) {

        if (destinationIds == null || destinationIds.size() < 2) {
            throw new BadRequestException(
                    "At least two destination IDs are required for a route");
        }

        List<Destination> destinations = new ArrayList<>();

        for (Long destinationId : destinationIds) {

            Destination destination = destinationRepository
                    .findById(destinationId)
                    .filter(Destination::isActive)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Destination not found: " + destinationId));

            destinations.add(destination);
        }

        List<Destination> ordered =
                orderByNearestNeighbor(destinations);

        List<TravelRoutePointResponse> points = new ArrayList<>();

        double totalDistanceKm = 0.0;

        for (int index = 0; index < ordered.size(); index++) {

            Destination destination = ordered.get(index);

            points.add(new TravelRoutePointResponse(
                    destination.getId(),
                    destination.getName(),
                    destination.getLocationLabel(),
                    destination.getLatitude(),
                    destination.getLongitude(),
                    index + 1
            ));

            if (index > 0) {

                Destination previous =
                        ordered.get(index - 1);

                totalDistanceKm += haversineKm(
                        previous.getLatitude(),
                        previous.getLongitude(),
                        destination.getLatitude(),
                        destination.getLongitude()
                );
            }
        }

        return new TravelRouteResponse(
                points,
                totalDistanceKm
        );
    }

    /**
     * Nearest Neighbor heuristic.
     *
     * Starts from the first destination and repeatedly chooses
     * the nearest unvisited destination.
     *
     * This is a heuristic and does not guarantee the globally
     * optimal travelling-salesman route.
     */
    private List<Destination> orderByNearestNeighbor(
            List<Destination> destinations) {

        List<Destination> remaining =
                new ArrayList<>(destinations);

        List<Destination> ordered =
                new ArrayList<>();

        // Start from the first destination
        Destination current =
                remaining.remove(0);

        ordered.add(current);

        while (!remaining.isEmpty()) {

            Destination next = null;

            double shortestDistance =
                    Double.MAX_VALUE;

            // Find the closest unvisited destination
            for (Destination candidate : remaining) {

                double distance = haversineKm(
                        current.getLatitude(),
                        current.getLongitude(),
                        candidate.getLatitude(),
                        candidate.getLongitude()
                );

                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    next = candidate;
                }
            }

            if (next == null) {
                throw new IllegalStateException(
                        "Unable to determine next destination");
            }

            // Move to the selected destination
            remaining.remove(next);

            ordered.add(next);

            current = next;
        }

        return ordered;
    }

    /**
     * Calculates the great-circle distance between two
     * geographical coordinates using the Haversine formula.
     *
     * @return distance in kilometres
     */
    private double haversineKm(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        final double earthRadiusKm = 6371.0;

        double deltaLat =
                Math.toRadians(lat2 - lat1);

        double deltaLon =
                Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(deltaLat / 2)
                        * Math.sin(deltaLat / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(deltaLon / 2)
                        * Math.sin(deltaLon / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return earthRadiusKm * c;
    }
}