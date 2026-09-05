# CareFlow — Frontend

Treatment-aware repayment optimization platform. This is the complete frontend
foundation: a production-structured React + TypeScript app, fully navigable,
running entirely on typed mock services until the backend is ready.

## Stack

React · TypeScript · Vite · Tailwind CSS · Recharts · Zustand · React Router · Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Project structure

```
src/
├── app/            router, layouts (public + app shell)
├── components/     shared charts, tables, navigation, ui primitives
├── features/       one folder per screen area (dashboard, cases, treatment,
│                    cashflow, repayment, simulation, lender, assistant)
├── services/
│   ├── api/        typed interfaces (casesApi, treatmentApi, ...) + the single
│   │                export point the whole UI depends on
│   └── mock/        current implementations + the synthetic demo dataset
├── stores/         Zustand stores — no business calculation lives in components
├── types/          shared domain types (Case, TreatmentPlan, RepaymentSchedule, ...)
└── utils/          formatting helpers
```

## Connecting the real backend

The UI never imports `services/mock/*` directly — every screen goes through
`src/services/api/index.ts`. To swap in the real backend:

1. Implement each interface in `src/services/api/types.ts` against real HTTP
   calls (e.g. in a new `src/services/http/` folder).
2. Point the exports in `src/services/api/index.ts` at your new implementations
   instead of the `mock*` ones.
3. No feature or component code should need to change — they only ever call
   `casesApi`, `treatmentApi`, `repaymentApi`, etc.

Set `VITE_API_BASE_URL` and `VITE_USE_MOCKS=false` in `.env` once the backend
is live (wire this flag into your new HTTP implementations as you build them).

## Demo data

All figures shown in the app (portfolio metrics, case list, treatment costs,
optimization results) are synthetic and clearly labeled `DEMO DATA` /
`DEMO CALCULATION` / "Illustrative synthetic prototype scenario" in the UI.
The demo case (`CF-1042`) and all treatment presets live in
`src/services/mock/demoData.ts`.

## Design system

Colors, type scale, and component conventions follow the CareFlow design spec:
teal = CareFlow/optimized, coral = treatment expense/stress, gray = traditional
baseline, amber = warning. Tailwind tokens for these are defined in
`tailwind.config.ts`.
