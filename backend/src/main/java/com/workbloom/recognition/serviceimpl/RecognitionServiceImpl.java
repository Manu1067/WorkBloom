package com.workbloom.recognition.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;
import com.workbloom.recognition.dto.CommentRequest;
import com.workbloom.recognition.dto.CommentResponse;
import com.workbloom.recognition.dto.RecognitionRequest;
import com.workbloom.recognition.dto.RecognitionResponse;
import com.workbloom.recognition.dto.ReactionRequest;
import com.workbloom.recognition.entity.Comment;
import com.workbloom.recognition.entity.Recognition;
import com.workbloom.recognition.entity.Reaction;
import com.workbloom.recognition.repository.CommentRepository;
import com.workbloom.recognition.repository.RecognitionRepository;
import com.workbloom.recognition.repository.ReactionRepository;
import com.workbloom.recognition.service.RecognitionService;
import com.workbloom.recognition.dto.BadgeRequest;
import com.workbloom.recognition.entity.Badge;
import com.workbloom.recognition.repository.BadgeRepository;
@Service
@Transactional
public class RecognitionServiceImpl implements RecognitionService {

    private final RecognitionRepository recognitionRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    private final EmployeeRepository employeeRepository;
    private final BadgeRepository badgeRepository;
  
    public RecognitionServiceImpl(
        RecognitionRepository recognitionRepository,
        ReactionRepository reactionRepository,
        CommentRepository commentRepository,
        EmployeeRepository employeeRepository,
        BadgeRepository badgeRepository) {

    this.recognitionRepository = recognitionRepository;
    this.reactionRepository = reactionRepository;
    this.commentRepository = commentRepository;
    this.employeeRepository = employeeRepository;
    this.badgeRepository = badgeRepository;
}
    // =========================================================
    // CREATE RECOGNITION / ACHIEVEMENT POST
    // =========================================================
@Override
public Badge createBadge(BadgeRequest request) {

    Badge badge = new Badge();

    badge.setName(request.getName());
    badge.setDescription(request.getDescription());
    badge.setIconUrl(request.getIconUrl());

    return badgeRepository.save(badge);
}

@Override
@Transactional(readOnly = true)
public List<Badge> getAllBadges() {

    return badgeRepository.findAll();
}
    @Override
    public RecognitionResponse createRecognition(
            Long authorId,
            RecognitionRequest request) {

        Employee author =
                employeeRepository.findById(authorId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Author not found with ID: "
                                                + authorId
                                ));

        Employee employee = null;

