package com.workbloom.leave.service;

import java.util.List;

import com.workbloom.leave.dto.ApplyLeaveRequest;
import com.workbloom.leave.dto.LeaveResponse;
import com.workbloom.leave.dto.RejectLeaveRequest;

public interface LeaveService {

    // Employee applies for leave
    LeaveResponse applyLeave(
            Long employeeId,
            ApplyLeaveRequest request
    );

    // Employee views own leaves
    List<LeaveResponse> getMyLeaves(
            Long employeeId
    );

    // HR/Admin views all leave requests
    List<LeaveResponse> getAllLeaves();

    // View one leave request
    LeaveResponse getLeaveById(
            Long leaveId
    );

    // HR/Admin approves leave
    LeaveResponse approveLeave(
            Long leaveId
    );

    // HR/Admin rejects leave
    LeaveResponse rejectLeave(
            Long leaveId,
            RejectLeaveRequest request
    );

    // Employee cancels leave
    LeaveResponse cancelLeave(
            Long leaveId,
            Long employeeId
    );
}