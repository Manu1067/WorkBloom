package com.workbloom.wellness.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.workbloom.wellness.entity.Moodlog;

@Repository
public interface MoodLogRepository
        extends JpaRepository<Moodlog, Long> {

    List<Moodlog> findByEmployee_IdOrderByRecordedAtDesc(
            Long employeeId
    );

    // Added for Analytics (Task 4) - aggregate count grouped by mood value,
    // computed by the database, not fabricated in Java.
    @Query("SELECT m.mood, COUNT(m) FROM Moodlog m GROUP BY m.mood")
    List<Object[]> countGroupedByMood();
}