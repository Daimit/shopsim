# Project Plan and Team Responsibilities

## Responsibility Matrix

| Workstream | Responsibilities | Evidence |
|---|---|---|
| Product and UX research | Requirements, scenarios, consent, SUS, debrief protocol | `docs/TESTING_PROTOCOL.md`, `docs/SUS_QUESTIONNAIRE.md` |
| Frontend engineering | React UI, routing, search, cart, checkout and feedback flow | `client/src/` |
| Backend and data | Express APIs, Prisma schema, seed data and persistence | `server/src/`, `server/prisma/` |
| Telemetry and analytics | Event capture, session tracking, task funnel, exports and dashboard | `client/src/lib/tracker.ts`, `client/src/pages/admin/AnalyticsPage.tsx` |
| QA and documentation | Build checks, live scenarios, report consistency and presentation | `README.md`, `docs/USABILITY_REPORT.md`, `PRESENTATION_SLIDES.md` |

Team members should be assigned to these workstreams before the final defence; the repository records responsibilities by workstream rather than inventing individual names.

## Milestone Schedule

| Milestone | Deliverable | Status |
|---|---|---|
| 1 | Proposal, requirements, research question and UX relevance | Complete |
| 2 | IA, user flows, interactive prototype and scenarios | Complete |
| 3 | Functional full-stack prototype, data and telemetry | Complete |
| 4 | Testing protocol, participant runs, SUS/debrief collection and analysis | In progress; collection flow is implemented |
| 5 | Final packaging, presentation, live defence and final evidence review | Pending |

## Final Evidence Checklist

- [x] Source code and setup instructions
- [x] Functional search, filtering, comparison, cart, discounts and checkout
- [x] Telemetry and researcher dashboard
- [x] Consent, SUS and testing protocol
- [x] In-app post-test feedback collection
- [x] Seed a reproducible evaluation participant sample
- [ ] Run and export the final real participant sample
- [ ] Replace fixture report values with the final exported dataset
- [ ] Assign named team members to the responsibility matrix
