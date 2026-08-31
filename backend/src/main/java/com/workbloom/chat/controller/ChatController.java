package com.workbloom.chat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workbloom.chat.dto.ChatMessageResponse;
import com.workbloom.chat.dto.ConversationRequest;
import com.workbloom.chat.dto.ConversationResponse;
import com.workbloom.chat.dto.MessageRequest;
import com.workbloom.chat.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> startConversation(
            @RequestParam Long employeeId,
            @RequestBody ConversationRequest request) {

        return ResponseEntity.ok(
                chatService.startConversation(employeeId, request)
        );
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                chatService.getConversations(employeeId)
        );
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationResponse> getConversation(
            @PathVariable Long conversationId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                chatService.getConversation(
                        conversationId,
                        employeeId
                )
        );
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam Long employeeId) {

        return ResponseEntity.ok(
                chatService.getMessages(
                        conversationId,
                        employeeId
                )
        );
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long conversationId,
            @RequestParam Long senderId,
            @RequestBody MessageRequest request) {

        return ResponseEntity.ok(
                chatService.sendMessage(
                        conversationId,
                        senderId,
                        request
                )
        );
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markConversationRead(
            @PathVariable Long conversationId,
            @RequestParam Long employeeId) {

        chatService.markConversationRead(
                conversationId,
                employeeId
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/conversations/{conversationId}/participants/{employeeId}")
    public ResponseEntity<Void> leaveConversation(
            @PathVariable Long conversationId,
            @PathVariable Long employeeId) {

        chatService.leaveConversation(
                conversationId,
                employeeId
        );

        return ResponseEntity.noContent().build();
    }
}