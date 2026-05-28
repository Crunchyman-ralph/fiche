---
name: review
description: Review someone else's PR for Fiche. Read the diff, identify Blockers and Should-fix concerns, output structured findings the author can act on. Does NOT fix issues — the author fixes; you flag. Validates Fiche's ADR fidelity, transport-agnostic handler pattern, RFM round-trip safety, auth gating, schema migrations, and Ultracite compliance. Use this skill whenever the user says "review this PR", shares a PR URL, says "review #N", asks "is this code OK", "check this diff", "lmk if this looks good", "should I approve this", or pastes a `gh pr view` output. Trigger even when the user uses casual language about looking at someone's code. For preparing the user's own PR before opening it, use /pre-pr instead.
argument-hint: "<PR URL, PR number, branch name, or diff range>"
---

# /review

Reviewer-side audit of someone else's PR. Read it carefully, surface what would block a merge, leave structured findings the author can act on.

**This skill does not fix issues.** The author fixes; the reviewer flags. If the user is the author preparing their own PR, redirect to `/pre-pr`.

## When this skill fires

- User pastes a PR URL or references `#N`.
- User says "review this", "check this PR", "is this code OK", "should I approve".
- User asks for an opinion on someone else's branch or diff.
- User pastes `gh pr view` / `gh pr diff` output.

## Companion subagents and skills

Two ways to add depth to this review. Use the **Task tool** for the subagent (parallelizable, isolated context), use the **Skill tool** for the skills (runs in this context):

- **`Task(subagent_type: "fiche-deep-review", prompt: "<diff + changed file contents in labeled sections>")`** — for structural / maintainability depth. Best for diffs >500 lines, file restructures, or changes that smell like they restructure a layer rather than add a feature. The subagent loads the thermo-nuclear rubric and applies it through Fiche's lens, in isolated context so its findings don't pollute this review.
- **`Skill(skill: "thermo-nuclear-code-quality-review")`** — when you want the deep audit yourself instead of delegating to a subagent. Same rubric, your context, more token cost.
- **`Skill(skill: "get-pr-comments")`** — useful when reviewing iterations of a PR. Pulls existing reviewer comments so you don't repeat them.

For diffs that warrant the deep audit, the typical orchestration is: spawn the subagent first (one Task call), let it work in parallel while you walk the Fiche checklist below, then incorporate its top findings into your review output.

## Workflow

```bash
gh pr view <PR-or-URL> --json title,body,baseRefName,headRefName,additions,deletions,changedFiles
gh pr diff <PR-or-URL>
gh pr checks <PR-or-URL>
```

Then:

1. Read the PR description. Does it match the diff? If the description says "fix the auth gate" but the diff also touches `revision` storage, flag the scope mismatch.
2. Walk the diff. For each touched file, ask: what's the intent? Does the change cleanly serve that intent, or does it ride along extra work?
3. Apply the Fiche checklist below. Cite file paths and line numbers in every finding.
4. Decide on a verdict: APPROVE, REQUEST CHANGES, or NEEDS DISCUSSION.
5. Emit the structured findings (see output format).

## Fiche-specific checklist

The checklist below mirrors `/pre-pr` but from the reviewer's seat. The author was supposed to catch these; if any slipped through, flag them and explain the consequence.

### 1. ADR fidelity (BLOCKER on contradiction)

Reasoning: ADRs are the load-bearing decisions. A change that contradicts one isn't a bug — it's a redirect of the architecture. A PR redirecting architecture needs a new ADR explaining why, not a silent change in feature code.

Check the change against:

- **ADR-0001** — no offline / local-first / CRDT logic.
- **ADR-0002** — no stdio MCP server paths. SSE only.
- **ADR-0003** — no in-UI onboarding wizard replacing the agent-driven path.
- **ADR-0004** — handler `mode` default is `"apply"`. Suggestions are opt-in.
- **ADR-0005** — annotations are `by="<user>" via="<agent>"`, never `by="AI"`.
- **ADR-0006** — no integrations (Jira / Linear / Notion / Slack / etc.) in `apps/api`.
- **ADR-0008** — no native-shell imports (Electron / Tauri / RN / Capacitor).
- **ADR-0009** — Bun + Elysia + Next.js + Drizzle. No Node-only paths, no Next.js backend API routes.
- **ADR-0010** — PostHog only. No Sentry / Datadog / OpenTelemetry SDKs.
- **ADR-0011** — Coolify hosting. No Vercel Edge runtime markers.

### 2. Transport-agnostic handler pattern (BLOCKER)

Reasoning: the four MVP verbs are exposed via HTTP and MCP-SSE. If logic lives in either transport instead of in `handlers/`, the two surfaces silently drift.

Flag:

- Business logic in `apps/api/src/routes/index.ts` or `apps/api/src/mcp/index.ts` that belongs in `handlers/`.
- A change that updates one transport without the other.
- HTTP- or MCP-specific assumptions leaking into `handlers/`.

### 3. RFM round-trip safety (BLOCKER)

