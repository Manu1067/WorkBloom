package com.workbloom.chat.service;

import java.util.List;

import com.workbloom.chat.dto.ChatMessageResponse;
import com.workbloom.chat.dto.ConversationRequest;
import com.workbloom.chat.dto.ConversationResponse;
import com.workbloom.chat.dto.MessageRequest;

public interface ChatService {

    ConversationResponse startConversation(
            Long employeeId,
            ConversationRequest request
    );

    List<ConversationResponse> getConversations(Long employeeId);

    ConversationResponse getConversation(
            Long conversationId,
            Long employeeId
    );

    List<ChatMessageResponse> getMessages(
            Long conversationId,
            Long employeeId
    );

    ChatMessageResponse sendMessage(
            Long conversationId,
            Long senderId,
            MessageRequest request
    );

    void markConversationRead(
            Long conversationId,
            Long employeeId
    );

    void leaveConversation(
            Long conversationId,
            Long employeeId
    );
}