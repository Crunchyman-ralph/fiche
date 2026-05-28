# Hosting: Coolify (homelab or Hetzner VPS — final hardware TBD)

The hosted Fiche instance runs on Coolify. Both `apps/api` (Elysia) and `apps/web` (Next.js) deploy as Docker containers managed by Coolify. Postgres runs as a Coolify-managed service alongside. Self-hosters get the same Docker images and the same Coolify-compatible compose file.

The hardware Coolify runs on is deliberately not yet decided. Two real options:

- **Homelab.** Zero recurring cost; uses existing infrastructure; uptime depends on home internet and power.
- **Hetzner Cloud VPS** (CX22 ~€4/mo, CX32 ~€8/mo). Reliable uptime, multi-region availability, costs trivial money.

We commit to Coolify as the orchestration layer because that decision shapes the architecture (Docker, compose-compatible self-host story, etc.). The hardware question is a deploy-time call we make when the link starts going to people who aren't us.

## Why this, not Vercel + Fly / Railway

The stack (ADR-0009) has one workload that Vercel cannot handle well: long-lived MCP-SSE connections. The agent stays connected to `apps/api` while it's working on a Doc, which is incompatible with Vercel's serverless function timeouts (5min Pro, 30s Edge). Splitting deployment across Vercel (web) + Fly/Railway (api) is the cleanest "best frontend host + best backend host" answer, but it adds a second provider, a second deploy pipeline, and a CORS / origin surface that we'd rather not own at MVP.

Coolify on a single VPS sidesteps all of this:

- **One provider, one deploy.** Push to main → Coolify rebuilds → both services restart. Solo founder doesn't context-switch between providers.
- **Long-lived processes work natively.** Coolify is a container orchestrator over Docker; SSE connections live as long as the process. No serverless gymnastics.
- **Self-host parity is automatic.** The Docker images and compose file we use for hosted are the same artifacts self-hosters deploy. "It works on my Coolify" generalizes to "it works on your Coolify / Docker Compose / Kubernetes / whatever runs containers."
- **Cost is trivial.** Hetzner CX22 (2 vCPU, 4GB RAM) is ~€4/mo. CX32 (4 vCPU, 8GB RAM) is ~€8/mo. Headroom for MVP through significant early traction.
- **Leverages existing infra.** Operator already runs Coolify; less new tooling to learn.

## Homelab vs Hetzner — the deferred sub-decision

Both are valid; the call gets made when we know who's clicking the link.

- **Homelab Coolify** works fine for pure private alpha — solo testing, the operator's own usage, demos run live with the operator present. Zero cost. Risk: when the link goes to a PM friend at a random hour, uptime depends on home internet, home power, and the operator not unplugging anything.
- **Hetzner Cloud Coolify** removes that risk for ~€4-8/mo. The link loads when someone clicks it, even if the operator is asleep. Build-in-public eventually requires this.

The transition between the two is undramatic: same Coolify, same compose file, different host. Migrating later costs an evening, not an architecture rewrite.

## Deployment shape

```
(Homelab Linux box, or Hetzner CX22 to start)
└── Coolify
    ├── apps/web        (Next.js Docker container, port 3000)
    ├── apps/api        (Elysia Docker container, port 3001)
    ├── postgres        (Coolify-managed Postgres 16)
    └── (optional later) PostHog self-hosted
```

- **Domain:** `fiche.ralph.codes` for MVP (subdomain on existing domain per the in-conversation decision to defer buying `fiche.md`). Coolify handles Let's Encrypt + reverse proxy.
- **Subdomains:** `app.fiche.ralph.codes` for `apps/web`, `api.fiche.ralph.codes` for `apps/api`. Or single host with path-based routing — to be decided at scaffold time.
- **Backups:** Coolify-managed Postgres backups to S3-compatible storage (Hetzner Object Storage or similar). Cheap, automatic.

## Self-hosters

Self-hosters get the same artifacts:

- A published Docker image per app (`ghcr.io/<org>/fiche-api`, `ghcr.io/<org>/fiche-web`).
- A `docker-compose.yml` in the repo root that brings up everything (api + web + postgres) with one command.
- Documentation in `apps/web/app/docs/self-hosting` covering Coolify, plain Docker Compose, and Kubernetes (community-maintained Helm chart later if there's demand).

Self-hosters with their own Coolify import the compose; Docker users `docker compose up`; everything else is community-supported.

## Consequences

- We do not get Vercel's edge CDN for marketing pages. Hetzner is a single region (likely Falkenstein / Helsinki). For early stage this is fine; if traffic patterns demand it later, Cloudflare in front of Coolify covers global edge caching at the proxy layer without changing the app architecture.
- One VPS = one point of failure. Acceptable for MVP. When user count justifies it, we either scale vertically (bigger Hetzner box) or move to a managed Postgres + multi-region setup.
- Coolify is an open-source project with one primary maintainer — there's some bus-factor risk on the orchestration layer. Mitigant: Coolify wraps Docker, so worst case we drop Coolify and run Docker Compose directly.

## Considered and rejected

- **Vercel (web) + Fly.io / Railway (api) + Neon (Postgres)** — best-of-breed split. Two providers, two deploys, CORS surface, multiple billing relationships. Right for a team; overkill for solo MVP.
- **Fly.io for everything** — solid alternative, cloud-managed, multi-region story. Lost out to Coolify because operator already runs Coolify and prefers single-platform. Real consideration for migration later.
- **Railway for everything** — sane defaults, single platform, but pricing scales with usage in ways that punish long-lived SSE connections.
- **AWS / GCP / Azure** — wrong tool for solo MVP. The hyperscalers are right when ops complexity is the limiting factor; for us it's the opposite.
- **Vercel-only with serverless workarounds for SSE** — fighting the platform. No.
