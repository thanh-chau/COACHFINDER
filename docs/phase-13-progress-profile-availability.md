# Phase 13 - Progress Write Forms and Profile Management

Date: 2026-05-29

## Implemented

- Added learner write forms in the progress screen:
  - `POST /api/v1/trainees/progress/body-metrics` via `createBodyMetric`.
  - `POST /api/v1/trainees/progress/exercises` via `createExerciseProgress`.
  - After a successful save, the screen reloads progress overview, body metrics, exercise progress, heatmap, and achievements from backend APIs.
- Moved progress loading into the main `ProgressTracking` component so the API state is owned by the screen, not by a nested section.
- Added coach profile API wrappers:
  - `GET /api/coaches/me`.
  - `PUT /api/coaches/me`.
- Updated the coach profile setup page to read the current coach profile and switch to update mode when a profile already exists.
- Added coach availability API wrappers:
  - `GET /api/coaches/{coachId}/available-slots?date=yyyy-MM-dd`.
  - `GET /api/coaches/{coachId}/schedule-with-availability`.
- Updated the coach detail and booking modal to load `schedule-with-availability` first, falling back to the legacy schedule endpoint when needed.

## Not Wired Yet

- Trainee profile update/delete is intentionally not wired because the current learner UI does not expose a clear profile-management or delete-account rule.
- Featured coaches remain wired through `GET /api/coaches/featured`. No trending coach endpoint is currently consumed because the visible UI does not have a separate trending section.
- Backend credential smoke testing is still blocked until the Phase 9 backend/test-account environment is running.

## Verification

- `npm run build` passes.
- `rg "fetch\\(|axios|XMLHttpRequest" src/app` should only report the shared API client.
