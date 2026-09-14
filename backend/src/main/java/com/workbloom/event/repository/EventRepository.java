package com.workbloom.event.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.event.entity.Event;
import com.workbloom.event.entity.EventStatus;
import com.workbloom.event.entity.EventType;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event>
    findByStatusAndEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(
            EventStatus status,
            LocalDate eventDate
    );

    List<Event>
    findByStatusAndEventTypeAndEventDateGreaterThanEqualOrderByEventDateAscStartTimeAsc(
            EventStatus status,
            EventType eventType,
            LocalDate eventDate
    );

    List<Event> findByOrganizer_IdOrderByEventDateDescStartTimeDesc(
            Long organizerId
    );
}