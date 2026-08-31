package com.workbloom.buddy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.buddy.entity.BuddyRequest;
import com.workbloom.buddy.entity.BuddyRequestStatus;

@Repository
public interface BuddyRequestRepository
        extends JpaRepository<BuddyRequest, Long> {

    // Requests received by an employee
    List<BuddyRequest> findByReceiver_Id(Long employeeId);

    // Requests sent by an employee
    List<BuddyRequest> findByRequester_Id(Long employeeId);

    // Pending requests received by an employee
    List<BuddyRequest> findByReceiver_IdAndStatus(
            Long employeeId,
            BuddyRequestStatus status
    );

    // Check whether a request already exists
    boolean existsByRequester_IdAndReceiver_IdAndStatus(
            Long requesterId,
            Long receiverId,
            BuddyRequestStatus status
    );
}