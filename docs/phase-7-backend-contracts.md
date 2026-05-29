# Phase 7 Backend Contracts

Last updated: 2026-05-29

Phase 7 covers product surfaces that cannot be fully completed in the frontend alone. These contracts preserve the existing response convention: `{ success, message, data }`, and all personal data must be scoped from the current JWT user.

## AI Analysis

Frontend wrappers: `src/app/api/aiAnalysis.ts`

- `POST /api/v1/ai/analysis/jobs`
  - Multipart form fields: `sport`, `technique`, `video`.
  - Creates an analysis job for the current trainee.
- `GET /api/v1/ai/analysis/jobs`
  - Query: `page`, `size`.
  - Lists current trainee analysis history.
- `GET /api/v1/ai/analysis/jobs/{jobId}`
  - Returns job status, source video URL, result scores, issues, recommendations, and report URL.
- `POST /api/v1/ai/analysis/jobs/{jobId}/feedback`
  - Body: `{ rating, comment }`.
  - Stores trainee feedback on analysis quality.

## Video Playback Events

Frontend wrapper: `recordVideoPlaybackEvent` in `src/app/api/videos.ts`

- `POST /api/v1/videos/{id}/events`
  - Body: `{ eventType, positionSeconds, durationSeconds, metadata }`.
  - Event types: `START`, `PROGRESS`, `PAUSE`, `COMPLETE`, `BOOKMARK`.
  - Use for watch progress, bookmarks, and playback analytics. 360 playback itself remains frontend-only.

## Coach Video Assignments

Frontend wrapper: `assignCoachVideoStudents` in `src/app/api/videos.ts`

- `PUT /api/v1/coach/videos/{id}/assignments`
  - Body: `{ traineeIds }`.
  - Replaces the trainee assignment list for a coach-owned video.

## Coach Submission Review

Frontend wrapper: `reviewCoachSubmission` in `src/app/api/videos.ts`

- `PUT /api/v1/coach/submissions/{id}/review`
  - Body: `{ totalScore, feedback, status }`.
  - Coach reviews a trainee submission. `status` should be `REVIEWED` or `APPROVED`.

## Marketing-Only Surfaces

- `AIVideoAnalysis` and `CoachStudio` are treated as landing-page demos until productized.
- No backend is required for `Testimonials` or `HowItWorks` unless admin-managed CMS content becomes a requirement.
