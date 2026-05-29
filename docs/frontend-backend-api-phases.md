# Frontend/Backend API Integration Phases

Last updated: 2026-05-29

## Summary

This plan tracks FE/BE integration work for COACHFINDER. Phases 1-4 record the completed planned integration scope. They do not mean every product UI is fully wired to backend APIs yet.

Use these status groups for the remaining work:

- **UI wired to BE**: the UI has an API wrapper under `src/app/api/*` and a page/component calls the real backend flow.
- **BE exists, FE not fully wired**: backend endpoints exist, and may already have wrappers, but the UI uses only part of the API surface.
- **UI needs BE**: the UI is static/mock/demo behavior, or the product behavior exists in frontend only, without a clear backend endpoint yet.

## Current API Status

Already available:

- Auth: login, register, current user, logout, password reset, Google/Facebook login.
- Coach/Trainee: current profile, create/update profile, coach search, schedule, availability, schedule update/delete.
- Booking: create, my bookings, confirm, reject, cancel, coach cancel, complete.
- Admin: users, overview, revenue chart, transactions, subscriptions, finance, platform settings.
- Subscription and Wallet: catalogs, current subscription, purchase/change plan, wallet, top-up, withdrawal, admin wallet review.
- Coach workspace: income, analytics, students, student tasks, student notes.
- Video v1: public videos, like/save, saved videos, coach video update/delete/dashboard/analytics/submissions.

Added during integration:

- Progress endpoints under `/api/v1/trainees/progress/*`.
- Notification endpoints under `/api/v1/notifications`.
- Chat helper endpoints for unread count, mark conversation read, and delete conversation.

## Phase 1: Backend Missing APIs

- Add Progress API:
  - `GET /api/v1/trainees/progress/overview`
  - `GET/POST /api/v1/trainees/progress/body-metrics`
  - `GET/POST /api/v1/trainees/progress/exercises`
  - `GET /api/v1/trainees/progress/achievements`
  - `GET /api/v1/trainees/progress/streak`
  - `GET /api/v1/trainees/progress/heatmap`
- Add Notifications API:
  - `GET /api/v1/notifications`
  - `PUT /api/v1/notifications/{id}/read`
  - `PUT /api/v1/notifications/read-all`
  - `DELETE /api/v1/notifications/{id}`
- Extend Chat API:
  - `GET /api/v1/chat/unread-count`
  - `PUT /api/v1/chat/conversations/{conversationId}/read`
  - `DELETE /api/v1/chat/conversations/{conversationId}`
- Keep the existing backend style: controller/service/repository layers, DTO response/request classes, `ApiResponse`, and JWT current user ownership.

Status: completed.

## Phase 2: Frontend API Wiring

- Connect `ProgressTracking` to `src/app/api/progress.ts`.
- Connect learner/coach/admin notification bells to `src/app/api/notifications.ts` where notification UI exists.
- Connect `CoachMessages` and `Messaging` to `src/app/api/chat.ts`.
- Keep local fallback data, loading, and error states so pages remain usable if an API call fails.

Status: completed for the listed high-priority screens.

## Phase 3: Replace Remaining Mocks

- Coach side: replace high-priority mock data in `CoachStudents`, `CoachVideoStudio`, `CoachIncome`, and `CoachAnalytics` with existing backend APIs.
- Coach dashboard overview cards/charts/lists should use coach workspace, bookings, and income APIs.
- Learner side: verify real API flows in `VideoLibrary`, `TrainingSchedule`, and `LearnerSubscription`.
- Admin side: verify response compatibility for `AdminUsers`, `AdminOverview`, `AdminTransactions`, `AdminSubscriptions`, and `AdminFinance`.

Status: completed for the planned integration scope. Coach Income, Analytics, Video Studio, Students, Dashboard overview, Coach Subscription, Learner Dashboard overview, Video Library, Learner Subscription, and Admin wrapper compatibility have been wired or verified.

## Phase 4: Verification

- Run backend tests with `.\mvnw.cmd test`.
- Run frontend build with `npm run build`.
- Manually smoke test login, admin dashboard, coach search, booking creation, booking approval, chat, progress, notifications, and video library.

