# WorkBloom Frontend Architecture Audit

## 1. Current Frontend Architecture
- **Framework & Tooling**: React (v19.2.7), Vite (v8.1.1), JavaScript (ES Modules), Vanilla CSS.
- **Entry Points**: `index.html` -> `src/main.jsx` -> `src/App.jsx`.
- **Routing**: Custom browser history-based routing via `useRoute` hook in `App.jsx`.
- **State Management**: React local state (`useState`), `localStorage` (`workbloom_token`, `workbloom_user`, `workbloom_employee`, `workbloom_settings`), and global Toast notifications (`ToastContext.jsx`).
- **Styling**: `src/index.css` (37KB) containing custom CSS variables, layout systems, component classes, animations, and responsive media queries.
- **Isolated Directory**: Unused `frontend/` directory is left untouched as required.

## 2. Current Pages
- `DashboardView.jsx` (`/dashboard`): Employee overview, mood prompt, quick stats, activity cards.
- `WellnessView.jsx` (`/wellness`): Mood tracker, wellness logs, AI wellness insight, counselling.
- `TravelView.jsx` (`/travel`): Questionnaire, recommendations, catalog search, multi-destination route optimizer, interactive `RouteMap`.
- `EventsView.jsx` (`/events`): Workshop/event listing, event creation, registration.
- `CommunityView.jsx` (`/community`): Social feed, posts, comments, likes.
- `RecognitionView.jsx` (`/recognition`): Peer appreciation feed, badge awards, achievements.
- `BuddyView.jsx` (`/buddy`): Mentorship / buddy requests and current match.
- `LearningView.jsx` (`/learning`): Course directory, enrollment, progress tracking.
- `ClubsView.jsx` (`/clubs`): Employee interest clubs, join/leave management.
- `ImpactView.jsx` (`/impact`): Volunteering & social contribution events.
- `ChatView.jsx` (`/chat`): Direct & group conversations, messaging UI.
- `DirectoryView.jsx` (`/directory`): Employee search, filtering, profile drawer.
- `AnalyticsView.jsx` (`/analytics`): Workplace analytics & wellbeing metrics.
- `ProfileView.jsx` (`/profile`): Employee profile viewer & editor.
- **Auth Views**: Integrated in `App.jsx` (`AuthPage` covering `/login`, `/register`, `/forgot-password`).

## 3. Current API Architecture
- Monolithic mock helper file `src/api.js` using raw `fetch` against `/api/*`.
- Empty modular API placeholders in `src/api/` (`authApi.js`, `employeeApi.js`, etc.) waiting for Phase 3 implementation.
- `VITE_API_BASE_URL` configurable via environment variables (defaulting to `/api` in Vite proxy setup).

## 4. Mock API Dependencies
- `server-api.js`: Express middleware attached to Vite dev server serving mock endpoints on `/api/*`.
- Monolithic `src/api.js`: Standardizes mock calls.
- Fake Endpoints: `/auth/switch-role` (switches mock user role in memory), `/integrations/health`.

## 5. Backend API Endpoints Discovered (Spring Boot Java)
### Auth Controller (`/api/auth`)
- `POST /api/auth/register` (RegisterRequest -> AuthResponse)
- `POST /api/auth/login` (LoginRequest -> AuthResponse)
- `POST /api/auth/forgot-password` (ForgotPasswordRequest -> String)
- `POST /api/auth/reset-password` (ResetPasswordRequest -> String)
- `POST /api/auth/change-password` (ChangePasswordRequest -> String)

### Employee Controller (`/api/employees`)
- `POST /api/employees` (CreateEmployeeRequest -> EmployeeHRResponse)
- `GET /api/employees` (search, department, status, Pageable -> Page<EmployeeSummaryResponse>)
- `GET /api/employees/{id}` (EmployeeProfileResponse)
- `PUT /api/employees/{id}` (UpdateEmployeeRequest -> EmployeeHRResponse)
- `PUT /api/employees/{id}/profile` (UpdateEmployeeProfileRequest [phone, profileImage] -> EmployeeProfileResponse)
- `PATCH /api/employees/{id}/status` (UpdateEmployeeStatusRequest -> EmployeeHRResponse)
- `DELETE /api/employees/{id}` (Deactivate employee)

