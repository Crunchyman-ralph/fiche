# Fiche

The Figma playground for PMs. Pronounced *feesh*.

A place where you, your colleagues, and your AI all work on the same doc. Your AI isn't a chat panel beside the doc or a generator that spits out a draft and disappears. It actually edits the same file you're reviewing.

## Why this exists

The PMs I've shown this to all live in Claude Code or Codex now. They ask their AI for a PRD, it writes a markdown file, and then they're stuck. VS Code feels hostile if you're not a dev, GitHub PRs are a non-starter when you just want a colleague to leave a comment, and chatprd will let you collaborate but only behind a $29-per-seat paywall and with very loud opinions about what a PRD should look like.

Fiche is what I wanted to exist between "I asked Claude for a draft" and "I pushed the tickets to Linear." You and your colleagues comment and suggest like in Google Docs. Your AI edits the same file through MCP, not "here's a draft, please copy-paste it back." When the doc is done, export to clean markdown and paste it wherever it needs to live next.

The integrations everyone else is racing to ship? Your agent already has them. Your Claude Code talks to Jira, Linear, Notion, Slack because you set it up to. Fiche doesn't try to be your agent's toolbelt. We sit upstream of all that, the place where the thinking happens before anything goes to the tools that just track it.

## What's in MVP

Real-time editing on a shared doc, laid out so markdown syntax never stares back at you. Word-style accept/reject on comments and suggested edits. Revision history for the times your AI takes a turn you regret. Doc-level presence so you can see who else has the tab open. An MCP endpoint your agent connects to with one URL paste, no binary install, no JSON config. One export button.

Online-only, hosted by us. Self-host works if you have a Docker host and want to run it yourself; same image either way.

## What's not in MVP, and why

No Jira / Linear / Notion sync. Your agent has those. I'm not interested in shipping a worse version of integrations you already configured ([ADR-0006](docs/adr/0006-no-integrations-agent-is-the-bridge.md)).

No in-product chat panel. Your agent is the chat. The whole product breaks the moment we try to be ChatGPT too ([ADR-0003](docs/adr/0003-agent-driven-onboarding.md)).

No PRD generator. I have no opinions about how you write a doc. That's chatprd's fight, and they can have it.

No branching, no sign-off, no "Final" stamps. Alignment conversations happen in Slack and on Zoom; a doc tool trying to host that is fighting Slack for a job Slack already does.

No offline mode, no CRDT, no live cursors mid-paragraph. The wedge is collaboration on shared state, not local-first sync ([ADR-0001](docs/adr/0001-central-server-online-only.md)).

No stdio MCP. Connecting your agent has to be "paste this URL," not "install this binary and edit a config file" ([ADR-0002](docs/adr/0002-mcp-sse-not-stdio.md)).

## Repo orientation

- [`CONTEXT.md`](CONTEXT.md): the glossary. If a word means something specific in Fiche, it's defined here.
- [`ROADMAP.md`](ROADMAP.md): what's deferred from MVP, and why.
- [`docs/adr/`](docs/adr/): the load-bearing decisions, each with the reasoning that produced it.

## On the format

Docs are stored as [Roughdraft-Flavored Markdown](https://github.com/Lex-Inc/roughdraft) (`@roughdraft/rfm`): plain markdown plus CriticMarkup for comments and suggestions. No proprietary format, no lock-in. Open the file in any markdown editor, diff it in git, hand it to a different AI. The file you export is the file we stored.

## Status

Pre-alpha. Plan and scaffold are here; no UI yet. Building in public from this commit on.

## License

Apache 2.0.
