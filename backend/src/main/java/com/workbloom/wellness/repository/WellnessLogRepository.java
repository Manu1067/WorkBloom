package com.workbloom.wellness.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.wellness.entity.WellnessLog;

@Repository
public interface WellnessLogRepository
        extends JpaRepository<WellnessLog, Long> {

    List<WellnessLog> findByEmployee_Id(Long employeeId);

    List<WellnessLog> findByEmployee_IdOrderByRecordedAtDesc(
            Long employeeId
    );
}