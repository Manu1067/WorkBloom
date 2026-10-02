package com.workbloom.community.serviceimpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.workbloom.community.dto.CommentRequest;
import com.workbloom.community.dto.PostRequest;
import com.workbloom.community.entity.CommunityPost;
import com.workbloom.community.repository.CommunityCommentRepository;
import com.workbloom.community.repository.CommunityPostRepository;
import com.workbloom.community.repository.LikeRepository;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.exception.ForbiddenException;
import com.workbloom.notification.service.NotificationService;

/**
 * Every community write derives the acting employee from the JWT principal.
 * A forged authorId / employeeId must never be accepted as identity.
 */
@ExtendWith(MockitoExtension.class)
class CommunityServiceImplIdentityTest {

    private static final Long ALICE_ID = 1L;
    private static final Long BOB_ID = 2L;
    private static final String ALICE_EMAIL = "alice@workbloom.internal";
    private static final String BOB_EMAIL = "bob@workbloom.internal";

    @Mock private CommunityPostRepository postRepository;
    @Mock private CommunityCommentRepository commentRepository;
    @Mock private LikeRepository likeRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private NotificationService notificationService;

    private CommunityServiceImpl service;
    private CommunityPost alicesPost;

    @BeforeEach
    void setUp() {
        service = new CommunityServiceImpl(
                postRepository, commentRepository, likeRepository, employeeRepository, notificationService);

        Employee alice = employee(ALICE_ID, ALICE_EMAIL, "Alice");
        Employee bob = employee(BOB_ID, BOB_EMAIL, "Bob");

        alicesPost = new CommunityPost();
        alicesPost.setId(10L);
        alicesPost.setAuthor(alice);
        alicesPost.setContent("Alice's post");

        lenient().when(postRepository.findById(10L)).thenReturn(Optional.of(alicesPost));
        lenient().when(postRepository.save(any(CommunityPost.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(employeeRepository.findByEmail(ALICE_EMAIL)).thenReturn(Optional.of(alice));
        lenient().when(employeeRepository.findByEmail(BOB_EMAIL)).thenReturn(Optional.of(bob));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private Employee employee(Long id, String email, String firstName) {
        Employee e = new Employee();
        e.setId(id);
        e.setEmail(email);
        e.setFirstName(firstName);
        e.setLastName("Tester");
        return e;
    }

    private void authenticateAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        email, null, List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"))));
    }

    private PostRequest postRequest(String content) {
        PostRequest r = new PostRequest();
        r.setContent(content);
        return r;
    }

    private CommentRequest commentRequest(String content) {
        CommentRequest r = new CommentRequest();
        r.setContent(content);
        return r;
    }

    @Test
    void authorCanDeleteOwnPost() {
        authenticateAs(ALICE_EMAIL);

        service.deletePost(10L, ALICE_ID);

        assertThat(alicesPost.isDeleted()).isTrue();
        verify(postRepository).save(alicesPost);
    }

    @Test
    void otherUserCannotDeletePostEvenByForgingTheAuthorId() {
        authenticateAs(BOB_EMAIL);

        assertThatThrownBy(() -> service.deletePost(10L, ALICE_ID)).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.deletePost(10L, BOB_ID)).isInstanceOf(ForbiddenException.class);

        assertThat(alicesPost.isDeleted()).isFalse();
        verify(postRepository, never()).save(any());
    }

    @Test
    void cannotCreatePostAsSomeoneElse() {
        authenticateAs(BOB_EMAIL);

        assertThatThrownBy(() -> service.createPost(ALICE_ID, postRequest("Posting as Alice")))
                .isInstanceOf(ForbiddenException.class);

        verify(postRepository, never()).save(any());
    }

    @Test
    void cannotLikeOrUnlikeAsSomeoneElse() {
        authenticateAs(BOB_EMAIL);

        assertThatThrownBy(() -> service.likePost(10L, ALICE_ID)).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.unlikePost(10L, ALICE_ID)).isInstanceOf(ForbiddenException.class);

        verifyNoInteractions(likeRepository);
    }

    @Test
    void cannotCommentOrModifyCommentsAsSomeoneElse() {
        authenticateAs(BOB_EMAIL);

        assertThatThrownBy(() -> service.addComment(10L, ALICE_ID, commentRequest("Forged")))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.updateComment(10L, 5L, ALICE_ID, commentRequest("Forged")))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.deleteComment(10L, 5L, ALICE_ID))
                .isInstanceOf(ForbiddenException.class);

        verifyNoInteractions(commentRepository);
    }

    @Test
    void unauthenticatedWritesAreForbidden() {
        assertThatThrownBy(() -> service.deletePost(10L, ALICE_ID)).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.likePost(10L, ALICE_ID)).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.addComment(10L, ALICE_ID, commentRequest("Hi")))
                .isInstanceOf(ForbiddenException.class);

        verify(postRepository, never()).save(any());
        verifyNoInteractions(likeRepository, commentRepository);
    }
}