Reasoning: `revision.rfm` is the canonical Doc state. Direct string manipulation is the fastest way to silently corrupt a Doc.

Flag:

- `.replace()` / `.slice()` / `.split()` on `rfm` content.
- Code that loses or reorders inline annotations.
- New revisions that don't carry forward unchanged annotations.

### 4. Auth gating (BLOCKER on missing)

Reasoning: every Doc operation is per-user. A single unauthed route is how data leaks happen.

Flag:

- A new `/api/docs/*` route that doesn't check `user`.
- A route that gates on `session` but not on Doc ownership / collaborator membership.
- An MCP verb that bypasses auth.

### 5. Schema migrations (BLOCKER on drift)

Reasoning: schema and migration files have to agree. CI catches drift; flag it here too so the author can fix before another CI cycle.

Flag:

- A schema change without a corresponding migration in `packages/db/drizzle/`.
- Hand-written SQL when drizzle-kit would have generated it.
- A breaking schema change without a rollout note (zero-downtime story or "self-host operators must re-migrate").

### 6. Ultracite compliance (BLOCKER if CI hasn't caught yet)

Common Ultracite rule violations:

- `no-warning-comments` — `// TODO:` and friends. Rephrase as prose.
- `func-style` — arrow expressions for exports.
- `require-await` — drop `async` if there's no `await`.
- `no-inline-comments` — comments on their own line.
- `no-empty-file` — every shipped file has a real export.
- `no-magic-numbers` — named constants.
- `sort-keys` — alphabetical.

### 7. Dead code (SHOULD-FIX)

Unused exports, commented-out code, dangling references to removed columns/tables, orphan files.

### 8. DRY (SHOULD-FIX)

Duplication of logic already in `packages/` or already-imported deps (e.g., `zod`). If tiny (≤3 similar lines), let it go.

### 9. Self-host parity (SHOULD-FIX)

New env vars need sensible defaults or a clear startup failure. New service deps must be optional or documented as self-host prereqs.

### 10. Karpathy guidelines (NIT, but escalate if severe)

Speculative abstraction, defensive error handling for impossible scenarios, narrating comments, drive-by refactors mixed into a feature PR. If severe, recommend the author run `/deslop`.

### 11. Tests (SHOULD-FIX for non-trivial new logic)

Did the PR add a real new path without tests? Auth, doc-mutation, and MCP write paths especially deserve coverage as they land.

## Severity triage

| Severity       | Action                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| **Blocker**    | REQUEST CHANGES verdict. Author must address before merge.                           |
| **Should-fix** | Note in review. Author should address in this PR if cheap; in a follow-up otherwise. |
| **Nit**        | Optional. Mention if low cost; suppress if there are bigger fish.                    |

If there are no Blockers and the change cleanly serves its stated intent, APPROVE. Don't manufacture findings — a clean PR deserves a clean review.

## Output format

```markdown
## Review of #<PR number or title>

### Verdict

<APPROVE / REQUEST CHANGES / NEEDS DISCUSSION>

### Summary (1-2 sentences)

What the PR does, and your one-sentence read on whether it serves that intent cleanly.

### Blockers (REQUEST CHANGES if any)

- **<file>:<line> — <one-line issue title>**
  Rule: <ADR or section name>
  Why it matters: <one-sentence operational consequence>
  Suggested fix: <concrete direction, not a vague gesture>

### Should-fix

- <file>:<line> — <issue with why and fix direction>

### Nits

- <file>:<line> — <one-line nit, optional to address>

### What's good

- <one or two specific things, not generic praise>

### Notes

- Observations that aren't issues but are worth knowing (e.g., "the migration touches `account` which Better Auth manages directly; verify the integration tests still pass").
```

## Example finding

```
### Blockers

- **apps/api/src/routes/index.ts:24 — Route filters the handler's
  result before returning.**
  Rule: transport-agnostic handler pattern (section 2).
  Why it matters: the MCP transport at apps/api/src/mcp/index.ts
  doesn't do the same filter, so MCP clients see different data than
  HTTP clients for the same operation. The two transports must agree.
  Suggested fix: move the filter into editDoc in
  apps/api/src/handlers/docs.ts. The route should only
  parse → call handler → return result.
```

That's the level of specificity to leave: cite the file and line, name the rule, state the operational consequence in one sentence, give a concrete fix direction.

## Tone

Direct. Specific. Surface what an experienced reviewer would catch. Don't pile on nits when there are Blockers; the author needs to address the big stuff first.

If a finding is structural rather than line-level (e.g., "this whole module would be cleaner as a state machine"), call `Task(subagent_type: "fiche-deep-review", prompt: <diff + changed file contents in labeled sections>)` — let it do the rubric work in isolated context, then incorporate its top findings into your review.

If there are no Blockers, APPROVE without padding. A short clean review is a service to the author.

## What this skill does NOT do

- It does not edit the PR. The author edits.
- It does not call `gh pr merge`. The author or a maintainer merges.
- It does not run `/pre-pr` (that's the author's skill, not the reviewer's).
- It does not run `/make-pr-easy-to-review` (that's also the author's job).
