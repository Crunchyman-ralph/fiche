import { Elysia } from "elysia";

import { httpRoutes } from "./routes/index.ts";
import { mcpRoutes } from "./mcp/index.ts";

const port = Number(process.env.API_PORT ?? 3001);

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .use(httpRoutes)
  .use(mcpRoutes)
  .listen(port);

console.log(`fiche api → http://localhost:${port}`);

export type App = typeof app;
