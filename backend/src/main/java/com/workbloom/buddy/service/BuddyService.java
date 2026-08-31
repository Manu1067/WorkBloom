
package com.workbloom.buddy.service;

import java.util.List;

import com.workbloom.buddy.dto.BuddyResponse;
import com.workbloom.buddy.dto.CreateBuddyRequest;

public interface BuddyService {

    BuddyResponse sendRequest(
            Long requesterId,
            CreateBuddyRequest request
    );

    List<BuddyResponse> getReceivedRequests(
            Long employeeId
    );

    List<BuddyResponse> getSentRequests(
            Long employeeId
    );

    BuddyResponse acceptRequest(
            Long requestId,
            Long employeeId
    );

    BuddyResponse rejectRequest(
            Long requestId,
            Long employeeId
    );

    BuddyResponse getMyBuddy(
            Long employeeId
    );
}
