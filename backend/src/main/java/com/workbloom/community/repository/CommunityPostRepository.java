package com.workbloom.community.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.community.entity.CommunityPost;

@Repository
public interface CommunityPostRepository
        extends JpaRepository<CommunityPost, Long> {

    List<CommunityPost> findByDeletedFalseOrderByCreatedAtDesc();

    List<CommunityPost> findByAuthor_IdAndDeletedFalseOrderByCreatedAtDesc(
            Long authorId
    );
}