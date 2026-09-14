package com.workbloom.community.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.community.dto.CommentRequest;
import com.workbloom.community.dto.CommentResponse;
import com.workbloom.community.dto.PostRequest;
import com.workbloom.community.dto.PostResponse;
import com.workbloom.community.service.CommunityService;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> createPost(
            @RequestParam Long authorId,
            @RequestBody PostRequest request) {

        return ResponseEntity.ok(
                communityService.createPost(authorId, request)
        );
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getFeed(
            @RequestParam(required = false) Long viewerId) {

        return ResponseEntity.ok(communityService.getFeed(viewerId));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long postId,
            @RequestParam(required = false) Long viewerId) {

        return ResponseEntity.ok(
                communityService.getPost(postId, viewerId)
        );
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long postId,
            @RequestParam Long authorId,
            @RequestBody PostRequest request) {

        return ResponseEntity.ok(
                communityService.updatePost(
                        postId,
                        authorId,
                        request
                )
        );
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @RequestParam Long authorId) {

        communityService.deletePost(postId, authorId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/likes")
    public ResponseEntity<PostResponse> likePost(
            @PathVariable Long postId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                communityService.likePost(postId, employeeId)
        );
    }

    @DeleteMapping("/posts/{postId}/likes")
    public ResponseEntity<Void> unlikePost(
            @PathVariable Long postId,
            @RequestParam Long employeeId) {

        communityService.unlikePost(postId, employeeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @RequestParam Long authorId,
            @RequestBody CommentRequest request) {

        return ResponseEntity.ok(
                communityService.addComment(
                        postId,
                        authorId,
                        request
                )
        );
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long postId) {

        return ResponseEntity.ok(
                communityService.getComments(postId)
        );
    }

    @PutMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestParam Long authorId,
            @RequestBody CommentRequest request) {

        return ResponseEntity.ok(
                communityService.updateComment(
                        postId,
                        commentId,
                        authorId,
                        request
                )
        );
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestParam Long authorId) {

        communityService.deleteComment(
                postId,
                commentId,
                authorId
        );

        return ResponseEntity.noContent().build();
    }
}