package com.workbloom.buddy.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.buddy.entity.BuddyPair;

@Repository
public interface BuddyPairRepository
        extends JpaRepository<BuddyPair, Long> {

    // Find active buddy pair involving an employee
    Optional<BuddyPair> findByEmployeeOne_IdAndActiveTrue(
            Long employeeId
    );

    Optional<BuddyPair> findByEmployeeTwo_IdAndActiveTrue(
            Long employeeId
    );

    // Check whether employee is already paired
    boolean existsByEmployeeOne_IdAndActiveTrue(
            Long employeeId
    );

    boolean existsByEmployeeTwo_IdAndActiveTrue(
            Long employeeId
    );

    // Find all pairs involving an employee
    List<BuddyPair> findByEmployeeOne_IdOrEmployeeTwo_Id(
            Long employeeOneId,
            Long employeeTwoId
    );
}