        if (request.getEmployeeId() != null) {

            employee =
                    employeeRepository.findById(
                            request.getEmployeeId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Employee not found with ID: "
                                            + request.getEmployeeId()
                            ));
        }

        Recognition recognition = new Recognition();

        recognition.setAuthor(author);
        recognition.setEmployee(employee);

        recognition.setTitle(
                request.getTitle()
        );

        recognition.setMessage(
                request.getMessage()
        );

        recognition.setImageUrl(
                request.getImageUrl()
        );

        recognition.setType(
                request.getType()
        );

        Recognition saved =
                recognitionRepository.save(
                        recognition
                );

        return mapRecognitionToResponse(saved);
    }

    // =========================================================
    // GET COMPANY FEED
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RecognitionResponse> getFeed() {

        return recognitionRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapRecognitionToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET EMPLOYEE RECOGNITIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RecognitionResponse> getEmployeeRecognitions(
            Long employeeId) {

        return recognitionRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(recognition ->
                        recognition.getEmployee() != null
                                && recognition.getEmployee()
                                .getId()
                                .equals(employeeId)
                )
                .map(this::mapRecognitionToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ADD / CHANGE REACTION
    // =========================================================

    @Override
    public RecognitionResponse react(
            Long recognitionId,
            Long employeeId,
            ReactionRequest request) {

        Recognition recognition =
                recognitionRepository.findById(
                        recognitionId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Recognition not found with ID: "
                                        + recognitionId
                        ));

        Employee employee =
                employeeRepository.findById(
                        employeeId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with ID: "
                                        + employeeId
                        ));

        Reaction reaction =
                reactionRepository
                        .findByRecognitionIdAndEmployeeId(
                                recognitionId,
                                employeeId
                        )
                        .orElse(null);

        if (reaction == null) {

            reaction = new Reaction();

            reaction.setRecognition(
                    recognition
            );

            reaction.setEmployee(
                    employee
            );
        }

        reaction.setType(
                request.getType()
        );

        reactionRepository.save(
                reaction
        );

        return mapRecognitionToResponse(
                recognition
        );
    }

    // =========================================================
    // REMOVE REACTION
    // =========================================================

    @Override
    public void removeReaction(
            Long recognitionId,
            Long employeeId) {

        Recognition recognition =
                recognitionRepository.findById(
                        recognitionId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Recognition not found with ID: "
                                        + recognitionId
                        ));

        reactionRepository
                .deleteByRecognitionIdAndEmployeeId(
                        recognition.getId(),
                        employeeId
                );
    }

    // =========================================================
    // ADD COMMENT
    // =========================================================

    @Override
    public CommentResponse addComment(
            Long recognitionId,
            Long employeeId,
            CommentRequest request) {

        Recognition recognition =
                recognitionRepository.findById(
                        recognitionId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Recognition not found with ID: "
                                        + recognitionId
                        ));

        Employee employee =
                employeeRepository.findById(
                        employeeId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with ID: "
                                        + employeeId
                        ));

        if (request.getContent() == null
                || request.getContent().isBlank()) {

            throw new RuntimeException(
                    "Comment cannot be empty"
            );
        }

        Comment comment = new Comment();

        comment.setRecognition(
                recognition
        );

        comment.setEmployee(
                employee
        );

        comment.setContent(
                request.getContent()
        );

        Comment saved =
                commentRepository.save(
                        comment
                );

        return mapCommentToResponse(saved);
    }

    // =========================================================
    // GET COMMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(
            Long recognitionId) {

        recognitionRepository.findById(
                recognitionId
        ).orElseThrow(() ->
                new RuntimeException(
                        "Recognition not found with ID: "
                                + recognitionId
                ));

        return commentRepository
                .findByRecognitionIdOrderByCreatedAtAsc(
                        recognitionId
                )
                .stream()
                .map(this::mapCommentToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // DELETE COMMENT
    // =========================================================

    @Override
    public void deleteComment(
            Long commentId,
            Long employeeId) {

        Comment comment =
                commentRepository.findById(
                        commentId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Comment not found with ID: "
                                        + commentId
                        ));

        if (!comment.getEmployee()
                .getId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "You can only delete your own comment"
            );
        }

        commentRepository.delete(comment);
    }

    // =========================================================
    // MAP RECOGNITION → RESPONSE
    // =========================================================

    private RecognitionResponse mapRecognitionToResponse(
            Recognition recognition) {

        RecognitionResponse response =
                new RecognitionResponse();

        response.setId(
                recognition.getId()
        );

        // Author
        Employee author =
                recognition.getAuthor();

        if (author != null) {

            response.setAuthorId(
                    author.getId()
            );

            response.setAuthorName(
                    buildEmployeeName(author)
            );
        }

        // Employee being recognized
        Employee employee =
                recognition.getEmployee();

        if (employee != null) {

            response.setEmployeeId(
                    employee.getId()
            );

            response.setEmployeeName(
                    buildEmployeeName(employee)
            );
        }

        response.setTitle(
                recognition.getTitle()
        );

        response.setMessage(
                recognition.getMessage()
        );

        response.setImageUrl(
                recognition.getImageUrl()
        );

        if (recognition.getType() != null) {

            response.setType(
                    recognition.getType().name()
            );
        }

        response.setReactionCount(
                reactionRepository.countByRecognitionId(
                        recognition.getId()
                )
        );

        response.setCommentCount(
                commentRepository.countByRecognitionId(
                        recognition.getId()
                )
        );

        response.setCreatedAt(
                recognition.getCreatedAt()
        );

        return response;
    }

    // =========================================================
    // MAP COMMENT → RESPONSE
    // =========================================================

    private CommentResponse mapCommentToResponse(
            Comment comment) {

        CommentResponse response =
                new CommentResponse();

        response.setId(
                comment.getId()
        );

        Employee employee =
                comment.getEmployee();

        response.setEmployeeId(
                employee.getId()
        );

        response.setEmployeeName(
                buildEmployeeName(employee)
        );

        response.setContent(
                comment.getContent()
        );

        response.setCreatedAt(
                comment.getCreatedAt()
        );

        return response;
    }

    // =========================================================
    // BUILD EMPLOYEE NAME
    // =========================================================

    private String buildEmployeeName(
            Employee employee) {

        String name =
                employee.getFirstName();

        if (employee.getLastName() != null
                && !employee.getLastName().isBlank()) {

            name +=
                    " " + employee.getLastName();
        }

        return name;
    }
}