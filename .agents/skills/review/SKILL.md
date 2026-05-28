---
name: review
description: Review a Fiche code change for the things that actually matter — ADR fidelity, the transport-agnostic handler pattern, RFM round-trip safety, auth gating, schema migrations, and Ultracite compliance. Skip style nits; focus on what would block a merge or cause a production-shaped bug. Trigger with a PR URL, a diff, "review this", or after a meaningful chunk of code is written.
argument-hint: "<PR URL, diff, file path, or branch name>"
---

# /review

Fiche-shaped code review. Direct, opinionated, focused on the small set of things that are uniquely load-bearing in this codebase. Not a general-purpose linter.

## What this skill is FOR

- Code in `apps/api`, `apps/web`, or `packages/*` is being added, modified, or refactored.
- You want to know whether it respects the architectural commitments documented in `docs/adr/`.
- You want to know whether it will survive contact with the actual product loop (PM → agent → Doc → revision → review).

## What this skill is NOT for

- General style nits already enforced by Ultracite. The linter is the linter; we're not its understudy.
- Subjective taste on naming or formatting that has no operational consequence.
- Generic "is this code good?" assessments. Be specific or be silent.

## How to read the change

1. Read the diff in full. Don't just summarize — note every file touched and one sentence about what changed in each.
2. For each ADR referenced in the affected area, check whether the change reinforces or contradicts the decision. Specifically:
   - `ADR-0001` central server, online-only → no offline / local-first / CRDT logic.
   - `ADR-0002` MCP via SSE, not stdio → no local subprocess paths in the MCP server.
   - `ADR-0003` agent-driven onboarding → no in-UI setup wizard replacing the install.md path.
   - `ADR-0004` AI edits apply by default → handler defaults for `mode` are `"apply"`; suggestions are opt-in.
   - `ADR-0005` human-primary attribution → annotations carry `by="<user>" via="<agent>"`, never `by="AI"`.
   - `ADR-0006` no integrations → no Jira / Linear / Notion / Slack push code in `apps/api`.
   - `ADR-0008` web-only → no Electron / Tauri / React Native / Capacitor imports.
   - `ADR-0009` tech stack → no introduction of Node-only code paths, no abandonment of Bun, no Next.js full-stack API routes for backend logic.
   - `ADR-0010` PostHog as sole observability → no Sentry / Datadog / OTel SDKs added.
   - `ADR-0011` Coolify hosting → no Vercel-specific Edge runtime markers or other host-locking code.
3. Then go through the Fiche-specific checks below.

## Fiche-specific checks (priority order)

### 1. Transport-agnostic handler pattern (apps/api)

The four MVP verbs (`create_doc`, `get_doc`, `edit_doc`, `post_comment`) live in `apps/api/src/handlers/docs.ts`. Both `apps/api/src/routes/index.ts` (HTTP) and `apps/api/src/mcp/index.ts` (MCP-SSE) call them. The handler is the single source of truth.

Reject:

