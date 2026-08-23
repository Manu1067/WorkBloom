package com.workbloom.leave.serviceimpl;

import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.leave.dto.ApplyLeaveRequest;
import com.workbloom.leave.dto.LeaveResponse;
import com.workbloom.leave.dto.RejectLeaveRequest;
import com.workbloom.leave.entity.Leave;
import com.workbloom.leave.entity.LeaveStatus;
import com.workbloom.leave.repository.LeaveRepository;
import com.workbloom.leave.service.LeaveService;

@Service
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveServiceImpl(
            LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository) {

        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // APPLY LEAVE
    // =========================================================

    @Override
    public LeaveResponse applyLeave(
            Long employeeId,
            ApplyLeaveRequest request) {

        // Find employee
        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Employee not found"
                                )
                        );

        // Validate dates
        if (request.getStartDate() == null
                || request.getEndDate() == null) {

            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (request.getEndDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }

        // Calculate number of days
        int numberOfDays =
                (int) ChronoUnit.DAYS.between(
                        request.getStartDate(),
                        request.getEndDate()
                ) + 1;

        // Create Leave
        Leave leave = new Leave();

        leave.setEmployee(employee);

        leave.setLeaveType(
                request.getLeaveType()
        );

        leave.setStartDate(
                request.getStartDate()
        );

        leave.setEndDate(
                request.getEndDate()
        );

        leave.setNumberOfDays(
                numberOfDays
        );

        leave.setReason(
                request.getReason()
        );

        // New requests are always pending
        leave.setStatus(
                LeaveStatus.PENDING
        );

        Leave savedLeave =
                leaveRepository.save(leave);

        return convertToResponse(savedLeave);
    }

    // =========================================================
    // GET MY LEAVES
    // =========================================================

    @Override
    public List<LeaveResponse> getMyLeaves(
            Long employeeId) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Employee not found"
                                )
                        );

        return leaveRepository
                .findByEmployee(employee)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET ALL LEAVES
    // =========================================================

    @Override
    public List<LeaveResponse> getAllLeaves() {

        return leaveRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET LEAVE BY ID
    // =========================================================

    @Override
    public LeaveResponse getLeaveById(
            Long leaveId) {

        Leave leave =
                leaveRepository.findById(leaveId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Leave request not found"
                                )
                        );

        return convertToResponse(leave);
    }

    // =========================================================
    // APPROVE LEAVE
    // =========================================================

    @Override
    public LeaveResponse approveLeave(
            Long leaveId) {

        Leave leave =
                leaveRepository.findById(leaveId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Leave request not found"
                                )
                        );

        if (leave.getStatus()
                != LeaveStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending leave requests can be approved"
            );
        }

        leave.setStatus(
                LeaveStatus.APPROVED
        );

        Leave updatedLeave =
                leaveRepository.save(leave);

        return convertToResponse(updatedLeave);
    }

    // =========================================================
    // REJECT LEAVE
    // =========================================================

    @Override
    public LeaveResponse rejectLeave(
            Long leaveId,
            RejectLeaveRequest request) {

        Leave leave =
                leaveRepository.findById(leaveId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Leave request not found"
                                )
                        );

        if (leave.getStatus()
                != LeaveStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending leave requests can be rejected"
            );
        }

        if (request.getRejectionReason() == null
                || request.getRejectionReason()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Rejection reason is required"
            );
        }

        leave.setStatus(
                LeaveStatus.REJECTED
        );

        leave.setRejectionReason(
                request.getRejectionReason()
        );

        Leave updatedLeave =
                leaveRepository.save(leave);

        return convertToResponse(updatedLeave);
    }

    // =========================================================
    // CANCEL LEAVE
    // =========================================================

    @Override
    public LeaveResponse cancelLeave(
            Long leaveId,
            Long employeeId) {

        Leave leave =
                leaveRepository.findById(leaveId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Leave request not found"
                                )
                        );

        // Make sure this leave belongs to employee
        if (!leave.getEmployee()
                .getId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "You cannot cancel another employee's leave"
            );
        }

        if (leave.getStatus()
                != LeaveStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending leave requests can be cancelled"
            );
        }

        leave.setStatus(
                LeaveStatus.CANCELLED
        );

        Leave updatedLeave =
                leaveRepository.save(leave);

        return convertToResponse(updatedLeave);
    }

    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private LeaveResponse convertToResponse(
            Leave leave) {

        LeaveResponse response =
                new LeaveResponse();

        response.setId(
                leave.getId()
        );

        response.setEmployeeId(
                leave.getEmployee()
                        .getId()
        );

        response.setEmployeeName(
                leave.getEmployee()
                        .getFirstName()
                        + " "
                        + leave.getEmployee()
                                .getLastName()
        );

        response.setEmployeeCode(
                leave.getEmployee()
                        .getEmployeeCode()
        );

        response.setLeaveType(
                leave.getLeaveType()
        );

        response.setStartDate(
                leave.getStartDate()
        );

        response.setEndDate(
                leave.getEndDate()
        );

        response.setNumberOfDays(
                leave.getNumberOfDays()
        );

        response.setReason(
                leave.getReason()
        );

        response.setStatus(
                leave.getStatus()
        );

        response.setRejectionReason(
                leave.getRejectionReason()
        );

        return response;
    }
}