### Dashboard Controller (`/api/dashboard`)
- `GET /api/dashboard/employee/{employeeId}` (EmployeeDashboardResponse)
- `GET /api/dashboard/admin` (AdminDashboardResponse)

### Wellness Controller (`/api/wellness`) & Counselling Controller (`/api/counselling`)
- `POST /api/wellness/mood?employeeId={id}` (MoodRequest -> WellnessResponse)
- `POST /api/wellness?employeeId={id}` (WellnessRequest -> WellnessResponse)
- `GET /api/wellness/mood?employeeId={id}` (List<WellnessResponse>)
- `GET /api/wellness?employeeId={id}` (List<WellnessResponse>)
- `POST /api/counselling` (CreateCounsellingRequest -> CounsellingResponse)
- `GET /api/counselling/employee/{employeeId}` (List<CounsellingResponse>)
- `GET /api/counselling` (List<CounsellingResponse>)
- `PATCH /api/counselling/{id}/approve|reject|cancel|complete`

### AI Wellness Controller (`/api/ai/wellness`)
- `POST /api/ai/wellness/analyze?employeeId={id}` (AiWellnessRequest -> AiWellnessResponse)

### Travel Controllers (`/api/travel` & `/api/wellness/travel`)
- `GET /api/travel/destinations` (category param -> List<DestinationSummaryResponse>)
- `GET /api/travel/destinations/{id}` (DestinationResponse)
- `GET /api/travel/destinations/{id}/images` (List<DestinationImageResponse>)
- `GET /api/travel/recommend?employeeId={id}` (TravelRecommendationResponse)
- `POST /api/travel/recommendations` (MoodTravelRecommendationRequest -> List<TravelRecommendationResponse>)
- `GET /api/travel/questions` (List<TravelQuestionResponse>)
- `POST /api/travel/preferences?employeeId={id}` (TravelPreferenceRequest -> TravelPreferenceResponse)
- `GET /api/travel/preferences?employeeId={id}` (TravelPreferenceResponse)
- `POST /api/travel/routes/optimize` (List<Long> destinationIds -> TravelRouteResponse)

### Event Controller (`/api/events`)
- `POST /api/events?organizerId={id}` (EventRequest -> EventResponse)
- `PUT /api/events/{eventId}?organizerId={id}` (EventRequest -> EventResponse)
- `DELETE /api/events/{eventId}?organizerId={id}`
- `GET /api/events` (type param -> List<EventResponse>)
- `GET /api/events/{eventId}`
- `POST /api/events/{eventId}/registrations` (EventRegistrationRequest -> EventRegistrationResponse)
- `DELETE /api/events/{eventId}/registrations?employeeId={id}`
- `GET /api/events/employee/{employeeId}/registrations`

### Community Controller (`/api/community`)
- `POST /api/community/posts?authorId={id}` (PostRequest -> PostResponse)
- `GET /api/community/posts?viewerId={id}` (List<PostResponse>)
- `GET /api/community/posts/{postId}?viewerId={id}`
- `PUT /api/community/posts/{postId}?authorId={id}`
- `DELETE /api/community/posts/{postId}?authorId={id}`
- `POST /api/community/posts/{postId}/likes?employeeId={id}`
- `DELETE /api/community/posts/{postId}/likes?employeeId={id}`
- `POST /api/community/posts/{postId}/comments?authorId={id}` (CommentRequest -> CommentResponse)
- `GET /api/community/posts/{postId}/comments` (List<CommentResponse>)
- `DELETE /api/community/posts/{postId}/comments/{commentId}?authorId={id}`

