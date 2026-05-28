# Agent-driven onboarding

After signup, the canonical onboarding path is "paste this prompt into your AI agent, let it set you up." The agent reads our install.md (or equivalent skill), configures the MCP-SSE connection, and creates the user's starter Doc as its first action. We do not ship a UI wizard, a guided tour, or a product walkthrough. We ship a well-written install.md and a Claude Code / Codex skill.

## Why

Our user is AI-native by definition — a PM already using an agent every day. They reach for chat before menus; their UI is increasingly *their agent*. A traditional onboarding wizard treats them as if they don't already have a better tool for stepping through instructions. They do, and it's the same tool we want connected to Fiche anyway. Letting the agent do the work demonstrates the product's central value in the first session — the starter Doc exists because the agent put it there, in the user's real environment, not because we pre-baked a sandbox.

Inspiration: browser-harness onboards exactly this way — the install.md is the UI.

Consequences worth recording:

- install.md (and the equivalent Claude Code / Codex skill) is a shipped product artifact. It must be idempotent, clear, and runnable by an agent without human help in the loop. Authoring quality is load-bearing.
- We are explicitly not serving the PM who doesn't have an agent yet. A small fallback page directs them to Claude Code / Codex installation and stops there. This is a deliberate market narrowing.
- The MCP `create_doc` verb is mandatory for MVP, not optional — without it the agent cannot complete onboarding.
- No starter-Doc pre-baking. Seed data is an empty Doc list. The first Doc the user sees is one their own agent made.

## Considered and rejected

- **MCP-first wall** (block the product until they connect): high friction, anti-virality.
- **Doc-first blank canvas** (let them poke around, MCP later): the magic moment becomes optional and most users never reach it.
- **Pre-baked Sample Doc + parallel CTAs**: better than the other two but still ships a fake demo in place of the real thing the agent could produce.
