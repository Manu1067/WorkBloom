package com.workbloom.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workbloom.chat.entity.ConversationParticipant;

@Repository
public interface ConversationParticipantRepository
        extends JpaRepository<ConversationParticipant, Long> {

    Optional<ConversationParticipant>
    findByConversation_IdAndEmployee_IdAndActiveTrue(
            Long conversationId,
            Long employeeId
    );

    List<ConversationParticipant> findByConversation_IdAndActiveTrue(
            Long conversationId
    );

    List<ConversationParticipant> findByEmployee_IdAndActiveTrue(
            Long employeeId
    );
}