Status: completed for automated/build/runtime verification. Backend tests and frontend build pass; backend Swagger/OpenAPI and frontend dev server respond with HTTP 200; key integrated endpoint paths are present in OpenAPI; public homepage and auth page render in browser smoke checks. Deeper role-based smoke flows still require valid learner/coach/admin test credentials.

## Remaining UI/BE Gap Plan

Phases 5-8 are the new backlog after the completed planned scope above.

| Area | UI status | BE status | Next phase | Notes |
| --- | --- | --- | --- | --- |
| Auth extended flows | Partial | Exists | Phase 5 | Login/register are wired; `/me`, logout, password reset, Google/Facebook login need full UI wiring. |
| Notifications | Partial | Exists | Phase 5 | Dashboard badges use unread count; list/read/read-all/delete need dropdown or notification center UI. |
| Wallet | Partial | Exists | Phase 5 | Wallet wrappers exist; no dedicated learner/coach wallet UI is fully wired yet. |
| Video interactions | Partial | Exists | Phase 5 | Video list is wired; detail, like/save/saved state, and analytics usage need UI wiring. |
| Progress write flows | Partial | Exists | Phase 5 | Progress reads are wired; create body metrics and exercise progress need UI forms if required. |
| Coach/Trainee profile | Partial | Exists | Phase 5 | Search/detail/schedule/profile create are wired; current profile update, featured/trending, availability views need coverage. |
| Booking lifecycle | Partial | Exists | Phase 5 | Create/my bookings/confirm/reject/cancel are wired; coach cancel and complete actions need clear UI. |
| Admin actions | Partial | Exists | Phase 5 | Dashboard/list/status are wired; user detail/delete, subscription update, and wallet review need UI wiring. |
| Landing/home content | Wired with fallback | Exists for some data | Phase 6 done | Featured coaches, categories, and pricing now use existing endpoints where available. |
| Coach schedule fallback | Wired | Exists for bookings/calendar | Phase 6 done | Active schedule uses backend schedule/calendar bookings; legacy static session/student constants were removed. |
| Messaging fallback | Wired with fallback | Exists | Phase 6 done | Chat is wired; local sample conversations remain fallback only, and simulated replies were removed. |
| Coach video studio fallback | Wired with fallback | Exists for videos/submissions | Phase 6 done | Video CRUD is wired; fallback videos are only used after API failure, and API assignments derive from submissions. |
| Derived analytics widgets | Labeled fallback | Partial | Phase 6 done / Phase 7 if new aggregates are needed | Fallback chart/card values are visibly labeled when aggregate APIs fail or are incomplete. |
| AI analysis | Demo, contract ready | Needs BE | Phase 7 done for FE/contracts | Analysis upload, scoring, history, and feedback wrappers/contracts are defined. |
| Coach Studio demo | Marketing demo | Needs BE if productized | Phase 7 done | Kept static and labeled as marketing demo; product endpoints are documented. |
| Testimonials/how-it-works | Static | Needs BE only for CMS | Phase 7 done | Kept static unless admins need CMS-style content management. |
| Video 360 playback events | Frontend-only, contract ready | Needs BE if tracking | Phase 7 done for contracts | Playback stays FE; watch progress/bookmark event contract is defined. |
| Role smoke tests | Runner added, credentials pending | Exists | Phase 8 ready | `npm run smoke:phase8` verifies configured learner/coach/admin accounts; missing credentials are skipped. |

## Phase 5: BE Exists, FE Not Fully Wired

Status: partially implemented.

