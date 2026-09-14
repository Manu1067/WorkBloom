package com.workbloom.event.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.event.entity.EventRegistration;
import com.workbloom.event.entity.EventRegistrationStatus;

@Repository
public interface EventRegistrationRepository
        extends JpaRepository<EventRegistration, Long> {

    Optional<EventRegistration> findByEvent_IdAndEmployee_Id(
            Long eventId,
            Long employeeId
    );

    List<EventRegistration> findByEvent_IdAndStatusOrderByRegisteredAtAsc(
            Long eventId,
            EventRegistrationStatus status
    );

    List<EventRegistration>
    findByEmployee_IdAndStatusOrderByRegisteredAtDesc(
            Long employeeId,
            EventRegistrationStatus status
    );

    long countByEvent_IdAndStatus(
            Long eventId,
            EventRegistrationStatus status
    );

    boolean existsByEvent_IdAndEmployee_IdAndStatus(
            Long eventId,
            Long employeeId,
            EventRegistrationStatus status
    );
}