### Recognition Controller (`/api/recognition`)
- `POST /api/recognition?authorId={id}` (RecognitionRequest -> RecognitionResponse)
- `GET /api/recognition/feed` (List<RecognitionResponse>)
- `GET /api/recognition/employee/{employeeId}` (List<RecognitionResponse>)
- `POST /api/recognition/badges` (BadgeRequest -> Badge)
- `GET /api/recognition/badges` (List<Badge>)
- `POST /api/recognition/{recognitionId}/reactions` (ReactionRequest -> ReactionResponse)
- `POST /api/recognition/{recognitionId}/comments` (CommentRequest -> CommentResponse)

### Buddy Controller (`/api/buddy`)
- `POST /api/buddy/request?requesterId={id}` (CreateBuddyRequest -> BuddyResponse)
- `GET /api/buddy/requests/received?employeeId={id}` (List<BuddyResponse>)
- `GET /api/buddy/requests/sent?employeeId={id}` (List<BuddyResponse>)
- `PUT /api/buddy/request/{requestId}/accept?employeeId={id}`
- `PUT /api/buddy/request/{requestId}/reject?employeeId={id}`
- `GET /api/buddy/my-buddy?employeeId={id}` (BuddyResponse)

### Learning Controller (`/api/learning`)
- `POST /api/learning/courses` (CourseRequest -> CourseResponse)
- `GET /api/learning/courses` (List<CourseResponse>)
- `POST /api/learning/courses/enroll` (EnrollmentRequest -> EnrollmentResponse)
- `GET /api/learning/enrollments` (List<EnrollmentResponse>)
- `PUT /api/learning/enrollments/{enrollmentId}/start`
- `PUT /api/learning/enrollments/{enrollmentId}/complete`

### Club Controller (`/api/clubs`)
- `POST /api/clubs?creatorId={id}` (ClubRequest -> ClubResponse)
- `GET /api/clubs` (List<ClubResponse>)
- `GET /api/clubs/{clubId}`
- `PUT /api/clubs/{clubId}?creatorId={id}`
- `PATCH /api/clubs/{clubId}/archive?creatorId={id}`
- `POST /api/clubs/{clubId}/members?employeeId={id}` (ClubMemberResponse)
- `DELETE /api/clubs/{clubId}/members?employeeId={id}`
- `GET /api/clubs/{clubId}/members` (List<ClubMemberResponse>)

### Impact Controller (`/api/impact`)
- `POST /api/impact/events` (VolunteerEventRequest)
- `GET /api/impact/events` (List<VolunteerEventRequest>)
- `POST /api/impact/events/register?employeeId={id}` (RegistrationRequest -> VolunteerResponse)
- `GET /api/impact/registrations?employeeId={id}` (List<VolunteerResponse>)
- `PUT /api/impact/registrations/{registrationId}/cancel?employeeId={id}`

### Chat Controller (`/api/chat`)
- `POST /api/chat/conversations?employeeId={id}` (ConversationRequest -> ConversationResponse)
- `GET /api/chat/conversations?employeeId={id}` (List<ConversationResponse>)
- `GET /api/chat/conversations/{conversationId}?employeeId={id}`
- `GET /api/chat/conversations/{conversationId}/messages?employeeId={id}` (List<ChatMessageResponse>)
- `POST /api/chat/conversations/{conversationId}/messages?senderId={id}` (MessageRequest -> ChatMessageResponse)
- `POST /api/chat/conversations/{conversationId}/read?employeeId={id}`

### Notification Controller (`/api/notifications`)
- `POST /api/notifications` (NotificationRequest -> NotificationResponse)
- `GET /api/notifications/employee/{employeeId}` (List<NotificationResponse>)
- `GET /api/notifications/employee/{employeeId}/unread` (List<NotificationResponse>)
- `GET /api/notifications/employee/{employeeId}/unread-count` (Map<String, Long>)
- `PATCH /api/notifications/{notificationId}/read`
- `PATCH /api/notifications/employee/{employeeId}/read-all`
- `DELETE /api/notifications/{notificationId}`

