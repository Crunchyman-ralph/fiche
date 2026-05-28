# Roadmap

Things deliberately deferred from MVP but expected to ship later. Rejections-forever live in ADRs; this file is the "yes eventually" list.

## v1.1 candidates

- **Archive for Docs.** Soft state — out of the active list but still accessible and not read-only. Cuts list clutter once a user has accumulated Docs.
- **Email-based invites.** A "send invite by email" path alongside the MVP URL-only model. Requires SMTP / Resend / Postmark; pulls in email-deliverability work. Worth it once we see invite drop-off attributable to "PM doesn't want to paste link in Slack."
- **More login providers.** Microsoft / SAML / Okta if enterprise interest shows up. MVP is Google + email.
- **Lightweight in-Doc AI prompts.** Highlight a span → "ask AI to rewrite / tighten / add risks section." Single-shot prompts, not a chat panel. Requires a model relay (or BYO API key per user). Bounded scope; not chat.
- **CLI.** Reuse MCP token. Useful only if MCP-SSE auth proves unreliable for some agent or if power users want scripting. Punt until demanded.
- **Skill packages for non-Claude agents.** Codex and Cursor skills ship with MVP if cheap; broader agent coverage (Cline, Aider, etc.) is a v1.1 item.

## Larger post-MVP

- **Open-core team features.** Workspaces, role-based access, audit log exports, SSO. The eventual paid surface. Belongs after we see real collaboration graphs forming organically (Doc-centric model accumulates this data without users having to define "the team").
- **Integrations.** Jira / Linear / Notion / Confluence push-and-pull. chatprd's moat; we revisit only if collab-first traction stalls without them.
- **Integrated agent surface.** A "Claude Code beside the Doc" UX where the chat lives next to the Doc, rather than alt-tabbed to. Explicitly post-MVP per ADR-0003 (chat is external for now).

## Explicitly parked (different product, not "later" of this one)

- **Spec-compiler.** The old developer-product idea (agreed plan → testable checklist → bisectable commits). Possibly a different product later, not this one.
- **gbrain / per-doc persistent memory.** Empire before village.
- **Build-loop (hand spec to an agent to ship).** Developer-product layer.
