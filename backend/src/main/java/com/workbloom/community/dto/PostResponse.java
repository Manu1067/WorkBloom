package com.workbloom.community.dto;

import java.time.LocalDateTime;

import com.workbloom.community.entity.CommunityPost;

public class PostResponse {

    private Long id;
    private Long authorId;
    private String authorName;
    private String content;
    private String imageUrl;
    private long likeCount;
    private long commentCount;
    private boolean likedByViewer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PostResponse() {
    }

    public static PostResponse fromEntity(
            CommunityPost post,
            long likeCount,
            long commentCount,
            boolean likedByViewer) {

        PostResponse response = new PostResponse();

        response.setId(post.getId());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorName(
                post.getAuthor().getFirstName()
                        + " "
                        + (post.getAuthor().getLastName() == null
                                ? ""
                                : post.getAuthor().getLastName())
        );
        response.setContent(post.getContent());
        response.setImageUrl(post.getImageUrl());
        response.setLikeCount(likeCount);
        response.setCommentCount(commentCount);
        response.setLikedByViewer(likedByViewer);
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(long likeCount) {
        this.likeCount = likeCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public boolean isLikedByViewer() {
        return likedByViewer;
    }

    public void setLikedByViewer(boolean likedByViewer) {
        this.likedByViewer = likedByViewer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}