# Frontend Backend Integration Progress

Last updated: 2026-05-29

## Endpoint Inventory

Done in this pass:

- Auth: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`, logout/password/social endpoints exist in backend.
- Coach/Trainee core: profile, search, schedule, current profile, create/update schedule, availability endpoints exist in backend.
- Booking: create, my bookings, coach calendar, confirm, reject, cancel, cancel-by-coach, complete exist in backend.
- Admin: users, dashboard overview/revenue/transactions/alerts, subscriptions, finance, platform settings exist in backend.
- Subscription: packages, trainee catalog, coach catalog, current subscription, purchase history, purchase/change plan exist in backend.
- Wallet: current wallet, transactions, top-up, bank account, withdraw, admin wallet endpoints exist in backend.
- Chat: conversations, messages, unread-count, mark conversation read, and delete conversation exist in backend.
- Coach workspace: income, analytics, students, student tasks, student notes exist in backend.
- Video v1: public videos, like/save, saved videos, coach video update/delete/dashboard/analytics/submissions exist in backend.

Known backend gaps / caveats:

- Some old legacy paths still exist, for example `/api/calendar/traines`, `/api/dashboard/Traine`, and `/api/trainess/videos`. Frontend code now prefers wrappers around current or compatibility paths instead of spreading these strings in components.
- Some derived analytics widgets still use fallback values because the backend does not expose exact aggregates for every small UI card.

## Frontend Status

Note: "Done" below means the planned integration scope has been wired or verified. It does not mean every product UI is fully covered by backend APIs.

Done:

- Existing API modules kept: `auth`, `admin`, `coaches`, `bookings`, `trainees`.
- Added typed API modules: `platformSettings`, `subscriptions`, `wallet`, `chat`, `videos`, `coachWorkspace`, `progress`, `notifications`, `aiAnalysis`.
- Added matching frontend types for platform settings, subscriptions, wallet, chat, video, coach workspace, progress, notifications, AI analysis.
- `apiRequest` now supports `allowEmptyData` for successful endpoints that return `data: null`.
- Admin Settings now loads and saves platform settings through `/api/v1/admin/platform-settings`.
- Learner Subscription now loads trainee catalog through `/api/v1/subscriptions/trainee/catalog` and purchases plans through `/api/v1/subscriptions/purchase`, with fallback to previous local plan data if the API fails.
- Progress Tracking now loads overview, body metrics, exercise progress, heatmap, and achievements through `/api/v1/trainees/progress/*`, with local sample fallback.
- Learner/Coach messages now load conversations/messages through `/api/v1/chat/*`, send messages through the API, and mark opened conversations as read.
- Notification badges on learner, coach, and admin dashboards now use `/api/v1/notifications/unread-count`.
- Video Library now loads public video data through `/api/v1/videos`, with local sample fallback.
- Coach Income now loads income overview, chart data, transactions, top students, and payouts through `/api/v1/coach/income/*`.
- Coach Analytics now loads revenue, student progress, and video trend data through `/api/v1/coach/analytics/*`.
- Coach Video Studio now loads videos and coach submissions through video v1 API wrappers, with local sample fallback.
- Coach Students now loads student summaries/progress/details through `/api/v1/coach/students/*`, and task completion plus coach notes are synced through the coach workspace task/note endpoints with fallback behavior.
- Coach Dashboard overview now loads analytics, income, revenue chart, students, recent transactions, and coach calendar sessions from backend APIs with local fallback rows.
- Coach Subscription now loads coach catalog/current plan from `/api/v1/subscriptions/coach/catalog` and changes plans through `/api/v1/subscriptions/coach/plan`, with the static plan cards kept as fallback.
- Learner Dashboard overview now loads progress overview, heatmap, bookings, suggested coaches, achievements, current subscription, and chat unread count from backend APIs with local fallback rows.
- Coach Video Studio now sends upload requests to the backend multipart upload endpoint when a file is selected, updates metadata through `/api/v1/coach/videos/{id}`, deletes through `/api/v1/coach/videos/{id}`, and calls the Phase 7 submission-review wrapper with optimistic UI rollback.
- Admin screens were rechecked against current wrappers; `AdminUsers` status action now uses the typed `updateAdminUserStatus` import directly, removing the mixed static/dynamic admin import warning.

Doing:

- Phase 4 automated/build/runtime verification is complete.
- Remaining work is now tracked as a UI/BE gap backlog instead of a single "full API done" status.

Todo:

BE exists, FE not fully wired:

- Auth extended flows: logout, forgot/reset password, and Google/Facebook login are wired. `/api/v1/auth/me` has a wrapper but still needs app boot/session restore usage.
- Notifications: learner, coach, and admin dashboards now use a shared notification bell for list/read/read-all/delete plus unread count refresh.
- Wallet: wrappers exist for current wallet, transactions, top-up, top-up status, bank account, and withdraw. Add learner/coach wallet UI or wire these flows into subscription/income screens.
- Video interactions: `VideoLibrary` now calls like/unlike and save/unsave. Detail fetch, saved videos view, and analytics surfaces remain.
- Progress writes: wrappers exist for creating body metrics and exercise progress. Add UI forms only if learners should update these values directly.
- Coach/Trainee profile: backend supports current profile read/update, trainee update/delete, featured/trending coaches, available slots, and schedule-with-availability. Current UI only uses part of this surface.
- Booking lifecycle: coach schedule now calls cancel-by-coach and complete for confirmed bookings. UI already covers create, my bookings, confirm, reject, and learner cancel.
- Admin actions: user detail/delete and admin wallet review approve/reject are wired. Subscription update wrapper exists, but admin subscription edit UI is still pending.

UI mock/static, BE exists:

- Landing/Home: `FeaturedCoaches`, `SportCategories`, and `Pricing` now use `/api/coaches/featured`, `/api/categories`, and role-specific subscription catalogs with explicit fallback.
- Coach schedule: active schedule uses backend schedule/calendar bookings; mock sessions and static student names were removed from legacy helper code.
- Coach/Learner messages: chat API is wired, and local sample conversations remain fallback only. Simulated replies were removed.
- Coach video studio: list/upload/update/delete are API-backed; `INITIAL_VIDEOS` only appears after API failure, and API-loaded assignments derive from submissions.
- Coach analytics/income/progress widgets: fallback chart/card values are visibly labeled when backend aggregates are missing or fail.

UI needs new BE:

- AI analysis: `AIAnalysis` and `AIVideoAnalysis` are labeled demo/static flows. Frontend wrappers and contracts now exist for upload/analyze jobs, analysis history/detail, scores, and feedback.
- Coach Studio landing/demo: static demo is explicitly labeled as marketing. Productized usage contracts for recent videos, upload status, and analytics are documented in `phase-7-backend-contracts.md`.
- Testimonials/how-it-works: static content is acceptable unless admin-managed CMS content is required.
- Video 360 playback: FE playback works locally; a playback-event wrapper now exists for watch progress, view events, and bookmarks if backend tracking is added.
- Student assignment/submission review: coach submission review is wired to a Phase 7 wrapper with rollback, and student assignment contract is documented for backend implementation.

Verification pending:

- Provide or create learner/coach/admin test accounts.
- Smoke auth full flow: login, logout, session restore, forgot/reset password, and social login entry behavior.
- Smoke learner flow: coach search/detail, booking, cancel, progress, video like/save, subscription, and wallet.
- Smoke coach flow: calendar confirm/reject/complete/cancel-by-coach, students/tasks/notes, video upload/update/delete, income, analytics, and subscription plan change.
- Smoke admin flow: user detail/status/delete, subscription update, finance, wallet withdrawal approve/reject, and platform settings.
- Smoke notifications/chat: notification list/read/delete is wired but still needs role-authenticated smoke testing; chat send/read/unread count sync also needs smoke testing.
- Frontend build passed after Phase 7 frontend contract work on 2026-05-29; Vite still reports the existing large chunk warning.

Blocked:

- Some derived analytics widgets still use fallback values because there is no direct backend aggregate for that exact widget.

## Verification Notes

- Backend tests: `.\mvnw.cmd test` passed with 1 test on 2026-05-29. The test booted against the configured MySQL datasource and Hibernate emitted schema changes because `ddl-auto` is active.
- Frontend build: `npm run build` passed on 2026-05-29. The previous mixed static/dynamic import warning for `src/app/api/admin.ts` is resolved; Vite still warns about the large application chunk.
- Runtime HTTP checks passed: `http://127.0.0.1:8080/swagger-ui/index.html`, `http://127.0.0.1:8080/v3/api-docs`, and `http://127.0.0.1:5173` returned HTTP 200.
- OpenAPI contains the key integrated paths checked in Phase 4: Progress overview, Notifications, Chat unread count, Coach students, Coach income, Coach analytics, Video v1, Coach video update/delete, and Admin users.
- Browser smoke checks passed for `/` and `/auth`; the only console error observed was a non-blocking `favicon.ico` 404.
- Unauthenticated `GET /api/v1/videos` returned 401 in the direct smoke check; the FE wrapper calls it with authentication, so protected dashboard usage remains consistent with the current backend security setup.
