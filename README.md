# Fiche

> The Figma playground for PMs — a place to collaborate with delight on PRDs, briefs, and plans, with your AI agent and your colleagues, before exporting to the misery tools where work goes to be tracked.

> Pronounced *feesh*. From the French — a focused, structured note. Every Doc in Fiche is, literally, a fiche.

## The bet

Developers have endless tools. PMs settle for tools built for devs (VSCode to view markdown, GitHub to collaborate) and find them scary. The market leader in AI-PRD tooling is a document generator with collaboration locked behind a per-seat fee.

We are not another generator. We are the collaboration substrate — Word-style comments and suggested edits over plain Markdown, with your own Claude Code / Codex / Cursor acting as a first-class participant in the Doc alongside human colleagues.

The integrations everyone else is racing to ship? Your agent already has them. Your Claude Code can talk to Jira, Linear, Notion, Confluence, Slack — because *you* configured it to. Fiche doesn't compete with your agent for that job. We stay focused on being the place upstream where the thinking and the review happen.

## What we're building (MVP)

- Multi-user collaboration on a Markdown Doc, with doc-level presence (avatars in the top bar).
- Word-style comments and suggested edits — threaded, accept/reject, no Markdown syntax in the user's face.
- Linear revision history with a diff/compare view between any two revisions. One-click restore.
- Bring-your-own-agent via MCP over SSE. Your AI authors and edits the same Doc you're reviewing.
- Agent-driven onboarding — paste a prompt into Claude Code, your agent does the setup. We don't ship a UI wizard.
- One-click export to clean Markdown.
- Online-only, hosted-first; self-host is available for technical teams.

## What we're deliberately *not* building

- **Integrations** to Jira / Linear / Notion / Confluence. Your agent already has those. See [ADR-0006](docs/adr/0006-no-integrations-agent-is-the-bridge.md).
- **An in-product chat panel.** Your agent is the chat. See [ADR-0003](docs/adr/0003-agent-driven-onboarding.md).
- **A document generator.** We have no opinions about how you write a PRD. That's the chatprd fight; not ours.
- **Branching, sign-off, "Final" status, alignment workflows.** Alignment conversations happen in Slack and on Zoom; we don't try to move them into a doc tool.
- **Offline mode, CRDT, live cursors.** See [ADR-0001](docs/adr/0001-central-server-online-only.md).
- **A stdio MCP server.** Onboarding has to be paste-a-URL, not edit-a-config-file. See [ADR-0002](docs/adr/0002-mcp-sse-not-stdio.md).

## Repo orientation

- [`CONTEXT.md`](CONTEXT.md) — domain language. Read this first if anything in the docs or code looks ambiguous.
- [`ROADMAP.md`](ROADMAP.md) — what's deferred from MVP and why. Sparse on purpose.
- [`docs/adr/`](docs/adr/) — the load-bearing architectural decisions, one paragraph each.

## Format

Docs are stored as [Roughdraft-Flavored Markdown](https://github.com/Lex-Inc/roughdraft) (`@roughdraft/rfm`) — plain Markdown plus a small, portable review layer (CriticMarkup-based). The choice means:

- Your Doc is always inspectable, diffable, and Git-friendly.
- An AI agent can read and write the same file a human reads in the UI, without a sidecar database or hosted document format.
- Fiche isn't a lock-in. Export-to-Markdown is a single button; the file you export is the file we stored.

## Status

Pre-alpha. Building in public. Not yet shipped. The plan was sharpened through a long structured conversation; the decisions and the language live in the files above. The first working version will appear here once the editor spike is done.

## License

Apache 2.0. See [LICENSE](LICENSE).
