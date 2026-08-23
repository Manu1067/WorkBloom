package com.workbloom.wellness.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.wellness.dto.CounsellingResponse;
import com.workbloom.wellness.dto.CreateCounsellingRequest;
import com.workbloom.wellness.dto.RejectCounsellingRequest;
import com.workbloom.wellness.entity.CounsellingAppointment;
import com.workbloom.wellness.entity.CounsellingStatus;
import com.workbloom.wellness.repository.CounsellingAppointmentRepository;
import com.workbloom.wellness.service.CounsellingService;

@Service
@Transactional
public class CounsellingServiceImpl implements CounsellingService {

    private final CounsellingAppointmentRepository counsellingRepository;
    private final EmployeeRepository employeeRepository;

    public CounsellingServiceImpl(
            CounsellingAppointmentRepository counsellingRepository,
            EmployeeRepository employeeRepository) {

        this.counsellingRepository = counsellingRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // CREATE APPOINTMENT
    // =========================================================

    @Override
    public CounsellingResponse createAppointment(
            Long employeeId,
            CreateCounsellingRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        CounsellingAppointment appointment =
                new CounsellingAppointment();

        appointment.setEmployee(employee);
        appointment.setCounsellingType(
                request.getCounsellingType()
        );
        appointment.setAppointmentDate(
                request.getAppointmentDate()
        );
        appointment.setAppointmentTime(
                request.getAppointmentTime()
        );
        appointment.setReason(
                request.getReason()
        );

        appointment.setStatus(
                CounsellingStatus.PENDING
        );

        CounsellingAppointment saved =
                counsellingRepository.save(appointment);

        return mapToResponse(saved);
    }

    // =========================================================
    // GET EMPLOYEE APPOINTMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CounsellingResponse> getEmployeeAppointments(
            Long employeeId) {

        return counsellingRepository
                .findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET ALL APPOINTMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CounsellingResponse> getAllAppointments() {

        return counsellingRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // APPROVE APPOINTMENT
    // =========================================================

    @Override
    public CounsellingResponse approveAppointment(Long id) {

        CounsellingAppointment appointment =
                getAppointment(id);

        if (appointment.getStatus()
                != CounsellingStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending appointments can be approved"
            );
        }

        appointment.setStatus(
                CounsellingStatus.APPROVED
        );

        return mapToResponse(appointment);
    }

    // =========================================================
    // REJECT APPOINTMENT
    // =========================================================

    @Override
    public CounsellingResponse rejectAppointment(
            Long id,
            RejectCounsellingRequest request) {

        CounsellingAppointment appointment =
                getAppointment(id);

        if (appointment.getStatus()
                != CounsellingStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending appointments can be rejected"
            );
        }

        appointment.setStatus(
                CounsellingStatus.REJECTED
        );

        appointment.setRejectionReason(
                request.getRejectionReason()
        );

        return mapToResponse(appointment);
    }

    // =========================================================
    // CANCEL APPOINTMENT
    // =========================================================

    @Override
    public CounsellingResponse cancelAppointment(
            Long id,
            Long employeeId) {

        CounsellingAppointment appointment =
                getAppointment(id);

        if (!appointment.getEmployee()
                .getId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "You can cancel only your own appointment"
            );
        }

        if (appointment.getStatus()
                != CounsellingStatus.PENDING &&
            appointment.getStatus()
                != CounsellingStatus.APPROVED) {

            throw new RuntimeException(
                    "This appointment cannot be cancelled"
            );
        }

        appointment.setStatus(
                CounsellingStatus.CANCELLED
        );

        return mapToResponse(appointment);
    }

    // =========================================================
    // COMPLETE APPOINTMENT
    // =========================================================

    @Override
    public CounsellingResponse completeAppointment(
            Long id) {

        CounsellingAppointment appointment =
                getAppointment(id);

        if (appointment.getStatus()
                != CounsellingStatus.APPROVED) {

            throw new RuntimeException(
                    "Only approved appointments can be completed"
            );
        }

        appointment.setStatus(
                CounsellingStatus.COMPLETED
        );

        return mapToResponse(appointment);
    }

    // =========================================================
    // FIND APPOINTMENT
    // =========================================================

    private CounsellingAppointment getAppointment(
            Long id) {

        return counsellingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Counselling appointment not found"
                        ));
    }

    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private CounsellingResponse mapToResponse(
            CounsellingAppointment appointment) {

        CounsellingResponse response =
                new CounsellingResponse();

        Employee employee =
                appointment.getEmployee();

        response.setId(appointment.getId());
        response.setEmployeeId(employee.getId());

        response.setEmployeeName(
                employee.getFirstName()
                + " "
                + (employee.getLastName() == null
                    ? ""
                    : employee.getLastName())
        );

        response.setEmployeeCode(
                employee.getEmployeeCode()
        );

        response.setCounsellingType(
                appointment.getCounsellingType()
        );

        response.setAppointmentDate(
                appointment.getAppointmentDate()
        );

        response.setAppointmentTime(
                appointment.getAppointmentTime()
        );

        response.setReason(
                appointment.getReason()
        );

        response.setStatus(
                appointment.getStatus()
        );

        response.setRejectionReason(
                appointment.getRejectionReason()
        );

        return response;
    }
}
