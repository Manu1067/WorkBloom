package com.workbloom.community.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.community.entity.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByPost_IdAndEmployee_Id(
            Long postId,
            Long employeeId
    );

    long countByPost_Id(Long postId);

    void deleteByPost_IdAndEmployee_Id(
            Long postId,
            Long employeeId
    );
}