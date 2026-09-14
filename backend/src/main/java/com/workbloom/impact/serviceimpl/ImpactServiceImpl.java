package com.workbloom.impact.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;

import com.workbloom.impact.dto.RegistrationRequest;
import com.workbloom.impact.dto.VolunteerEventRequest;
import com.workbloom.impact.dto.VolunteerResponse;

import com.workbloom.impact.entity.RegistrationStatus;
import com.workbloom.impact.entity.VolunteerEvent;
import com.workbloom.impact.entity.VolunteerRegistration;

import com.workbloom.impact.repository.VolunteerEventRepository;
import com.workbloom.impact.repository.VolunteerRegistrationRepository;

import com.workbloom.impact.service.ImpactService;

@Service
@Transactional
public class ImpactServiceImpl implements ImpactService {

    private final VolunteerEventRepository volunteerEventRepository;

    private final VolunteerRegistrationRepository volunteerRegistrationRepository;

    private final EmployeeRepository employeeRepository;

    public ImpactServiceImpl(
            VolunteerEventRepository volunteerEventRepository,
            VolunteerRegistrationRepository volunteerRegistrationRepository,
            EmployeeRepository employeeRepository) {

        this.volunteerEventRepository = volunteerEventRepository;

        this.volunteerRegistrationRepository =
                volunteerRegistrationRepository;

        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // CREATE VOLUNTEER EVENT
    // =========================================================

    @Override
    public VolunteerEventRequest createEvent(
            VolunteerEventRequest request) {

        VolunteerEvent event = new VolunteerEvent();

        event.setTitle(request.getTitle());

        event.setDescription(
                request.getDescription()
        );

        event.setLocation(
                request.getLocation()
        );

        event.setEventDate(
                request.getEventDate()
        );

        event.setMaxVolunteers(
                request.getMaxVolunteers()
        );

        event.setActive(true);

        VolunteerEvent saved =
                volunteerEventRepository.save(event);

        return mapEventToResponse(saved);
    }

    // =========================================================
    // GET ACTIVE VOLUNTEER EVENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerEventRequest> getActiveEvents() {

        return volunteerEventRepository
                .findByActiveTrue()
                .stream()
                .map(this::mapEventToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // REGISTER EMPLOYEE FOR EVENT
    // =========================================================

    @Override
    public VolunteerResponse registerForEvent(
            Long employeeId,
            RegistrationRequest request) {

        // -----------------------------------------------------
        // Find employee
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found with ID: "
                                                + employeeId
                                )
                        );

        // -----------------------------------------------------
        // Find event
        // -----------------------------------------------------

        VolunteerEvent event =
                volunteerEventRepository
                        .findById(request.getEventId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Volunteer event not found with ID: "
                                                + request.getEventId()
                                )
                        );

        // -----------------------------------------------------
        // Check event is active
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(
                event.getActive())) {

            throw new RuntimeException(
                    "This volunteer event is not active"
            );
        }

        // -----------------------------------------------------
        // Check duplicate registration
        // -----------------------------------------------------

        if (volunteerRegistrationRepository
                .findByEmployee_IdAndEvent_Id(
                        employeeId,
                        event.getId()
                )
                .isPresent()) {

            throw new RuntimeException(
                    "Employee is already registered for this event"
            );
        }

        // -----------------------------------------------------
        // Check maximum volunteers
        // -----------------------------------------------------

        if (event.getMaxVolunteers() != null) {

            long registeredCount =
                    volunteerRegistrationRepository
                            .findByEvent_Id(event.getId())
                            .stream()
                            .filter(registration ->
                                    registration.getStatus()
                                            == RegistrationStatus.REGISTERED
                            )
                            .count();

            if (registeredCount
                    >= event.getMaxVolunteers()) {

                throw new RuntimeException(
                        "Volunteer event is already full"
                );
            }
        }

        // -----------------------------------------------------
        // Create registration
        // -----------------------------------------------------

        VolunteerRegistration registration =
                new VolunteerRegistration();

        registration.setEmployee(employee);

        registration.setEvent(event);

        registration.setStatus(
                RegistrationStatus.REGISTERED
        );

        registration.setRegisteredAt(
                LocalDateTime.now()
        );

        VolunteerRegistration saved =
                volunteerRegistrationRepository
                        .save(registration);

        return mapRegistrationToResponse(saved);
    }

    // =========================================================
    // GET EMPLOYEE REGISTRATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerResponse> getEmployeeRegistrations(
            Long employeeId) {

        return volunteerRegistrationRepository
                .findByEmployee_Id(employeeId)
                .stream()
                .map(this::mapRegistrationToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // CANCEL REGISTRATION
    // =========================================================

    @Override
    public VolunteerResponse cancelRegistration(
            Long employeeId,
            Long registrationId) {

        VolunteerRegistration registration =
                volunteerRegistrationRepository
                        .findById(registrationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration not found with ID: "
                                                + registrationId
                                )
                        );

        // -----------------------------------------------------
        // Make sure registration belongs to employee
        // -----------------------------------------------------

        if (!registration
                .getEmployee()
                .getId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "You cannot cancel another employee's registration"
            );
        }

        // -----------------------------------------------------
        // Check already cancelled
        // -----------------------------------------------------

        if (registration.getStatus()
                == RegistrationStatus.CANCELLED) {

            throw new RuntimeException(
                    "Registration is already cancelled"
            );
        }

        // -----------------------------------------------------
        // Cancel registration
        // -----------------------------------------------------

        registration.setStatus(
                RegistrationStatus.CANCELLED
        );

        VolunteerRegistration updated =
                volunteerRegistrationRepository
                        .save(registration);

        return mapRegistrationToResponse(updated);
    }

    // =========================================================
    // MAP EVENT ENTITY → EVENT DTO
    // =========================================================

    private VolunteerEventRequest mapEventToResponse(
            VolunteerEvent event) {

        VolunteerEventRequest response =
                new VolunteerEventRequest();

        response.setId(
                event.getId()
        );

        response.setTitle(
                event.getTitle()
        );

        response.setDescription(
                event.getDescription()
        );

        response.setLocation(
                event.getLocation()
        );

        response.setEventDate(
                event.getEventDate()
        );

        response.setMaxVolunteers(
                event.getMaxVolunteers()
        );

        response.setActive(
                event.getActive()
        );

        return response;
    }

    // =========================================================
    // MAP REGISTRATION ENTITY → RESPONSE DTO
    // =========================================================

    private VolunteerResponse mapRegistrationToResponse(
            VolunteerRegistration registration) {

        VolunteerResponse response =
                new VolunteerResponse();

        // Registration information
        response.setRegistrationId(
                registration.getId()
        );

        // Employee information
        Employee employee =
                registration.getEmployee();

        response.setEmployeeId(
                employee.getId()
        );

        String employeeName =
                employee.getFirstName();

        if (employee.getLastName() != null
                && !employee.getLastName().isBlank()) {

            employeeName +=
                    " " + employee.getLastName();
        }

        response.setEmployeeName(
                employeeName
        );

        // Event information
        VolunteerEvent event =
                registration.getEvent();

        response.setEventId(
                event.getId()
        );

        response.setEventTitle(
                event.getTitle()
        );

        response.setLocation(
                event.getLocation()
        );

        response.setEventDate(
                event.getEventDate()
        );

        // Registration information
        response.setStatus(
                registration
                        .getStatus()
                        .name()
        );

        response.setRegisteredAt(
                registration.getRegisteredAt()
        );

        return response;
    }
}