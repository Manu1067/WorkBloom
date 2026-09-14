package com.workbloom.impact.service;

import java.util.List;

import com.workbloom.impact.dto.RegistrationRequest;
import com.workbloom.impact.dto.VolunteerEventRequest;
import com.workbloom.impact.dto.VolunteerResponse;

public interface ImpactService {

    VolunteerEventRequest createEvent(
            VolunteerEventRequest request
    );

    List<VolunteerEventRequest> getActiveEvents();

    VolunteerResponse registerForEvent(
            Long employeeId,
            RegistrationRequest request
    );

    List<VolunteerResponse> getEmployeeRegistrations(
            Long employeeId
    );

    VolunteerResponse cancelRegistration(
            Long employeeId,
            Long registrationId
    );
}