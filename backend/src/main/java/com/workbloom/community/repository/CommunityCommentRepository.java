package com.workbloom.community.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.community.entity.Comment;

@Repository
public interface CommunityCommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment> findByPost_IdAndDeletedFalseOrderByCreatedAtAsc(
            Long postId
    );

    long countByPost_IdAndDeletedFalse(Long postId);
}