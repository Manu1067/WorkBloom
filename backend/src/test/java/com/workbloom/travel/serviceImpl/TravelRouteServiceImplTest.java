package com.workbloom.travel.serviceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ResourceNotFoundException;
import com.workbloom.travel.dto.TravelRouteResponse;
import com.workbloom.travel.entity.Destination;
import com.workbloom.travel.repository.DestinationRepository;

@ExtendWith(MockitoExtension.class)
class TravelRouteServiceImplTest {

    @Mock
    private DestinationRepository destinationRepository;

    private TravelRouteServiceImpl travelRouteService;

    @BeforeEach
    void setUp() {
        travelRouteService = new TravelRouteServiceImpl(destinationRepository);
    }

    private Destination activeDestination(long id, String name, double lat, double lon) {
        Destination destination = new Destination();
        destination.setId(id);
        destination.setName(name);
        destination.setCountry("India");
        destination.setLatitude(lat);
        destination.setLongitude(lon);
        destination.setActive(true);
        return destination;
    }

    @Test
    void requiresAtLeastTwoDestinations() {
        assertThatThrownBy(() -> travelRouteService.buildRoute(List.of(1L)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void rejectsUnknownDestinationId() {
        when(destinationRepository.findById(99L)).thenReturn(Optional.empty());
        when(destinationRepository.findById(1L))
                .thenReturn(Optional.of(activeDestination(1L, "A", 10.0, 76.0)));

        assertThatThrownBy(() -> travelRouteService.buildRoute(List.of(1L, 99L)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rejectsInactiveDestination() {
        Destination inactive = activeDestination(2L, "Inactive Place", 11.0, 77.0);
        inactive.setActive(false);

        when(destinationRepository.findById(1L))
                .thenReturn(Optional.of(activeDestination(1L, "A", 10.0, 76.0)));
        when(destinationRepository.findById(2L)).thenReturn(Optional.of(inactive));

        assertThatThrownBy(() -> travelRouteService.buildRoute(List.of(1L, 2L)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void ordersRouteByNearestNeighborAndComputesHaversineDistance() {
        // Bengaluru (12.9716, 77.5946), Chennai (13.0827, 80.2707), Mysore (12.2958, 76.6394)
        // Starting from Bengaluru, the nearest unvisited stop should be Mysore before Chennai.
        Destination bengaluru = activeDestination(1L, "Bengaluru", 12.9716, 77.5946);
        Destination chennai = activeDestination(2L, "Chennai", 13.0827, 80.2707);
        Destination mysore = activeDestination(3L, "Mysore", 12.2958, 76.6394);

        when(destinationRepository.findById(1L)).thenReturn(Optional.of(bengaluru));
        when(destinationRepository.findById(2L)).thenReturn(Optional.of(chennai));
        when(destinationRepository.findById(3L)).thenReturn(Optional.of(mysore));

        TravelRouteResponse response =
                travelRouteService.buildRoute(List.of(1L, 2L, 3L));

        assertThat(response.getPoints()).hasSize(3);
        assertThat(response.getPoints().get(0).getName()).isEqualTo("Bengaluru");
        assertThat(response.getPoints().get(1).getName()).isEqualTo("Mysore");
        assertThat(response.getPoints().get(2).getName()).isEqualTo("Chennai");
        assertThat(response.getTotalDistanceKm()).isGreaterThan(0);
    }

    @Test
    void totalDistanceIsZeroForTwoIdenticalCoordinates() {
        Destination pointA = activeDestination(1L, "Point A", 10.0, 76.0);
        Destination pointB = activeDestination(2L, "Point B", 10.0, 76.0);

        when(destinationRepository.findById(1L)).thenReturn(Optional.of(pointA));
        when(destinationRepository.findById(2L)).thenReturn(Optional.of(pointB));

        TravelRouteResponse response = travelRouteService.buildRoute(List.of(1L, 2L));

        assertThat(response.getTotalDistanceKm()).isCloseTo(0.0, org.assertj.core.data.Offset.offset(0.001));
    }
}
