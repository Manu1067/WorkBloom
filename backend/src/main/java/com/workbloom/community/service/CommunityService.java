package com.workbloom.community.service;

import java.util.List;

import com.workbloom.community.dto.CommentRequest;
import com.workbloom.community.dto.CommentResponse;
import com.workbloom.community.dto.PostRequest;
import com.workbloom.community.dto.PostResponse;

public interface CommunityService {

    PostResponse createPost(
            Long authorId,
            PostRequest request
    );

    List<PostResponse> getFeed(Long viewerId);

    PostResponse getPost(
            Long postId,
            Long viewerId
    );

    PostResponse updatePost(
            Long postId,
            Long authorId,
            PostRequest request
    );

    void deletePost(
            Long postId,
            Long authorId
    );

    PostResponse likePost(
            Long postId,
            Long employeeId
    );

    void unlikePost(
            Long postId,
            Long employeeId
    );

    CommentResponse addComment(
            Long postId,
            Long authorId,
            CommentRequest request
    );

    List<CommentResponse> getComments(Long postId);

    CommentResponse updateComment(
            Long postId,
            Long commentId,
            Long authorId,
            CommentRequest request
    );

    void deleteComment(
            Long postId,
            Long commentId,
            Long authorId
    );
}