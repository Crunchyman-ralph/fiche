# Tech stack: Bun + Elysia + Next.js + Turborepo

Fiche is built as a Turborepo monorepo on Bun. Two applications: `apps/api` (Elysia backend on Bun) and `apps/web` (Next.js App Router frontend). Shared packages under `packages/` for the RFM format, Drizzle schema, UI primitives, and config. End-to-end type safety is wired via Eden Treaty between Elysia and Next.js from day one.

## Why this shape (not Next.js full-stack)

Next.js full-stack would be the conservative pick, but it doesn't fit Fiche's two distinct workloads:

- **The MCP-SSE endpoint is a long-lived streaming connection** — the agent stays connected while it's working on a Doc. Next.js Route Handlers technically support streaming, but the framework's serverless-shaped opinions and Vercel's runtime limits make this fight the framework rather than use it. Elysia treats SSE as a first-class primitive.
- **The editor is a heavy client-side app**, while the marketing site, docs, and Doc landing pages benefit from SSR. Next.js handles the SSR/RSC half beautifully. Bundling the backend into the same Next.js app means co-bundling the editor with the API for no architectural gain.
- **Bun-native end-to-end** keeps the dev loop fast and the runtime story unified. Drizzle, Better Auth, and Elysia all run on Bun without special handling. We accept Bun as our one innovation token; the rest of the stack is intentionally boring.
- **Splitting backend out also keeps self-host honest**: `apps/api` can ship as a single Docker container running on any host, independent of how the frontend is served.

## The stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Bun** | Speed + native TypeScript + single binary. The one innovation token. |
| Monorepo | **Turborepo + Bun workspaces** | Industry standard for TS monorepos; fast caching; well-supported by Bun. |
| Backend | **Elysia (on Bun)** | First-class SSE, end-to-end types via Eden Treaty, idiomatic Bun. |
| Frontend | **Next.js (App Router)** | SSR for marketing + docs, RSC for landing pages, client components for the editor. Single frontend, no over-splitting. |
| UI | **Tailwind CSS + shadcn/ui** | Owned components (not a dep), production-grade defaults, fits the design system from ADR-0007's positioning. |
| Editor | **TipTap on ProseMirror** | Cherry-picked from roughdraft (their `packages/app` is MIT). Layer 1 (format) is `@roughdraft/rfm`; Layer 2 (editor) is TipTap, ours to evolve. |
| Format | **`@roughdraft/rfm`** | Used directly as a dependency, not forked. Layer 1 of the two-layer editor architecture. |
| Database | **Postgres (hosted) / SQLite (self-host)** | Drizzle schema is portable across both; hosted users get scale, self-hosters get a zero-dep file. |
| ORM | **Drizzle** | TypeScript-first, SQL-first, lightweight, Bun-friendly, supports both Postgres and SQLite from the same schema. |
| Auth | **Better Auth** | Modern, TypeScript, OAuth (Google) + email + magic links + sessions. Self-hostable. |
| Type sharing | **Eden Treaty (Elysia)** | Adopted day one. Frontend gets autocomplete on backend routes; refactors propagate automatically. |
| Linting / format | **Ultracite (Oxlint + Oxfmt)** | Ultracite is a zero-config preset orchestrating Oxlint + Oxfmt — Rust-based, faster than Biome, AI-agent-aware by default. `bun x ultracite check` / `bun x ultracite fix` is the surface. |
| Git hooks | **Lefthook** | Faster Husky alternative; runs `ultracite fix` on staged files pre-commit. |
| Unit tests | **Bun test** | Built into the runtime; no Jest setup. |
| E2E tests | **Playwright** | Standard for browser-driven testing of a collaborative editor. |
| Analytics + Errors + LLM observability | **PostHog** | One tool covers product analytics, session recording, error tracking, and LLM observability. See ADR-0010. |
| Docs framework | **Fumadocs** | Embedded as a route segment in `apps/web/app/docs/`. Next.js-native, MDX, search-first. |

## Repo layout

```
fiche/
├── apps/
│   ├── api/                # Elysia + Bun. MCP-SSE, REST, auth.
│   └── web/                # Next.js. Marketing + Fumadocs + editor.
├── packages/
│   ├── db/                 # Drizzle schema + migrations.
│   ├── ui/                 # Shared UI primitives.
│   └── config/             # tsconfig, biome config, shared types.
├── docs/                   # ADRs + design notes (this folder).
├── CONTEXT.md
├── README.md
├── ROADMAP.md
└── turbo.json
```

## Consequences

- One innovation token spent on Bun. Everything else is proven. We have a single "if this breaks we're in trouble" surface, and the broader ecosystem is mature enough that this risk is acceptable.
- Self-host story: ship as two Docker containers (api + web) or one combined image. Postgres or SQLite at the user's choice via the same Drizzle schema.
- Hosting strategy is decided in a separate ADR because the Vercel-vs-Coolify-vs-Fly question is independent of the framework shape.
- Eden Treaty adoption is non-negotiable from PR 1. Skipping it now means re-wiring later.

## Considered and rejected

- **Next.js full-stack** — co-bundling the editor with the API, fighting serverless opinions on SSE, and committing to Vercel-shaped deploy. Cleaner separation pays back.
- **Vite + React + Hono backend** — also valid; lighter per service. Lost out to Elysia + Next.js because Eden Treaty's DX edge and Next.js's SSR for marketing + Fumadocs are real wins.
- **Remix / React Router 7** — smaller ecosystem, no compelling edge for our use case.
- **Node runtime everywhere** — works fine, but Bun's speed + DX + single-binary install (`curl -fsSL https://bun.sh/install | bash`) is worth one innovation token. Drizzle + Elysia + Better Auth all run on Bun without special handling in 2026.
- **Splitting `apps/web` into separate marketing + docs + editor apps** — three Next.js apps in the monorepo for a solo team is overkill. One app with route segments is the right size.
