---
name: pre-pr
description: Author-side self-audit a branch BEFORE opening a PR for Fiche. Walks the diff against main, classifies findings as Blocker / Should-fix / Nit, fixes the Blockers in the same branch yourself, runs make-pr-easy-to-review to clean commits and write the description, then green-lights `gh pr create`. Use this skill whenever the user is wrapping up a feature branch and about to PR — they may say "about to open a PR", "is this ready", "before I push", "am I missing anything", "let me know if this is good", "ready to ship", or just paste a `gh pr create` command. Trigger even when the user doesn't say "pre-pr" explicitly — wrapping up a feature branch IS the trigger.
argument-hint: "<diff range, branch name, or empty to default to origin/main...HEAD>"
---

# /pre-pr

You wrote the code. This skill catches what a reviewer would otherwise flag — fixes it in this branch — then prepares the PR so a reviewer can read it in two minutes.

For _reviewing someone else's_ PR, use `/review` instead.

## When this skill fires

- Right before `gh pr create` (or `gh pr ready`).
- After fixup commits on an in-flight PR.
- When the user says "is this ready", "before I push", "am I missing anything", or otherwise signals they're done writing and starting to ship.

The cost of a fixup commit is much lower than a review round-trip, which is why fixing yourself before opening the PR is the right call: every Blocker you catch here saves a reviewer-and-author back-and-forth cycle that would have cost real time.

## Companion skills

Invoke these via the **Skill tool** (`Skill(skill: "name")`) alongside this audit, based on diff shape:

- **`thermo-nuclear-code-quality-review`** — if the diff is >1000 lines OR touches structural code (file restructures, layer moves, abstraction changes). Use it when your eye sees more than a feature add — when the _shape_ of the codebase changed. Merge its findings with this checklist.
- **`deslop`** — if the diff has AI-written tells (defensive try/catches in trusted paths, `any` casts to bypass types, narrating comments, nested code that early returns would flatten). Run **first**, so this audit focuses on real issues instead of slop noise.
- **`make-pr-easy-to-review`** — **after** fixing Blockers, **before** `gh pr create`. Cleans commits into a reviewable order, writes a description that matches the diff, surfaces the risky files. The reviewer should grok the PR card in 30 seconds.

Invocation example: `Skill(skill: "deslop")` before walking the checklist, then `Skill(skill: "make-pr-easy-to-review")` after Blockers are clear.

## Core workflow

```bash
git fetch origin main
git diff origin/main...HEAD
git diff origin/main...HEAD --stat
gh pr checks --json name,bucket,state 2>/dev/null || true
```

1. Walk the Fiche checklist below against the diff.
2. **Fix every Blocker yourself in this branch.** Don't defer.
3. Should-fix items: fix in this branch if cheap; otherwise note explicitly in the PR description.
4. Nits: just fix them.
5. Run `/make-pr-easy-to-review` to clean commits + write a real description.
6. Open the PR only once the Blocker list is empty.

## Fiche-specific checklist

### 1. ADR fidelity (BLOCKER on contradiction)

Reasoning: ADRs are the load-bearing decisions of the project. A change that contradicts one isn't a bug — it's a redirect of the architecture. If you really need to redirect, write a new ADR; don't smuggle the change into a feature PR.

For each touched area, reject changes that contradict:

- **ADR-0001** — no offline / local-first / CRDT logic. Central server only.
- **ADR-0002** — no stdio MCP server paths. SSE only.
- **ADR-0003** — no in-UI onboarding wizard replacing the agent-driven path.
- **ADR-0004** — handler `mode` default is `"apply"`. Suggestions are opt-in.
- **ADR-0005** — annotations carry `by="<user>" via="<agent>"`. Never `by="AI"`.
- **ADR-0006** — no Jira / Linear / Notion / Slack push in `apps/api`.
- **ADR-0008** — no Electron / Tauri / React Native / Capacitor imports.
- **ADR-0009** — Bun + Elysia + Next.js + Drizzle stack. No Node-only paths, no Next.js API routes for backend logic.
- **ADR-0010** — PostHog only. No Sentry / Datadog / OpenTelemetry SDKs.
- **ADR-0011** — Coolify hosting. No Vercel Edge runtime markers.

### 2. Transport-agnostic handler pattern (BLOCKER)

Reasoning: the four MVP verbs are exposed via two transports (HTTP for the web UI, MCP-SSE for agents). If logic lives in either transport instead of in `handlers/`, the two surfaces drift, and a fix on one side silently breaks the other. The handler is the contract.

Reject:

- Logic in `apps/api/src/routes/index.ts` that should be in `handlers/`. The route is `parse → call handler → return result`. If it's doing more, move it.
- Same on the MCP side (`apps/api/src/mcp/index.ts`).
- A change updating one transport while breaking the other.
- HTTP- or MCP-specific assumptions in `handlers/` (raw headers, Elysia context). Handlers take typed inputs, return typed outputs.

### 3. RFM round-trip safety (BLOCKER)

Reasoning: `revision.rfm` is the canonical Doc state. Comments and Suggestions live inline as CriticMarkup. String-manipulating this field is the fastest way to silently corrupt a Doc.

