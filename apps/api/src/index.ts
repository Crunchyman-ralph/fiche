import { Elysia } from "elysia";

import { auth } from "./auth.ts";
import { mcpRoutes } from "./mcp/index.ts";
import { httpRoutes } from "./routes/index.ts";

const port = Number(process.env.API_PORT ?? 3001);

const app = new Elysia()
  // Better Auth mounts at /api/auth/*. Any path under this prefix is
  // delegated to Better Auth's handler, which speaks the Web API
  // Request/Response shape Elysia passes through.
  .all("/api/auth/*", ({ request }) => auth.handler(request))

  // Make session + user available to every downstream route via context.
  // Handlers can read `user` to gate access; null = unauthenticated.
  .derive(async ({ request }) => {
    const result = await auth.api.getSession({ headers: request.headers });
    return {
      session: result?.session ?? null,
      user: result?.user ?? null,
    };
  })

  .get("/health", () => ({ status: "ok" }))
  .use(httpRoutes)
  .use(mcpRoutes)
  .listen(port);

console.log(`fiche api → http://localhost:${port}`);

export type App = typeof app;
