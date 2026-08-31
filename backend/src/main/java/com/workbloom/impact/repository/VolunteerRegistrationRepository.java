package com.workbloom.impact.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.impact.entity.VolunteerRegistration;

public interface VolunteerRegistrationRepository
        extends JpaRepository<VolunteerRegistration, Long> {

    List<VolunteerRegistration> findByEmployee_Id(Long employeeId);

    List<VolunteerRegistration> findByEvent_Id(Long eventId);

    Optional<VolunteerRegistration> findByEmployee_IdAndEvent_Id(
            Long employeeId,
            Long eventId
    );

}