# Vibe Coding Guide

CoinVibeTracker was built entirely through AI agent briefs — one brief per feature, each handed to Claude Code to implement. This document explains the workflow so you can contribute the same way.

---

## What is Vibe Coding?

Vibe coding means writing a structured brief that describes *what* to build and *why*, then letting an AI implement it. You stay in the loop reviewing output, steering decisions, and verifying correctness — but you're not writing every line.

The key is the brief. A good brief produces production-ready code. A vague brief produces generic code you'll spend hours fixing.

---

## The Brief Format

Every agent brief in `docs/agents/` follows this structure:

```
# Agent N — Feature Name

## Context
What already exists. What this feature builds on.

## Goal
One sentence: what this agent must deliver.

## Prerequisites
Which agents / files must exist before this one runs.

## Deliverables
Numbered list of exact files to create or modify.

## Specification
Detailed spec for each deliverable — types, function signatures,
data flow, edge cases, acceptance criteria.

## Implementation Order
Numbered steps in the order they should execute.

## Acceptance Criteria
Testable conditions that define done.
```

---

## How to Run an Agent Brief

1. Open Claude Code in the project root
2. Paste the brief content as your prompt (or use `/file docs/agents/NN-name.md`)
3. Claude Code reads the existing codebase, implements the deliverables, and runs verification
4. Review the diff — check types, logic, and edge cases
5. Run `npm run lint && npm test` to confirm nothing broke

Each brief is self-contained. You do not need to explain the rest of the codebase — the brief lists prerequisites and Claude Code reads the relevant files.

---

## The Agent Index

| # | Feature | Brief |
|---|---------|-------|
| 1 | Research: Data Sources | [01-research-data-sources.md](agents/01-research-data-sources.md) |
| 2 | Project Scaffold | [02-project-scaffold.md](agents/02-project-scaffold.md) |
| 3 | API Client + Data Pipeline | [03-api-client.md](agents/03-api-client.md) |
| 4 | Database Schema | [04-database.md](agents/04-database.md) |
| 5 | Frontend: Dashboard | [05-frontend-dashboard.md](agents/05-frontend-dashboard.md) |
| 6 | Frontend: Coin Detail + Chart | [06-frontend-coin-detail.md](agents/06-frontend-coin-detail.md) |
| 7 | Deployment | [07-deployment.md](agents/07-deployment.md) |
| 11 | Open-Source Documentation | [11-open-source-docs.md](agents/11-open-source-docs.md) |
| 13 | GitHub Pages Deployment | [13-github-pages.md](agents/13-github-pages.md) |

Agents 3 and 4 can run in parallel after agent 2.
Agents 5 and 6 are sequential — detail page reuses dashboard components.

---

## Writing a New Brief

When adding a feature, write the brief before touching any code:

1. Copy the format above into `docs/agents/NN-feature-name.md`
2. Be specific about file paths, function signatures, and data shapes
3. List edge cases explicitly — don't leave them for the AI to discover
4. Define acceptance criteria as testable conditions, not vague goals
5. Note which existing files the agent needs to read

**Bad brief:** "Add a watchlist feature"

**Good brief:** "Add a watchlist stored in localStorage under `cvt_watchlist`. The `CoinTable` already has a star toggle that saves/loads from this key. Add a `/watchlist` route at `src/app/watchlist/page.tsx` that reads the key, fetches current prices for those coins via `clientGetTopCoins`, and renders a filtered `CoinTable` with only watchlisted coins."

The more concrete the brief, the less back-and-forth during implementation.

---

## Tips

- **One brief per feature.** Don't combine unrelated changes.
- **Read before writing.** Have the agent read key files first before generating code.
- **Verify, don't trust.** Always review the diff. AI makes plausible mistakes.
- **Test the golden path.** Run the feature manually after every agent, not just the test suite.
- **Commit the brief.** The brief is documentation. It explains *why* the code exists.

---

## Roadmap Items

These features are planned but not yet briefed. If you want to contribute one, write the brief first and open an issue linking to it.

- **Watchlist** — persist coin list in localStorage (or Supabase on Full Edition)
- **DeFiLlama integration** — TVL and protocol data alongside price data
- **Price alerts** — browser notifications when a coin crosses a threshold
- **Portfolio tracker** — enter holdings, track total value over time
