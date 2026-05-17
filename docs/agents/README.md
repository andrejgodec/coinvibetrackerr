# Agent Task Index

Execution order matters — each agent depends on the previous.

| # | Agent | File | Blocks |
|---|-------|------|--------|
| 1 | Research: Data Sources | `01-research-data-sources.md` | nothing |
| 2 | Project Scaffold | `02-project-scaffold.md` | agent 1 |
| 3 | API Client + Data Pipeline | `03-api-client.md` | agent 2 |
| 4 | Database Schema | `04-database.md` | agent 2 |
| 5 | Frontend: Dashboard | `05-frontend-dashboard.md` | agents 3 + 4 |
| 6 | Frontend: Coin Detail + Chart | `06-frontend-coin-detail.md` | agent 5 |
| 7 | Deployment | `07-deployment.md` | agent 6 |

Agents 3 and 4 can run in parallel after agent 2 completes.
Agents 5 and 6 are sequential (detail page reuses dashboard components).

## How to Run an Agent

Paste the agent file content into Claude Code as your task brief.
Each file is self-contained: it lists its prerequisites, exact deliverables, and acceptance criteria.

## Current Status

- [ ] Agent 1 — Research
- [ ] Agent 2 — Scaffold
- [ ] Agent 3 — API Client
- [ ] Agent 4 — Database
- [ ] Agent 5 — Dashboard UI
- [ ] Agent 6 — Coin Detail UI
- [ ] Agent 7 — Deploy
