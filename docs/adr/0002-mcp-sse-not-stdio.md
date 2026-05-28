# MCP transport is SSE, not stdio

Fiche's MCP server runs hosted (on our managed instance, or on the self-hoster's server) and serves clients over SSE/HTTP with token-based auth. We do not ship a stdio MCP server.

## Why

Stdio MCP servers require the user to install a local binary and edit a JSON config file to register the subprocess. That works for developers and is the standard pattern for most existing MCP servers — and it is a brutal onboarding for non-technical PMs. SSE flips it: the user pastes a URL + token into their agent's config and the connection works. There is no local install, no `claude_desktop_config.json` edit, no subprocess lifetime to manage.

Consequences worth recording:

- The MCP server is part of our hosted infrastructure, not a downloadable artifact. Self-hosters run their own MCP endpoint as part of the Fiche server they're already running (ADR-0001) — no extra moving part.
- Auth uses the per-user token model already settled (one token per Fiche user; the agent acts on the user's behalf, with the RFM `by="AI"` field distinguishing AI vs human edits at annotation time).
- A CLI is not part of MVP. If one is ever built it should reuse the same auth model so a single token works for both surfaces.
- We are explicitly betting that SSE-MCP auth is standard and reliable enough to be the only path. If that bet sours, the fallback is stdio — but it would be a real regression in onboarding quality.

## Considered and rejected

- **Stdio (standard MCP shape)**: ubiquitous, but the onboarding cost is what makes the difference between a non-technical PM connecting their agent successfully and not.
- **Both stdio and SSE**: doubles the surface to test and maintain, and forces us to document two onboarding paths. Skip until proven necessary.
