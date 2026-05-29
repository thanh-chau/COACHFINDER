# Phase 12 Video Detail, Saved Videos, Analytics, and Events

Last updated: 2026-05-29

Phase 12 finishes the video API surfaces that already had frontend wrappers.

## Implemented

- Learner video library now opens video detail through `GET /api/v1/videos/{id}` when a video is selected.
- Learner video library now has a saved-video toggle that loads `GET /api/v1/videos/saved`.
- Video detail now records playback events through `POST /api/v1/videos/{id}/events`:
  - `START` when detail opens;
  - `PAUSE` when detail unmounts;
  - `BOOKMARK` when the learner saves a video.
- Coach video studio now loads per-video analytics through `GET /api/v1/coach/videos/{id}/analytics` when a coach selects a video.
- If per-video analytics fails, the coach detail panel shows a visible fallback notice and keeps list/submission-derived counts.

## Files

- `src/app/components/VideoLibrary.tsx`
- `src/app/components/CoachVideoStudio.tsx`

## Not Completed Yet

- Manual student assignment is not wired to `assignCoachVideoStudents` because the current UI only has trainee names derived from submissions, not stable `traineeId` selections. This should wait for a real student-picker surface or confirmed assignment DTO data.
- Playback event success cannot be proven locally until backend/credentials from Phase 9 are available.

## Verification

Local verification on 2026-05-29:

- `npm run build`: passed.
- `rg 'fetch\(|axios|XMLHttpRequest' src/app`: direct network calls remain only in `src/app/api/client.ts`.
- Authenticated video smoke is pending Phase 9 backend runtime and role credentials.

## Manual Smoke Checklist

Run after backend and credentials are available:

- Learner: open video library and verify list loads.
- Learner: open a video and verify `GET /api/v1/videos/{id}` succeeds.
- Learner: save a video, switch to saved videos, and verify it appears.
- Learner: reopen/close a video and verify playback events are accepted by backend.
- Coach: open video studio, select a video, and verify analytics loads.
- Coach: verify video upload/update/delete still work after analytics wiring.
