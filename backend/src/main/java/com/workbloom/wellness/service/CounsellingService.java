package com.workbloom.wellness.service;

import java.util.List;

import com.workbloom.wellness.dto.CounsellingResponse;
import com.workbloom.wellness.dto.CreateCounsellingRequest;
import com.workbloom.wellness.dto.RejectCounsellingRequest;

public interface CounsellingService {

    // Employee requests a counselling appointment
    CounsellingResponse createAppointment(
            Long employeeId,
            CreateCounsellingRequest request
    );

    // Employee views their appointments
    List<CounsellingResponse> getEmployeeAppointments(
            Long employeeId
    );

    // HR/Admin views all appointments
    List<CounsellingResponse> getAllAppointments();

    // HR/Admin approves an appointment
    CounsellingResponse approveAppointment(
            Long id
    );

    // HR/Admin rejects an appointment
    CounsellingResponse rejectAppointment(
            Long id,
            RejectCounsellingRequest request
    );

    // Employee cancels an appointment
    CounsellingResponse cancelAppointment(
            Long id,
            Long employeeId
    );

    // Mark an approved appointment as completed
    CounsellingResponse completeAppointment(
            Long id
    );
}