package com.workbloom.buddy.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.buddy.dto.BuddyResponse;
import com.workbloom.buddy.dto.CreateBuddyRequest;
import com.workbloom.buddy.entity.BuddyPair;
import com.workbloom.buddy.entity.BuddyRequest;
import com.workbloom.buddy.entity.BuddyRequestStatus;
import com.workbloom.buddy.repository.BuddyPairRepository;
import com.workbloom.buddy.repository.BuddyRequestRepository;
import com.workbloom.buddy.service.BuddyService;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;

@Service
@Transactional
public class BuddyServiceImpl implements BuddyService {

    private final BuddyRequestRepository buddyRequestRepository;
    private final BuddyPairRepository buddyPairRepository;
    private final EmployeeRepository employeeRepository;

    public BuddyServiceImpl(
            BuddyRequestRepository buddyRequestRepository,
            BuddyPairRepository buddyPairRepository,
            EmployeeRepository employeeRepository) {

        this.buddyRequestRepository = buddyRequestRepository;
        this.buddyPairRepository = buddyPairRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // SEND BUDDY REQUEST
    // =========================================================

    @Override
    public BuddyResponse sendRequest(
            Long requesterId,
            CreateBuddyRequest request) {

        Employee requester = employeeRepository
                .findById(requesterId)
                .orElseThrow(() ->
                        new RuntimeException("Requester not found"));

        Employee receiver = employeeRepository
                .findById(request.getReceiverId())
                .orElseThrow(() ->
                        new RuntimeException("Receiver not found"));

        // Employee cannot send request to themselves
        if (requesterId.equals(receiver.getId())) {

            throw new RuntimeException(
                    "You cannot send a buddy request to yourself");
        }

        // Requester must not already have a buddy
        if (hasActiveBuddy(requesterId)) {

            throw new RuntimeException(
                    "Requester already has an active buddy");
        }

        // Receiver must not already have a buddy
        if (hasActiveBuddy(receiver.getId())) {

            throw new RuntimeException(
                    "Receiver already has an active buddy");
        }

        // Check duplicate pending request
        if (buddyRequestRepository
                .existsByRequester_IdAndReceiver_IdAndStatus(
                        requesterId,
                        receiver.getId(),
                        BuddyRequestStatus.PENDING)) {

            throw new RuntimeException(
                    "Buddy request already exists");
        }

        BuddyRequest buddyRequest =
                new BuddyRequest();

        buddyRequest.setRequester(requester);
        buddyRequest.setReceiver(receiver);
        buddyRequest.setStatus(
                BuddyRequestStatus.PENDING
        );
        buddyRequest.setRequestedAt(
                LocalDateTime.now()
        );

        BuddyRequest saved =
                buddyRequestRepository.save(
                        buddyRequest
                );

        return mapRequestToResponse(saved);
    }

    // =========================================================
    // GET RECEIVED REQUESTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<BuddyResponse> getReceivedRequests(
            Long employeeId) {

        return buddyRequestRepository
                .findByReceiver_Id(employeeId)
                .stream()
                .map(this::mapRequestToResponse)
                .toList();
    }

