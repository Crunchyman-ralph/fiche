# No integrations. The user's Agent is the bridge.

Fiche does not ship integrations to Jira, Linear, Notion, Confluence, Slack, or any other external system. The user's own Agent — already configured with MCPs to the tools she uses every day — is the integration story. When a PM wants to "push this Doc's accepted Risks section to Linear," her Agent does it through _her_ Linear MCP, with her credentials, on her behalf. Fiche stays focused on being the Doc surface.

The one explicit exception is link unfurl / OEmbed endpoints (Slack, Discord, Notion-mention previews). These require no maintenance from us — the consumer side opts in — and they make pasted Fiche URLs look like real artifacts in the channels where invites actually flow. They are infrastructure, not integration.

## Why

Competing with chatprd, Productboard, or Notion on integration breadth is a fight we lose by entering: they have head starts, teams, and brand. The bring-your-own-agent posture (ADR-0003, the MCP architecture in general) makes integrations strategically unnecessary — the AI ecosystem now has MCPs to every system a PM cares about, and the user's Agent already speaks all of them. Building duplicate integrations would compete with the user's own agent for the same job and pay a maintenance tax forever.

This is integration-_pull_, not integration-_push_: integrations enter the roadmap only when a paying or near-paying user's continued use specifically depends on Fiche owning the integration (e.g., their agent demonstrably can't do it, and the work has to live in Fiche). Volunteer or speculative integration PRs are politely refused or routed to a separate community repo; they do not ship as part of core.

## Consequences

- Fiche's surface area stays tiny. The team-of-one execution story becomes feasible.
- The MCP write API and the install.md / Claude Code skill quality is doubly load-bearing — they're how the user's Agent succeeds at the work that integrations would otherwise do.
- Prospects who churn because "you don't sync to Jira" are accepted as the cost of this posture, _for a meaningful sample size_. A few early "I want Jira sync" requests are not a market verdict; they're the n=1 trap.
- Marketing copy and sales conversations must affirmatively name the bring-your-own-agent thesis. If we can't articulate "your agent already has the integrations" clearly, users will read the absence as a missing feature instead of a deliberate posture.

## Considered and rejected

- **One existence-proof integration (e.g., Linear) at MVP.** Buys credibility cheaply, but starts the integration drumbeat the day we ship — every prospect who sees Linear support asks when Jira is coming. Better to hold the line than open the door.
- **chatprd-style integration breadth.** Wrong fight, wrong execution shape, multi-quarter detour.
