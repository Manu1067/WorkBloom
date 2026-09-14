package com.workbloom.wellness.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.wellness.entity.CounsellingAppointment;
import com.workbloom.wellness.entity.CounsellingStatus;

@Repository
public interface CounsellingAppointmentRepository
        extends JpaRepository<CounsellingAppointment, Long> {

    List<CounsellingAppointment> findByEmployeeId(Long employeeId);

    List<CounsellingAppointment> findByStatus(
            CounsellingStatus status
    );

    List<CounsellingAppointment> findByAppointmentDate(
            LocalDate appointmentDate
    );
}