    // =========================================================
    // GET SENT REQUESTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<BuddyResponse> getSentRequests(
            Long employeeId) {

        return buddyRequestRepository
                .findByRequester_Id(employeeId)
                .stream()
                .map(this::mapRequestToResponse)
                .toList();
    }

    // =========================================================
    // ACCEPT REQUEST
    // =========================================================

    @Override
    public BuddyResponse acceptRequest(
            Long requestId,
            Long employeeId) {

        BuddyRequest request =
                buddyRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Buddy request not found"));

        // Only receiver can accept
        if (!request.getReceiver()
                .getId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "Only the receiver can accept this request");
        }

        // Request must still be pending
        if (request.getStatus()
                != BuddyRequestStatus.PENDING) {

            throw new RuntimeException(
                    "Buddy request is no longer pending");
        }

        Employee requester =
                request.getRequester();

        Employee receiver =
                request.getReceiver();

        // Receiver already has buddy
        if (hasActiveBuddy(receiver.getId())) {

            throw new RuntimeException(
                    "Receiver already has an active buddy");
        }

        // Requester already has buddy
        if (hasActiveBuddy(requester.getId())) {

            throw new RuntimeException(
                    "Requester already has an active buddy");
        }

        // Update request
        request.setStatus(
                BuddyRequestStatus.ACCEPTED
        );

        request.setRespondedAt(
                LocalDateTime.now()
        );

        buddyRequestRepository.save(request);

        // Create actual buddy pair
        BuddyPair pair = new BuddyPair();

        pair.setEmployeeOne(requester);
        pair.setEmployeeTwo(receiver);
        pair.setPairedAt(LocalDateTime.now());
        pair.setActive(true);

        buddyPairRepository.save(pair);

        return mapRequestToResponse(request);
    }

    // =========================================================
    // REJECT REQUEST
    // =========================================================

    @Override
    public BuddyResponse rejectRequest(
            Long requestId,
            Long employeeId) {

        BuddyRequest request =
                buddyRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Buddy request not found"));

        // Only receiver can reject
        if (!request.getReceiver()
                .getId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "Only the receiver can reject this request");
        }

        // Request must still be pending
        if (request.getStatus()
                != BuddyRequestStatus.PENDING) {

            throw new RuntimeException(
                    "Buddy request is no longer pending");
        }

        request.setStatus(
                BuddyRequestStatus.REJECTED
        );

        request.setRespondedAt(
                LocalDateTime.now()
        );

        BuddyRequest saved =
                buddyRequestRepository.save(request);

        return mapRequestToResponse(saved);
    }

    // =========================================================
    // GET MY BUDDY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public BuddyResponse getMyBuddy(
            Long employeeId) {

        BuddyPair pair =
                buddyPairRepository
                        .findByEmployeeOne_IdAndActiveTrue(
                                employeeId
                        )
                        .orElseGet(() ->
                                buddyPairRepository
                                        .findByEmployeeTwo_IdAndActiveTrue(
                                                employeeId
                                        )
                                        .orElseThrow(() ->
                                                new RuntimeException(
                                                        "No active buddy found")));

        Employee buddy;

        if (pair.getEmployeeOne()
                .getId()
                .equals(employeeId)) {

            buddy = pair.getEmployeeTwo();

        } else {

            buddy = pair.getEmployeeOne();
        }

        BuddyResponse response =
                new BuddyResponse();

        response.setId(pair.getId());

        response.setBuddyId(
                buddy.getId()
        );

        response.setBuddyName(
                buildEmployeeName(buddy)
        );

        response.setPairedAt(
                pair.getPairedAt()
        );

        response.setActive(
                pair.isActive()
        );

        return response;
    }

    // =========================================================
    // CHECK ACTIVE BUDDY
    // =========================================================

    private boolean hasActiveBuddy(
            Long employeeId) {

        return buddyPairRepository
                .existsByEmployeeOne_IdAndActiveTrue(
                        employeeId
                )
                ||
                buddyPairRepository
                        .existsByEmployeeTwo_IdAndActiveTrue(
                                employeeId
                        );
    }

    // =========================================================
    // MAP REQUEST → RESPONSE
    // =========================================================

    private BuddyResponse mapRequestToResponse(
            BuddyRequest request) {

        BuddyResponse response =
                new BuddyResponse();

        response.setId(
                request.getId()
        );

        Employee requester =
                request.getRequester();

        Employee receiver =
                request.getReceiver();

        response.setRequesterId(
                requester.getId()
        );

        response.setRequesterName(
                buildEmployeeName(requester)
        );

        response.setReceiverId(
                receiver.getId()
        );

        response.setReceiverName(
                buildEmployeeName(receiver)
        );

        response.setStatus(
                request.getStatus().name()
        );

        response.setRequestedAt(
                request.getRequestedAt()
        );

        response.setRespondedAt(
                request.getRespondedAt()
        );

        return response;
    }

    // =========================================================
    // EMPLOYEE NAME
    // =========================================================

    private String buildEmployeeName(
            Employee employee) {

        return employee.getFirstName()
                + " "
                + (
                    employee.getLastName() == null
                        ? ""
                        : employee.getLastName()
                );
    }
}