- Auth: logout now calls `/api/v1/auth/logout` before local session cleanup on learner/coach/admin dashboards. Forgot/reset password and Google/Facebook login endpoints are wired from `AuthPage` through API wrappers. `/api/v1/auth/me` has a wrapper but is not yet used for app boot/session restore.
- Notifications: learner, coach, and admin dashboards now use a shared notification bell that loads `/api/v1/notifications`, supports mark read, mark all read, delete, and unread count refresh.
- Wallet: expose wallet balance, transactions, top-up, bank account, withdraw, and top-up status from `/api/v1/wallets/*` in learner/coach UI, or document where these should live inside subscription/income screens.
- Video: `VideoLibrary` now wires like/unlike and save/unsave actions through video v1 wrappers with optimistic UI rollback. Saved video list, direct detail fetch, and coach video analytics still need product surfaces.
- Progress: add UI forms for `POST /api/v1/trainees/progress/body-metrics` and `POST /api/v1/trainees/progress/exercises` if learners should update these values from the app.
- Coach/Trainee profile: wire current profile read/update, trainee profile update/delete, coach featured/trending, available slots, and schedule-with-availability where those flows are visible.
- Booking: coach schedule now surfaces complete and coach cancel actions for confirmed bookings. Existing UI also covers create, my bookings, confirm, reject, and learner cancel.
- Admin: admin users now support backend user detail and soft delete/deactivate actions. Admin finance now loads admin wallet overview and pending withdraw requests, with approve/reject actions. Subscription update wrapper exists, but the admin subscriptions table still needs a full edit action surface.

## Phase 6: UI Static/Mock That Can Use Existing BE

Status: completed for the existing backend-supported scope.

- Landing/Home: `FeaturedCoaches` now loads `/api/coaches/featured`, `SportCategories` loads `/api/categories`, and `Pricing` loads role-specific subscription catalogs. Static arrays remain as explicit fallback if the public API call fails or returns no usable rows.
- Coach schedule: the active schedule surface uses coach schedule and coach calendar bookings APIs. Legacy mock session and static student-list constants were removed from fallback-era helper code.
- Coach/Learner messages: API conversations/messages remain the primary flow; local sample conversations are kept as fallback. Learner-side simulated coach auto-replies have been removed.
- Coach video studio: API-backed load/upload/update/delete is the primary flow. `INITIAL_VIDEOS` is only loaded after API failure, with a visible fallback notice. API-loaded video assignment derives from submission trainee names when available. Productized manual student assignment remains a Phase 7 decision unless tied to an existing student/submission API.
- Coach analytics/income/progress widgets: coach analytics and income now show visible fallback notices naming the backend aggregate groups involved. Progress already shows a fallback notice when progress APIs fail.

## Phase 7: UI Needs New or Clearer BE

Status: completed for frontend contracts and demo labeling. Backend implementation is still required for new endpoints.

- AI analysis: added `src/app/api/aiAnalysis.ts` and `src/app/types/aiAnalysis.ts` for upload/analyze jobs, history, detail, result scores, and feedback. `AIAnalysis` and `AIVideoAnalysis` now label their current content as demo/static until the backend exists.
- Coach Studio landing/demo: kept static as marketing content and labeled it as a demo. Productized endpoints for upload/status/analytics are documented in `docs/phase-7-backend-contracts.md`.
- Testimonials/how-it-works: remains static. No backend needed unless admin-managed CMS content becomes a requirement.
- Video 360 playback: playback remains frontend-only. Added `recordVideoPlaybackEvent` wrapper for future watch progress, events, and bookmarks.
- Student assignment/submission review: added wrappers for video assignment and coach submission review. `CoachVideoStudio` now calls the review wrapper with optimistic rollback; backend route confirmation/implementation is still required.

## Phase 8: Role-Based Verification

Status: smoke runner added; full role verification still needs real learner/coach/admin credentials.

- Added `scripts/phase8-smoke.mjs` and `npm run smoke:phase8`.
- Added `docs/phase-8-role-smoke.md` with required environment variables, coverage, and manual follow-up items.
- Automated smoke covers OpenAPI path presence, login, `/api/v1/auth/me`, representative protected endpoints, notifications, chat unread count, and logout for each configured role.
- Missing credential pairs are reported as `SKIP` so the same command can run before all accounts are available.
- Latest local run on 2026-05-29: frontend build passed; `npm run smoke:phase8` failed because backend OpenAPI at `http://localhost:8080/v3/api-docs` was unreachable, and all three role checks were skipped because credentials were not configured.
- Destructive or payment-like actions remain manual with disposable data: booking create/cancel/confirm/reject/complete, video upload/update/delete, subscription changes, wallet top-up/withdraw/review, user status/delete, and cross-role chat sync.

## Phase 9: Environment and Role Test Data

