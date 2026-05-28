# PostHog for analytics, session recording, error tracking, and LLM observability

Fiche uses PostHog as the single source of truth for product analytics, session recordings, error tracking, feature flags, and LLM observability. The hosted Fiche product ships with PostHog enabled (opt-out via cookie banner). The self-hosted Fiche distribution ships with PostHog **disabled by default** — self-hosters opt in if they want it.

## Why one tool, not three

Product analytics + session recording + error tracking + LLM observability are typically four separate purchases (Mixpanel + LogRocket + Sentry + Helicone, or similar). PostHog covers all four in one bundle:

- **Product analytics** — events, funnels, cohorts, retention, paths. The agent-driven onboarding funnel (signup → install.md viewed → MCP token generated → MCP first connect → first Doc created by agent → first suggestion accepted) is the make-or-break funnel; drop-off between any two steps tells us where the product is broken.
- **Session recordings with input masking** — watch where the first 50 users hesitate. Critical for an MVP where the UI shape is still being validated.
- **Error tracking** — JS errors with stack traces, source maps, issue grouping. Critically, an error in the UI links directly to the session recording that produced it, which Sentry only achieves through third-party LogRocket integration.
- **Feature flags + A/B tests** — gate features by cohort, soft-launch experiments to small slices.
- **LLM observability** — track every MCP call, every agent edit, every prompt latency. Because the MCP write path is the central one, "is the agent succeeding?" is the load-bearing question, and PostHog's LLM-aware analytics surface it directly.
- **Surveys** — in-product qualitative signal once users exist.

## Open-source posture alignment

PostHog is itself open-source (MIT + Cloud commercial layer), which matches our Apache 2.0 + build-in-public stance. The self-hostable option is real; we are not betting on a closed vendor.

## Deployment defaults

| Deployment            | Analytics                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| **Hosted Fiche**      | PostHog Cloud enabled. Opt-out via cookie banner. EU users get GDPR-compliant consent flow.     |
| **Self-hosted Fiche** | Disabled by default. Operators opt in via env var (`POSTHOG_PROJECT_KEY=...`). Zero phone-home. |

This asymmetry is deliberate. Hosted users get the analytics so we can improve the product; self-hosters get full privacy by default and can connect their own PostHog instance if they want it.

## Day-one events (sacred funnel)

1. `signup_completed` — method (google / email)
2. `install_md_viewed` — agent-driven onboarding started
3. `mcp_token_generated`
4. `mcp_first_connect` — agent successfully reached us
5. `first_doc_created_by_agent` — the magic moment
6. `first_suggestion_accepted` — the loop closed

Plus the colleague-invite funnel:

1. `invite_link_copied`
2. `invite_link_clicked`
3. `colleague_signup_completed`
4. `colleague_first_comment`

Everything else relies on PostHog's auto-capture (clicks, page views, scroll, form interactions). Session recordings are enabled with input masking on by default; sensitive fields (Doc content, comments, suggestions) are not recorded.

## Stack alongside PostHog

- **No Sentry, no Segment, no warehouse pipeline.** One SaaS dashboard (PostHog) covers the entire observability story for MVP. Adding more is a v1.1+ decision.
- If PostHog's error tracking ever proves too thin (volume, alerting routing, or issue-grouping fidelity), Sentry is a drop-in addition. Reversible.

## Consequences

- Every event we instrument is event we'd have to re-fire if we ever switched analytics platforms. PostHog is therefore a sticky commitment; we accept that.
- Privacy posture is part of the product. The cookie banner, the consent flow, the "delete my account" path that nukes the PostHog identity — these are MVP requirements, not v1.1.
- LLM observability earns its keep specifically for us because the agent is a first-class actor. If the MCP path silently fails for some users, PostHog's LLM dashboards surface it before users churn.

## Considered and rejected

- **Mixpanel** — strong product analytics but no session recording or LLM observability. Forces buying complementary tools.
- **Amplitude** — similar to Mixpanel; enterprise-shaped pricing, less open-source friendly.
- **Plausible / Fathom** — lightweight privacy-first, but no event-level, funnel, or session-recording capabilities. Too thin for what we need.
- **LogRocket / FullStory** — strong on session recording, weak on product analytics. Would still need a Mixpanel/Amplitude alongside.
- **Building our own** — almost never the right call for analytics. Skip.