- Logic in a route handler that should be in `handlers/`. If `routes/index.ts` is doing anything more than `parse → call handler → return result`, it's wrong.
- Logic in the MCP handler that should be in `handlers/`. Same rule, other side.
- Anything that breaks one transport while updating the other. Both transports must continue to invoke the same handler.
- HTTP- or MCP-specific assumptions leaking into `handlers/` (e.g., reading raw headers, manipulating Elysia's context). Handlers take typed inputs and return typed outputs.

### 2. RFM round-trip safety (packages/db + handlers)

`revision.rfm` stores the entire Doc state, including comments and suggestions as CriticMarkup. ANY code that reads, writes, parses, or mutates this field is safety-critical.

Reject:

- Direct string manipulation of `rfm` content (insert/delete substrings). RFM has structure; treat it through `@roughdraft/rfm` (or an equivalent parser when we vendor it).
- Code that loses or reorders inline annotations during a transformation.
- Code that creates a new revision without copying forward the previous revision's annotations when the annotation spans were untouched.

### 3. Auth gating (apps/api)

Every route under `/api/docs/*` must require a real session. The session is exposed via Elysia's `.derive()` in `apps/api/src/index.ts`.

Reject:

- A new route that reads or modifies a Doc without checking `user`.
- A new route that gates on `session` but not on Doc ownership / collaborator membership.
- Any MCP verb that bypasses auth. The MCP token is per-user; handlers must respect it.

### 4. Schema migrations (packages/db)

Any change to `packages/db/src/schema.ts` must ship with a generated migration in `packages/db/drizzle/`. CI catches drift in the `schema-drift` job.

Reject:

- A PR that adds/removes/renames a column without `bun run db:generate` having been run and the result committed.
- A PR that hand-writes SQL in a migration when drizzle-kit would have generated it.
- A breaking schema change without a note about how to apply it (zero-downtime story or "self-host operators must re-migrate").

### 5. Ultracite rule compliance

The local rules that have already bitten this repo:

- `no-warning-comments`: no `// TODO:` / `// FIXME:` / `// XXX:` / `// HACK:`. Rephrase as prose, or extract to an issue.
- `func-style`: exports are arrow function expressions, not `function` declarations.
- `require-await`: an `async` function must `await` something. Drop `async` if it doesn't.
- `no-inline-comments`: comments live on their own line, never trailing code.
- `no-empty-file`: every shipped file has at least one real export.
- `no-magic-numbers`: extract to a named constant with a descriptive name.
- `sort-keys`: object keys are alphabetical (auto-fix handles this).

Reject any of these silently introduced. If `bun run check` would fail, the PR fails.

### 6. PostHog as the only observability vendor

Per ADR-0010.

Reject:

- New deps on `@sentry/*`, `@datadog/*`, `@opentelemetry/*`, or any other observability vendor.
- New PostHog event names that don't follow the agreed taxonomy (`signup_completed`, `mcp_first_connect`, `first_doc_created_by_agent`, etc.). If you're adding an event, document why in the PR.

## Universal checks (still real, just secondary)

- **Edge cases**: empty Doc, single-character span, span at index 0, span at end-of-file, span across multi-byte UTF-8 characters, an MCP request from an unauthenticated agent.
- **Error paths**: every `throw` is observable; no silent failures; no `catch` that just logs and continues unless the comment explains why.
- **Concurrency**: revision creation and "current revision pointer" update — is this atomic? If not, what happens when two agents edit the same Doc at once?
- **Indexing / N+1**: any new query over `revision` or `comment` data; does the index in `schema.ts` cover it?
- **Secrets**: no env values in code, no committed `.env`.

## What NOT to flag

- Naming preferences when the name is clearly readable.
- Single-line function ordering.
- Whether to use `const` or `let` (Ultracite handles this).
- "I'd have done it differently" comments without a concrete bug or violation behind them.
- Anything Prettier / Oxfmt would auto-fix.

## Output format

```markdown
## Review: <PR title or short description>

### Verdict
<APPROVE / REQUEST CHANGES / NEEDS DISCUSSION>

### Critical (block merge)

- **<file>:<line> — <one-line issue>**
  ADR or rule violated: <reference>
  Why it matters: <one sentence on the production-shaped consequence>
  Suggested fix: <concrete code direction, not a vague gesture>

### Worth fixing (do not block, but address)

- <file>:<line> — <issue with why and fix>

### Notes
<observations that aren't issues but are worth knowing>

### What's good
<one or two specific things, not generic praise>
```

If there are zero critical findings, say so plainly and stop. Don't pad.

## Tone

Direct. High-conviction. Pretend you're the senior engineer who has to maintain this code at 3am six months from now. Be specific. Cite files and lines. Reject vague language ("might want to consider…") in favor of concrete asks ("Move the parse step out of the route handler; it belongs in `handlers/docs.ts`.").

If you find nothing critical, that's the result. Don't manufacture findings.
