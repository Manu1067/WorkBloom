package com.workbloom.recognition.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workbloom.recognition.entity.Badge;

public interface BadgeRepository
        extends JpaRepository<Badge, Long> {
}