### Analytics Controller (`/api/analytics`)
- `GET /api/analytics/overview` (AnalyticsOverviewResponse)

## 6. Frontend/Backend Mismatches
1. **Auth Switch Role**: `/auth/switch-role` does not exist in Spring Boot. Role is determined by backend JWT payload & employee details.
2. **AI Wellness**: Frontend called `/wellness/ai-insight` (POST). Real endpoint: `/api/ai/wellness/analyze?employeeId={id}` (POST).
3. **Recognition Feed**: Frontend called `/recognition` (GET). Real endpoint: `/api/recognition/feed` (GET).
4. **Travel Recommendation**: Frontend called `/travel/ai-recommendation`. Real endpoint: `/api/travel/recommend?employeeId={id}` (GET) or `/api/travel/recommendations` (POST).
5. **Buddy Status & Response**: Frontend called `/buddy/status` and `/buddy/request/{id}/respond`. Real endpoints: `/api/buddy/my-buddy?employeeId={id}` (GET) and `/api/buddy/request/{requestId}/accept` or `reject` (PUT).
6. **Club Membership**: Frontend called `/clubs/{id}/toggle`. Real endpoint: `POST /api/clubs/{clubId}/members?employeeId={id}` (join) and `DELETE /api/clubs/{clubId}/members?employeeId={id}` (leave).
7. **Event Registrations**: Frontend called `/events/{id}/rsvp`. Real endpoint: `POST /api/events/{eventId}/registrations` with `{ employeeId }`.
8. **Community Likes**: Frontend called `/community/posts/{id}/like`. Real endpoint: `POST /api/community/posts/{postId}/likes?employeeId={id}`.
9. **Notifications Mark Read**: Frontend used `POST /notifications/{id}/read` and `POST /notifications/read-all`. Real endpoints: `PATCH /api/notifications/{notificationId}/read` and `PATCH /api/notifications/employee/{employeeId}/read-all`.
10. **Profile Update**: Frontend allowed editing fields like department/designation. Backend `UpdateEmployeeProfileRequest` strictly allows `phone` and `profileImage` for employee profile updates.

## 7. Authentication Architecture
- Token-based JWT flow stored in `localStorage` under `workbloom_token`.
- User and employee state stored under `workbloom_user` and `workbloom_employee`.
- Centralized `AuthContext.jsx` and `ProtectedRoute.jsx` will encapsulate token storage, session restoration, header generation (`Authorization: Bearer <token>`), and 401 token expiry handling.

## 8. Existing Reusable Components
- `RouteMap.jsx`: MapLibre-GL / OpenStreetMap map viewer supporting destination markers and route polylines.
- `ToastContext.jsx`: Global toast notifications.
- `App.jsx` UI elements: `Icon`, `Avatar`, `Tooltip`, `SettingsModal`, `Sidebar`, `Shell`.

## 9. Existing Visual Assets
- Root `assets/`: `logo/`, `banners/`, `illustrations/`, `icons/`, `favicon/`.
- `public/`: `favicon.svg`, `icons.svg`.
- `src/assets/`: `hero.png`, `react.svg`, `vite.svg`.

## 10. Recommended Implementation Order
1. **Phase 3**: Core API client (`apiClient.js`), domain API modules in `src/api/`, `AuthContext.jsx`, `ProtectedRoute.jsx`, App shell routing.
2. **Phase 4**: Dashboard, Directory, Wellness (with AI Wellness endpoint), Travel (Questionnaire + Recommendations + Map + Route Optimization).
3. **Phase 5**: Events, Community, Recognition, Learning.
4. **Phase 6**: Buddy, Clubs, Impact, Chat, Analytics, Notifications, Profile.
5. **Phase 7**: Responsive refinement, Accessibility, Animations, Visual Polish.
6. **Phase 8**: Build, Linting, Verification, Progress Report (`FRONTEND_PROGRESS.md`), Zip generation.
