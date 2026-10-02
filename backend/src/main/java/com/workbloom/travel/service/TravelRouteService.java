package com.workbloom.travel.service;

import java.util.List;

import com.workbloom.travel.dto.TravelRouteResponse;

public interface TravelRouteService {

    TravelRouteResponse buildRoute(List<Long> destinationIds);
}