Reject:

- Direct `.replace()` / `.slice()` / `.split()` on `rfm` content. Go through `@roughdraft/rfm`.
- Code that drops or reorders annotations during a transformation.
- New revisions that don't carry forward unchanged annotations.

### 4. Auth gating (BLOCKER on missing)

Reasoning: every Doc operation is per-user. Forgetting an auth check on a single route is how data leaks happen.

The session is on Elysia's context via `.derive()` in `apps/api/src/index.ts`. Reject:

- A new route under `/api/docs/*` that doesn't check `user`.
- A new route that checks `session` but not Doc ownership or collaborator membership.
- An MCP verb that bypasses auth (the MCP token is per-user; the handler still has to honor it).

### 5. Schema migrations (BLOCKER on drift)

Reasoning: CI catches drift in the `schema-drift` job, but catching it locally is faster and keeps the PR clean from the start.

Reject:

- A schema change without `bun run db:generate` having been run and the result committed.
- Hand-written SQL when drizzle-kit would have generated it.
- A breaking schema change without a note explaining the rollout (zero-downtime story or "self-host operators must re-migrate").

### 6. Ultracite compliance (BLOCKER on violations CI catches)

Reasoning: any rule violation here will fail CI. Catch it locally; don't waste a CI run.

Rules that have already bitten this repo:

- `no-warning-comments` — no `// TODO:`, `// FIXME:`, `// XXX:`, `// HACK:`. Rephrase as prose, or open a GitHub issue.
- `func-style` — arrow function expressions for exports, not `function` declarations.
- `require-await` — `async` only if you actually `await`.
- `no-inline-comments` — comments on their own line.
- `no-empty-file` — every shipped file has a real export.
- `no-magic-numbers` — extract to named constants.
- `sort-keys` — alphabetical (auto-fix handles it).

Run `bun run check` before pushing.

### 7. Dead code sweep (SHOULD-FIX)

- No unused exports, methods, types, constants.
- No commented-out code.
- No dangling references to removed columns/tables/functions.
- No orphan files from removed features.

### 8. DRY (SHOULD-FIX)

Use `zod` for schema validation (already present). Don't hand-roll what an existing dep would do. If duplication is tiny (≤3 similar lines), leave it — premature abstraction is worse.

### 9. Self-host parity (SHOULD-FIX)

- New env vars need sensible defaults or a clear startup failure.
- New service deps (Redis, S3) must be optional or documented as self-host prereqs.

### 10. Tests (SHOULD-FIX for non-trivial new logic)

- Auth, doc-mutation, MCP write paths get coverage as they land.
- `bun run typecheck && bun run check && bun run test` passes locally.

## Severity triage

| Severity       | Examples                                                                                                                                                    | Action                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Blocker**    | ADR contradiction; handler logic in routes/; direct RFM string manipulation; missing auth gate; uncommitted migration; Ultracite violation; secrets in code | **Fix before opening PR**                                             |
| **Should-fix** | Dead code; DRY violations; missing self-host parity; missing tests; new dep without justification                                                           | **Fix in this branch** if cheap; otherwise note in the PR description |
| **Nit**        | Naming, comment phrasing, minor style                                                                                                                       | **Just fix it**                                                       |

When in doubt, prefer fixing over deferring.

## PR readability handoff (always)

After fixing Blockers, before `gh pr create`, run `/make-pr-easy-to-review`. The point isn't bureaucracy — the reviewer needs to see, from the PR card alone, what shipped, what's risky, and where to start reading. That skill handles:

- Grouping commits in dependency order (schema → core → wiring → UI → tests).
- A description that mirrors the actual diff (TL;DR, risky files, test plan).
- Calling out generated/mechanical files separately from logic.
- Linking the ADR(s) the change reinforces.

## Output format

Before `gh pr create`, summarize:

```markdown
## Pre-PR audit summary

### Blockers

<list, or "none">

### Should-fix

<list — what was auto-fixed vs. what's outstanding>

### Nits

<list — already auto-fixed unless noted>

### PR readability

<status of /make-pr-easy-to-review prep>

### Verdict

<READY TO OPEN PR / BLOCKERS REMAINING — fix and re-run>
```

Do not call `gh pr create` while Blockers remain.

## Example finding

```
### Blockers

- **apps/api/src/routes/index.ts:24 — Route is parsing AND filtering AND
  building the response shape.**
  Rule: transport-agnostic handler pattern (section 2).
  Why it matters: the MCP transport at apps/api/src/mcp/index.ts won't
  do the same filter, so MCP clients see a different result than HTTP
  clients for the same handler call.
  Fix: move the filter into `editDoc` in apps/api/src/handlers/docs.ts.
  The route should only `parse → call handler → return result`.
```

That's the level of specificity to aim for: cite the file:line, name the rule, explain the consequence in one sentence, give a concrete fix direction.

## Tone

Direct. High-conviction. You're the senior engineer reviewing your own work at 3am six months from now. Cite files and lines. Use concrete asks ("Move the parse step into `handlers/docs.ts`."), not vague suggestions ("might want to consider…").

If you find no Blockers, say so plainly. Don't manufacture findings.
