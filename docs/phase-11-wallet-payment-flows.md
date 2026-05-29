# Phase 11 Wallet and Payment-Like User Flows

Last updated: 2026-05-29

Phase 11 exposes the existing wallet backend APIs in learner and coach UI without using hidden mock balances.

## Implemented

- Added `WalletPanel` as the shared wallet UI for protected role screens.
- Learner subscription screen now shows:
  - wallet balance from `GET /api/v1/wallets/me`;
  - recent wallet transactions from `GET /api/v1/wallets/me/transactions`;
  - top-up creation through `POST /api/v1/wallets/top-up`;
  - top-up status refresh through `GET /api/v1/wallets/top-up/{orderCode}`;
  - checkout link when the backend returns one.
- Coach income payout tab now shows:
  - wallet balance from `GET /api/v1/wallets/me`;
  - recent wallet transactions from `GET /api/v1/wallets/me/transactions`;
  - bank account read/save through `GET/PUT /api/v1/wallets/bank-account`;
  - withdraw requests through `POST /api/v1/wallets/withdraw`.
- Wallet errors are visible to the user; the panel does not silently replace wallet data with local sample balances.

## Files

- `src/app/components/WalletPanel.tsx`
- `src/app/components/LearnerSubscription.tsx`
- `src/app/components/CoachIncome.tsx`

## Verification

Local verification on 2026-05-29:

- `npm run build`: passed.
- Authenticated wallet smoke is pending Phase 9 backend runtime and role credentials.

## Manual Smoke Checklist

Run after backend and credentials are available:

- Learner: open subscription screen and verify wallet balance/transactions load.
- Learner: create a small top-up with disposable data and verify checkout/status response is shown.
- Coach: open income -> payout tab and verify wallet balance/transactions load.
- Coach: save bank account, refresh, and verify the saved data is restored.
- Coach: create a withdraw request with disposable funds and verify a pending wallet transaction appears.
- Admin: open finance wallet review and approve/reject the same withdraw request, then refresh coach wallet state.
