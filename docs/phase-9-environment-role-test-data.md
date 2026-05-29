# Phase 9 Environment and Role Test Data

Last updated: 2026-05-29

Phase 9 prepares a real backend URL and disposable role accounts so the Phase 8 smoke runner can verify protected learner, coach, and admin APIs.

## Backend URL

Default frontend/smoke backend URL:

```powershell
$env:COACHFINDER_API_URL="http://localhost:8080"
```

Override this only when the backend is running somewhere else. The smoke scripts also accept `VITE_API_URL`, but `COACHFINDER_API_URL` should be preferred for test runs.

## Prepare Disposable Accounts

Run this from the frontend workspace:

```powershell
npm run phase9:prepare
```

The prepare script:

- checks `GET /v3/api-docs`;
- registers or logs in a disposable learner account;
- registers or logs in a disposable coach account;
- verifies `/api/v1/auth/me` for both accounts;
- prints the PowerShell environment variables needed by `npm run smoke:phase8`.

Default disposable accounts:

| Role | Email | Password source |
| --- | --- | --- |
| Learner | `phase9.learner@example.test` | `COACHFINDER_TEST_PASSWORD` or local default |
| Coach | `phase9.coach@example.test` | `COACHFINDER_TEST_PASSWORD` or local default |

The backend rejects public `ADMIN` registration, so admin credentials must come from an existing database user:

```powershell
$env:COACHFINDER_ADMIN_EMAIL="<existing-admin-email>"
$env:COACHFINDER_ADMIN_PASSWORD="<existing-admin-password>"
```

Do not commit real credentials. Use local shell variables or ignored `.env.*.local` files only.

## Run Role Smoke

After setting the variables printed by `npm run phase9:prepare`, run:

```powershell
npm run smoke:phase8
```

Expected Phase 9 target:

- OpenAPI reachable.
- Learner login, `/me`, representative protected endpoints, and logout pass.
- Coach login, `/me`, representative protected endpoints, and logout pass.
- Admin login, `/me`, representative protected endpoints, and logout pass once admin credentials are provided.

## Seed Data Notes

The smoke runner intentionally avoids destructive and payment-like writes. Prepare disposable data for manual tests:

- Booking: one learner, one coach with a coach profile, schedule/availability, and at least one pending booking.
- Coach videos: at least one uploaded coach video and one trainee submission if submission review will be tested.
- Subscription: learner and coach accounts with current plan state; disposable records for plan change tests.
- Wallet: wallet rows for learner/coach, one top-up candidate, one coach withdraw request, and one pending admin withdrawal review.
- Notifications: at least one unread notification per role.
- Chat: at least one learner/coach conversation with unread and read-message states.

## Current Local Result

Latest local Phase 9 attempt on 2026-05-29:

- `npm run phase9:prepare` could not complete because no backend was listening on `http://localhost:8080` in this workspace.
- Learner/coach disposable account creation is ready once the backend is running.
- Admin credentials are still required from an existing backend database user.
