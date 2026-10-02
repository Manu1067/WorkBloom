package com.workbloom.community.serviceimpl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.community.dto.CommentRequest;
import com.workbloom.community.dto.CommentResponse;
import com.workbloom.community.dto.PostRequest;
import com.workbloom.community.dto.PostResponse;
import com.workbloom.community.entity.Comment;
import com.workbloom.community.entity.CommunityPost;
import com.workbloom.community.entity.Like;
import com.workbloom.community.repository.CommunityCommentRepository;
import com.workbloom.community.repository.CommunityPostRepository;
import com.workbloom.community.repository.LikeRepository;
import com.workbloom.community.service.CommunityService;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.notification.dto.NotificationRequest;
import com.workbloom.notification.entity.NotificationType;
import com.workbloom.notification.service.NotificationService;
import com.workbloom.exception.BadRequestException;
import com.workbloom.exception.ConflictException;
import com.workbloom.exception.ForbiddenException;
import com.workbloom.exception.ResourceNotFoundException;

@Service
@Transactional
public class CommunityServiceImpl implements CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public CommunityServiceImpl(
            CommunityPostRepository postRepository,
            CommunityCommentRepository commentRepository,
            LikeRepository likeRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {

        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Override
    public PostResponse createPost(
            Long authorId,
            PostRequest request) {

        Long actorId = authorizeActor(authorId);
        Employee author = findEmployee(actorId);
        validatePost(request);

        CommunityPost post = new CommunityPost();
        post.setAuthor(author);
        applyPostRequest(post, request);

        return toResponse(postRepository.save(post), actorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(Long viewerId) {

        return postRepository.findByDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(post -> toResponse(post, viewerId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPost(
            Long postId,
            Long viewerId) {

        return toResponse(findActivePost(postId), viewerId);
    }

    @Override
    public PostResponse updatePost(
            Long postId,
            Long authorId,
            PostRequest request) {

        // Identity comes from the authenticated JWT, never from the client.
        Long authenticatedId = authorizeActor(authorId);

        CommunityPost post = findActivePost(postId);
        verifyPostOwner(post, authenticatedId);
        validatePost(request);
        validatePostLength(request);
        applyPostRequest(post, request);

        return toResponse(postRepository.save(post), authenticatedId);
    }

    @Override
    public void deletePost(
            Long postId,
            Long authorId) {

        Long actorId = authorizeActor(authorId);
        CommunityPost post = findActivePost(postId);
        verifyPostOwner(post, actorId);
        post.setDeleted(true);
        postRepository.save(post);
    }

    @Override
    public PostResponse likePost(
            Long postId,
            Long claimedEmployeeId) {

        Long employeeId = authorizeActor(claimedEmployeeId);
        CommunityPost post = findActivePost(postId);
        Employee employee = findEmployee(employeeId);

        if (likeRepository.findByPost_IdAndEmployee_Id(
                postId,
                employeeId
        ).isPresent()) {
            throw new ConflictException(
                    "Employee has already liked this post");
        }

        Like like = new Like();
        like.setPost(post);
        like.setEmployee(employee);
        likeRepository.save(like);

        if (!post.getAuthor().getId().equals(employeeId)) {
            notifyEmployee(
                    post.getAuthor().getId(),
                    "New reaction on your post",
                    employee.getFirstName()
                            + " reacted to your community post"
            );
        }

        return toResponse(post, employeeId);
    }

    @Override
    public void unlikePost(
            Long postId,
            Long claimedEmployeeId) {

        Long employeeId = authorizeActor(claimedEmployeeId);
        findActivePost(postId);

        if (likeRepository.findByPost_IdAndEmployee_Id(
                postId,
                employeeId
        ).isEmpty()) {
            throw new ResourceNotFoundException(
                    "Like not found");
        }

        likeRepository.deleteByPost_IdAndEmployee_Id(
                postId,
                employeeId
        );
    }

    @Override
    public CommentResponse addComment(
            Long postId,
            Long claimedAuthorId,
            CommentRequest request) {

        Long authorId = authorizeActor(claimedAuthorId);
        CommunityPost post = findActivePost(postId);
        Employee author = findEmployee(authorId);
        validateComment(request);

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.getContent().trim());

        Comment savedComment = commentRepository.save(comment);

        if (!post.getAuthor().getId().equals(authorId)) {
            notifyEmployee(
                    post.getAuthor().getId(),
                    "New comment on your post",
                    author.getFirstName()
                            + " commented on your community post"
            );
        }

        return CommentResponse.fromEntity(savedComment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId) {

        findActivePost(postId);

        return commentRepository
                .findByPost_IdAndDeletedFalseOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponse::fromEntity)
                .toList();
    }

    @Override
    public CommentResponse updateComment(
            Long postId,
            Long commentId,
            Long authorId,
            CommentRequest request) {

        Long actorId = authorizeActor(authorId);
        CommunityPost post = findActivePost(postId);
        Comment comment = findActiveComment(commentId, post);
        verifyCommentOwner(comment, actorId);
        validateComment(request);
        comment.setContent(request.getContent().trim());

        return CommentResponse.fromEntity(
                commentRepository.save(comment)
        );
    }

    @Override
    public void deleteComment(
            Long postId,
            Long commentId,
            Long authorId) {

        Long actorId = authorizeActor(authorId);
        CommunityPost post = findActivePost(postId);
        Comment comment = findActiveComment(commentId, post);
        verifyCommentOwner(comment, actorId);
        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    private Employee findEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));
    }

    private CommunityPost findActivePost(Long postId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Community post not found"));

        if (post.isDeleted()) {
            throw new ResourceNotFoundException("Community post not found");
        }

        return post;
    }

    private Comment findActiveComment(
            Long commentId,
            CommunityPost post) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Comment not found"));

        if (comment.isDeleted()
                || !comment.getPost().getId().equals(post.getId())) {
            throw new ResourceNotFoundException("Comment not found");
        }

        return comment;
    }

    private PostResponse toResponse(
            CommunityPost post,
            Long viewerId) {

        boolean liked = viewerId != null
                && likeRepository.findByPost_IdAndEmployee_Id(
                        post.getId(),
                        viewerId
                ).isPresent();

        return PostResponse.fromEntity(
                post,
                likeRepository.countByPost_Id(post.getId()),
                commentRepository.countByPost_IdAndDeletedFalse(
                        post.getId()
                ),
                liked
        );
    }

    /** Generous server-side cap for edited posts (the UI limits to 2000). */
    static final int MAX_POST_LENGTH = 5000;

    private void validatePostLength(PostRequest request) {
        if (request.getContent().trim().length() > MAX_POST_LENGTH) {
            throw new BadRequestException(
                    "Post content must be at most " + MAX_POST_LENGTH + " characters");
        }
    }

    /**
     * Resolves the caller's Employee id from the authenticated JWT subject
     * (same source as GET /api/employees/me). Anything unauthenticated or
     * without a linked Employee is forbidden - there is no fallback to a
     * client-supplied id.
     */
    private Long resolveAuthenticatedEmployeeId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new ForbiddenException("Authentication is required to edit a post");
        }

        return employeeRepository.findByEmail(authentication.getName())
                .map(Employee::getId)
                .orElseThrow(() -> new ForbiddenException(
                        "No employee profile is linked to this account"));
    }

    /**
     * Identity guard for every community write. The acting employee is the
     * one in the JWT; an id supplied by the client (query/path) is accepted
     * only if it agrees with it, otherwise 403. Returns the trusted id.
     */
    private Long authorizeActor(Long claimedId) {
        Long authenticatedId = resolveAuthenticatedEmployeeId();

        if (claimedId != null && !claimedId.equals(authenticatedId)) {
            throw new ForbiddenException("You can only act as yourself");
        }

        return authenticatedId;
    }

    private void verifyPostOwner(
            CommunityPost post,
            Long authorId) {

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new ForbiddenException(
                    "Only the post author can modify this post");
        }
    }

    private void verifyCommentOwner(
            Comment comment,
            Long authorId) {

        if (!comment.getAuthor().getId().equals(authorId)) {
            throw new ForbiddenException(
                    "Only the comment author can modify this comment");
        }
    }

    private void validatePost(PostRequest request) {
        if (request == null || isBlank(request.getContent())) {
            throw new BadRequestException("Post content is required");
        }
    }

    private void validateComment(CommentRequest request) {
        if (request == null || isBlank(request.getContent())) {
            throw new BadRequestException("Comment content is required");
        }
    }

    private void applyPostRequest(
            CommunityPost post,
            PostRequest request) {

        post.setContent(request.getContent().trim());
        post.setImageUrl(request.getImageUrl());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void notifyEmployee(
            Long employeeId,
            String title,
            String message) {

        NotificationRequest notification =
                new NotificationRequest();
        notification.setEmployeeId(employeeId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(NotificationType.COMMUNITY);
        notificationService.create(notification);
    }
}