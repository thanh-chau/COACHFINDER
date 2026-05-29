# Phase 8 Role Smoke Test

Last updated: 2026-05-29

Phase 8 verifies protected role flows with real learner, coach, and admin accounts. The frontend repo cannot create or infer these credentials, so the smoke runner reads them from environment variables and skips missing roles.

## Run

```powershell
$env:COACHFINDER_API_URL="http://localhost:8080"
$env:COACHFINDER_LEARNER_EMAIL="learner@example.com"
$env:COACHFINDER_LEARNER_PASSWORD="password"
$env:COACHFINDER_COACH_EMAIL="coach@example.com"
$env:COACHFINDER_COACH_PASSWORD="password"
$env:COACHFINDER_ADMIN_EMAIL="admin@example.com"
$env:COACHFINDER_ADMIN_PASSWORD="password"
npm run smoke:phase8
```

If a role credential pair is missing, that role is reported as `SKIP`. Any configured role must pass login, `/me`, representative protected endpoints, and logout.

## Latest Local Run

Run on 2026-05-29:

- `npm run build`: passed.
- `npm run smoke:phase8`: failed because `http://localhost:8080/v3/api-docs` was unreachable in this frontend workspace.
- Learner, coach, and admin role checks were skipped because no credential environment variables were configured.

## Coverage

- Auth: login, current user, logout.
- Learner: progress, my bookings, current subscription, wallet, video library, notifications, chat unread count.
- Coach: calendar bookings, students, income, analytics, videos, submissions, coach subscription catalog, notifications, chat unread count.
- Admin: dashboard overview, users, transactions, subscription summary, finance overview, platform settings, notifications, chat unread count.
- OpenAPI: confirms key Phase 8 endpoint paths are present before role checks.

## Manual Follow-Up

The script intentionally avoids destructive or payment-like actions. Run these manually with disposable data:

- Learner: create booking, cancel booking, like/save video, purchase/change subscription, wallet top-up/withdraw flow.
- Coach: confirm/reject booking, complete booking, cancel-by-coach, upload/update/delete video, change subscription plan.
- Admin: user status/delete, subscription edit, wallet withdrawal approve/reject.
- Cross-role: send chat messages between learner and coach, read notifications, verify unread counters sync.
