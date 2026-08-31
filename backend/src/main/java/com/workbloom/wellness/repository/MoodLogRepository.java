package com.workbloom.wellness.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.wellness.entity.Moodlog;

@Repository
public interface MoodLogRepository
        extends JpaRepository<Moodlog, Long> {

    List<Moodlog> findByEmployee_IdOrderByRecordedAtDesc(
            Long employeeId
    );
}