Status: tooling ready; backend runtime and admin credentials still required.

Goal: unblock real role-based verification before adding more UI surfaces.

- Documented the backend URL used by the frontend and smoke runner in `docs/phase-9-environment-role-test-data.md`.
- Added `npm run phase9:prepare` to check OpenAPI, register/login disposable learner and coach accounts, verify `/api/v1/auth/me`, and print smoke-test environment variables.
- Create or collect disposable learner, coach, and admin accounts.
- Store smoke-test credentials through local environment variables only, not committed files.
- Re-run `npm run smoke:phase8` until OpenAPI, login, `/api/v1/auth/me`, representative protected endpoints, and logout pass for all configured roles.
- Added seed-data notes for bookings, coach videos, subscriptions, wallet balances, notifications, and chat conversations.
- Latest local Phase 9 attempt on 2026-05-29 could not complete because no backend was listening on `http://localhost:8080`; admin credentials are still required because the backend blocks public `ADMIN` registration.

Acceptance:

- `npm run build` passes.
- `npm run smoke:phase8` passes with learner, coach, and admin credentials configured.
- Manual destructive/payment-like flows are listed with the exact disposable records to use.

## Phase 10: Auth Session Restore and Account Flows

Status: implemented; authenticated smoke pending Phase 9 backend/credentials.

Goal: make authentication behavior complete across refresh, logout, and account recovery.

- Wired `getCurrentUser` into protected route boot/session restore so dashboard refreshes do not rely only on local cached user data.
- Normalized unauthorized handling so API 401 responses clear local auth state and emit an auth-expired event.
- Protected routes now redirect unauthenticated users to `/auth`, redirect wrong-role users to their restored role dashboard, and redirect valid sessions away from `/auth`.
- Smoke login, logout, refresh, protected dashboard access, forgot password, reset password entry behavior, and social login button behavior.
- Verify role routing after session restore for learner, coach, and admin.
- Added detailed notes in `docs/phase-10-auth-session-restore.md`.

Acceptance:

- Refreshing each dashboard restores the current user from `/api/v1/auth/me`.
- Invalid tokens are handled without broken dashboards or stale role state.
- Auth smoke notes are added to the progress doc.

## Phase 11: Wallet and Payment-Like User Flows

Status: implemented in FE; authenticated smoke pending Phase 9 backend/credentials.

Goal: expose the existing wallet API in learner/coach-facing UI.

- Added shared `WalletPanel` using the existing wallet wrappers.
- Wired wallet balance and transaction history into learner subscription and coach income payout screens.
- Wired top-up creation and top-up status into learner wallet UI.
- Wired bank account read/save and withdraw request flow into coach payout UI.
- Keep payment-like actions guarded with clear confirmation and disposable-test guidance.
- Recheck admin wallet withdrawal review approve/reject against learner/coach wallet state.
- Added detailed notes in `docs/phase-11-wallet-payment-flows.md`.

Acceptance:

- Learner/coach can see wallet balance and transactions from backend data.
- Coach can manage payout bank details and create withdraw requests if enabled by product rules.
- Admin withdrawal review updates are visible in the relevant wallet/admin UI after refresh.

## Phase 12: Video Detail, Saved Videos, Analytics, and Events

Status: implemented in FE for detail, saved videos, analytics, and playback events; assignment UI pending stable trainee IDs.

Goal: finish the video API surface that already has frontend wrappers.

- Wired the learner video detail surface to `getVideo`.
- Added a saved videos view toggle using `getSavedVideos`.
- Added playback event calls through `recordVideoPlaybackEvent` for detail open, detail close, and video bookmark/save.
- Wired coach video studio detail panel to `getCoachVideoAnalytics`.
- Manual student assignment remains pending because the current UI has trainee names from submissions, not stable trainee ID selections for `assignCoachVideoStudents`.
- Added detailed notes in `docs/phase-12-video-detail-saved-analytics-events.md`.

Acceptance:

- Public video list, detail, like/unlike, save/unsave, and saved videos work through backend APIs.
- Coach video analytics displays backend data or a clearly labeled fallback.
- Playback events and assignment features are only marked complete after backend routes are verified.

