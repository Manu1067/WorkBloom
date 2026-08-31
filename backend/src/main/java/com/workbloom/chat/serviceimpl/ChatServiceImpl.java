package com.workbloom.chat.serviceimpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.workbloom.chat.dto.ChatMessageResponse;
import com.workbloom.chat.dto.ConversationRequest;
import com.workbloom.chat.dto.ConversationResponse;
import com.workbloom.chat.dto.MessageRequest;
import com.workbloom.chat.dto.ParticipantResponse;
import com.workbloom.chat.entity.ChatMessage;
import com.workbloom.chat.entity.Conversation;
import com.workbloom.chat.entity.ConversationParticipant;
import com.workbloom.chat.entity.MessageStatus;
import com.workbloom.chat.repository.ChatMessageRepository;
import com.workbloom.chat.repository.ConversationParticipantRepository;
import com.workbloom.chat.repository.ConversationRepository;
import com.workbloom.chat.service.ChatService;
import com.workbloom.employee.entity.Employee;
import com.workbloom.employee.repository.EmployeeRepository;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final EmployeeRepository employeeRepository;

    public ChatServiceImpl(
            ConversationRepository conversationRepository,
            ConversationParticipantRepository participantRepository,
            ChatMessageRepository messageRepository,
            EmployeeRepository employeeRepository) {

        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public ConversationResponse startConversation(
            Long employeeId,
            ConversationRequest request) {

        Employee creator = findEmployee(employeeId);
        Set<Long> participantIds = new LinkedHashSet<>();
        participantIds.add(employeeId);

        if (request != null && request.getParticipantIds() != null) {
            participantIds.addAll(request.getParticipantIds());
        }

        if (participantIds.size() < 2) {
            throw new RuntimeException(
                    "A conversation needs at least two employees");
        }

        Conversation conversation = new Conversation();
        conversation.setCreatedBy(creator);
        conversation.setGroupConversation(participantIds.size() > 2);
        conversation.setTitle(
                request == null ? null : normalizeTitle(request.getTitle())
        );

        Conversation savedConversation =
                conversationRepository.save(conversation);
        LocalDateTime now = LocalDateTime.now();

        for (Long participantId : participantIds) {
            ConversationParticipant participant =
                    new ConversationParticipant();
            participant.setConversation(savedConversation);
            participant.setEmployee(findEmployee(participantId));
            participant.setJoinedAt(now);
            participantRepository.save(participant);
        }

        return toResponse(savedConversation, employeeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(
            Long employeeId) {

        findEmployee(employeeId);

        return participantRepository
                .findByEmployee_IdAndActiveTrue(employeeId)
                .stream()
                .map(participant ->
                        toResponse(
                                participant.getConversation(),
                                employeeId
                        ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationResponse getConversation(
            Long conversationId,
            Long employeeId) {

        return toResponse(
                findParticipantConversation(conversationId, employeeId),
                employeeId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(
            Long conversationId,
            Long employeeId) {

        findParticipantConversation(conversationId, employeeId);

        return messageRepository
                .findByConversation_IdOrderBySentAtAsc(conversationId)
                .stream()
                .filter(message -> message.getStatus()
                        != MessageStatus.DELETED)
                .map(ChatMessageResponse::fromEntity)
                .toList();
    }

    @Override
    public ChatMessageResponse sendMessage(
            Long conversationId,
            Long senderId,
            MessageRequest request) {

        Conversation conversation =
                findParticipantConversation(conversationId, senderId);

        if (request == null || request.getContent() == null
                || request.getContent().isBlank()) {
            throw new RuntimeException("Message content is required");
        }

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(findEmployee(senderId));
        message.setContent(request.getContent().trim());
        message.setStatus(MessageStatus.SENT);
        message.setSentAt(LocalDateTime.now());

        return ChatMessageResponse.fromEntity(
                messageRepository.save(message)
        );
    }

    @Override
    public void markConversationRead(
            Long conversationId,
            Long employeeId) {

        ConversationParticipant participant =
                findParticipant(
                        conversationId,
                        employeeId
                );

        LocalDateTime now = LocalDateTime.now();
        List<ChatMessage> messages =
                messageRepository
                        .findByConversation_IdOrderBySentAtAsc(
                                conversationId
                        );

        for (ChatMessage message : messages) {
            if (!message.getSender().getId().equals(employeeId)
                    && message.getStatus() == MessageStatus.SENT) {
                message.setStatus(MessageStatus.READ);
                message.setReadAt(now);
            }
        }

        messageRepository.saveAll(messages);
        participant.setLastReadAt(now);
        participantRepository.save(participant);
    }

    @Override
    public void leaveConversation(
            Long conversationId,
            Long employeeId) {

        ConversationParticipant participant =
                findParticipant(conversationId, employeeId);
        participant.setActive(false);
        participantRepository.save(participant);
    }

    private Conversation findParticipantConversation(
            Long conversationId,
            Long employeeId) {

        Conversation conversation =
                conversationRepository
                        .findByIdAndActiveTrue(conversationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Conversation not found"));

        findParticipant(conversationId, employeeId);
        return conversation;
    }

    private ConversationParticipant findParticipant(
            Long conversationId,
            Long employeeId) {

        return participantRepository
                .findByConversation_IdAndEmployee_IdAndActiveTrue(
                        conversationId,
                        employeeId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee is not a participant in this conversation"));
    }

    private Employee findEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));
    }

    private ConversationResponse toResponse(
            Conversation conversation,
            Long viewerId) {

        List<ConversationParticipant> participants =
                participantRepository
                        .findByConversation_IdAndActiveTrue(
                                conversation.getId()
                        );

        List<ParticipantResponse> participantResponses =
                new ArrayList<>();
        for (ConversationParticipant participant : participants) {
            participantResponses.add(
                    ParticipantResponse.fromEntity(participant)
            );
        }

        List<ChatMessage> messages =
                messageRepository
                        .findByConversation_IdOrderBySentAtAsc(
                                conversation.getId()
                        );

        ChatMessage lastMessage = messages.isEmpty()
                ? null
                : messages.get(messages.size() - 1);

        long unreadCount = messages.stream()
                .filter(message ->
                        !message.getSender().getId().equals(viewerId)
                                && message.getStatus()
                                        == MessageStatus.SENT)
                .count();

        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());
        response.setTitle(conversation.getTitle());
        response.setGroupConversation(
                conversation.isGroupConversation()
        );
        response.setParticipants(participantResponses);
        response.setUnreadCount(unreadCount);

        if (lastMessage != null
                && lastMessage.getStatus() != MessageStatus.DELETED) {
            response.setLastMessage(lastMessage.getContent());
            response.setLastMessageAt(lastMessage.getSentAt());
        }

        return response;
    }

    private String normalizeTitle(String title) {
        return title == null || title.isBlank()
                ? null
                : title.trim();
    }
}