# Phase 10 Auth Session Restore and Account Flows

Last updated: 2026-05-29

Phase 10 wires `/api/v1/auth/me` into frontend route boot so protected dashboards no longer trust only cached local session data.

## Implemented

- Protected dashboard routes now restore the current user through `getCurrentUser`.
- The restored backend role controls dashboard access:
  - `TRAINEES` -> `/dashboard/learner`
  - `COACHES` -> `/dashboard/coach`
  - `ADMIN` -> `/dashboard/admin`
- Visiting `/auth` with a valid restored session redirects to the correct dashboard.
- Visiting a protected dashboard without a token redirects to `/auth`.
- Visiting a protected dashboard with the wrong role redirects to the restored role dashboard.
- API 401 responses clear the cached auth session and emit a frontend auth-expired event.
- Dashboard routes listen for the auth-expired event and return the user to `/auth`.

## Files

- `src/app/App.tsx`
- `src/app/api/client.ts`
- `src/app/utils/authSession.ts`

## Verification

Local verification on 2026-05-29:

- `npm run build`: passed.
- Full authenticated smoke is still blocked until Phase 9 has a running backend and role credentials.

## Manual Smoke Checklist

Run after backend and credentials are available:

- Log in as learner, refresh `/dashboard/learner`, verify the learner dashboard remains loaded.
- Log in as coach, refresh `/dashboard/coach`, verify the coach dashboard remains loaded.
- Log in as admin, refresh `/dashboard/admin`, verify the admin dashboard remains loaded.
- With a learner token, open `/dashboard/coach`; verify redirect to `/dashboard/learner`.
- With a coach token, open `/dashboard/admin`; verify redirect to `/dashboard/coach`.
- Delete or corrupt the stored token, then open any dashboard; verify redirect to `/auth`.
- Expire/revoke a token server-side if possible, then trigger any protected API call; verify local session is cleared and `/auth` is shown.