## Phase 13: Progress Write Forms and Profile Management

Status: implemented in FE for learner progress writes, coach profile read/update, and coach schedule availability loading; trainee profile update/delete remains a product-rule decision.

Goal: close remaining user-owned data update flows.

- Added learner forms for body metrics and exercise progress on the progress screen.
- Wired current coach profile read/update on the coach profile setup/edit route.
- Left trainee profile update/delete pending until product rules define whether learners can edit or delete that profile data from the app.
- Added coach available-slots and schedule-with-availability API wrappers.
- Updated coach detail/booking screens to prefer schedule-with-availability and fall back to the legacy schedule endpoint.
- Rechecked featured/trending coach usage: featured is wired; trending is not used by the current UI.
- Added detailed notes in `docs/phase-13-progress-profile-availability.md`.

Acceptance:

- Learner-entered progress writes are visible after refresh.
- Coach and trainee profile updates persist through backend APIs.
- Booking screens use backend availability instead of derived or stale local assumptions.

## Phase 14: Admin Subscription Editing and Remaining Admin Actions

Status: pending.

Goal: finish the admin action surface that already has partial wrappers.

- Add a subscription edit action surface using the existing admin subscription update wrapper.
- Verify admin user detail, status, and delete/deactivate flows with disposable users.
- Verify platform settings changes against frontend pricing/commission displays.
- Add focused smoke notes for admin finance, wallet review, subscriptions, and user management.

Acceptance:

- Admin can edit subscription records through UI and see persisted backend state.
- Admin destructive actions are confirmed and tested only on disposable data.
- Admin screens no longer rely on hidden static values for editable backend-managed data.

## Phase 15: Backend Contract Implementation for Phase 7 Features

Status: pending backend work.

Goal: implement or explicitly defer the features that cannot be completed in frontend alone.

- Implement AI analysis job, history, detail, result, and feedback endpoints from `docs/phase-7-backend-contracts.md`, or keep the UI labeled as demo.
- Implement video playback event tracking if watch progress, bookmarks, or analytics are required.
- Confirm and implement coach video assignment and submission review routes if not already available.
- Decide whether Coach Studio remains marketing-only or becomes a product surface with real upload/status/analytics endpoints.

Acceptance:

- Each Phase 7 contract is either implemented and smoke-tested, or explicitly documented as deferred/static.
- Demo labels are removed only after real backend behavior is available and verified.

## Phase 16: Full Product Feature/API Inventory

Status: pending.

Goal: define what "complete" means for both backend and frontend before final implementation.

- Inventory every visible page, modal, button, form, table action, upload action, dashboard widget, and background refresh behavior.
- Map each UI behavior to one of these statuses: wired to backend, wrapper exists but UI missing, backend exists but wrapper missing, backend missing, product decision needed, intentionally static.
- Inventory backend controllers/OpenAPI paths and compare them with `src/app/api/*` wrappers.
- Remove ambiguity around demo surfaces: AI analysis, Coach Studio, testimonials/how-it-works, video 360 analytics, CMS content, and admin-managed content.
- Create a final feature checklist grouped by role: public, learner, coach, admin.

Acceptance:

- Every visible FE feature has an explicit backend decision.
- Every backend endpoint has an owner in frontend, smoke tests, or a documented reason for being backend-only.
- No feature is considered complete because fallback/mock data exists.

## Phase 17: API Contract Freeze and Compatibility Pass

Status: pending.

Goal: lock the backend/frontend contract before broad implementation.

- Export current OpenAPI and compare paths, methods, request bodies, response bodies, pagination shape, error shape, and role permissions against frontend types.
- Standardize response envelopes as `{ success, message, data }` or document exceptions.
- Normalize pagination, filters, sorting, date/time formats, file upload fields, enum values, and empty responses.
- Add compatibility wrappers only where old backend paths must remain temporarily supported.
- Update frontend types to match backend DTOs exactly.

Acceptance:

- Frontend API types and backend OpenAPI agree for all production features.
- Breaking path or DTO changes are either migrated in frontend or preserved through compatibility.
- The contract is documented enough that smoke/E2E tests can be written from it.

## Phase 18: Backend Completion for Missing Product APIs

Status: pending backend work.

Goal: implement every backend route required by the final feature inventory.

- Implement missing auth/session, profile, wallet, subscription, video, progress, AI analysis, coach workspace, notification, chat, admin, CMS/content, and analytics endpoints required by Phase 16.
- Enforce role permissions and current-user ownership on all personal-data endpoints.
- Add backend validation for request DTOs, file uploads, enum values, payment-like actions, and destructive admin actions.
- Add integration tests for learner, coach, and admin route groups.
- Ensure backend test data/seed data can support smoke and E2E flows.

Acceptance:

- Backend tests pass.
- OpenAPI exposes every required production endpoint.
- No frontend production feature depends on an undocumented backend route.

## Phase 19: Frontend Completion for All Production Surfaces

Status: pending frontend work.

Goal: remove remaining frontend-only behavior from production flows.

- Add missing `src/app/api/*` wrappers for any backend route introduced or confirmed in Phase 18.
- Wire all role pages to backend data: public/home, learner dashboard, coach dashboard, admin dashboard, auth, profile, booking, chat, notification, wallet, subscription, video, progress, AI analysis, and settings.
- Replace fallback/mock behavior with either real API behavior or an explicit empty/error/loading state.
- Keep intentionally static marketing content documented as static; add CMS/admin UI only if Phase 16 marks it product-managed.
- Recheck mobile/desktop UI states for loading, empty, error, success, permission denied, and expired session.

Acceptance:

- `rg 'fetch\(|axios|XMLHttpRequest' src/app` shows direct network calls only in the API client layer.
- Production screens do not silently show mock data as if it came from backend.
- All user actions that change data persist after refresh.

## Phase 20: End-to-End Role Flows and Regression Suite

Status: pending.

Goal: prove the complete product works by role, not just by endpoint.

- Expand `npm run smoke:phase8` or add E2E tests for full learner, coach, admin, and cross-role journeys.
- Test learner flows: register/login, session restore, profile, coach search/detail, availability, booking create/cancel, chat, notifications, progress read/write, video detail/like/save, subscription, wallet.
- Test coach flows: profile/schedule, booking confirm/reject/complete/cancel, students/tasks/notes, chat, notifications, video upload/update/delete/analytics/submissions, income, wallet withdraw, subscription.
- Test admin flows: users, user detail/status/delete, subscriptions edit, finance, wallet withdrawal review, platform settings, dashboard analytics, alerts.
- Test cross-role sync: booking status updates, chat unread/read state, notification creation/read/delete, wallet/admin withdrawal review state.

Acceptance:

- Automated smoke/E2E passes for public, learner, coach, and admin accounts.
- Manual test notes exist only for flows that cannot be automated safely.
- Bugs found during E2E are either fixed or tracked as release blockers.

## Phase 21: Production Readiness and Cleanup

Status: pending.

Goal: make the integrated system maintainable and release-ready.

- Remove obsolete fallback constants, unused wrappers, dead components, and legacy compatibility paths that are no longer needed.
- Add monitoring/logging expectations for failed API calls, auth expiration, upload failures, payment-like actions, and admin destructive actions.
- Validate environment configuration for local, staging, and production API URLs.
- Run build, lint/type checks if available, backend tests, frontend tests, smoke/E2E, and basic browser checks.
- Update final docs: setup, env vars, test credentials policy, API coverage matrix, manual QA checklist, and known deferred product decisions.

Acceptance:

- Full verification passes in a clean environment.
- Remaining deferred items are product decisions, not hidden FE/BE integration gaps.
- The app can be handed off as a production candidate for the agreed feature scope.

## Acceptance Criteria

- No direct `fetch` calls are added in UI components; FE code goes through `src/app/api/*`.
- New personal-data endpoints derive the current user from JWT instead of trusting a `userId` from the client.
- Backend responses keep the `{ success, message, data }` shape.
- Existing working endpoint paths are not renamed unless wrappers preserve compatibility.
- Existing modified/untracked work is preserved.
- Fallback/mock data can remain as explicit fallback, but it does not count as full API coverage.
- Completed status in Phases 1-4 means the planned integration scope is complete, not full product API coverage.
