import { Elysia } from "elysia";

import {
  createDoc,
  createDocInput,
  editDoc,
  editDocInput,
  getDoc,
  getDocInput,
  postComment,
  postCommentInput,
} from "../handlers/docs.ts";

// MCP transport over SSE (ADR-0002). Wraps the same handlers as the HTTP routes.
// One handler, two transports.
//
// Wire the official MCP SDK in once the agent integration story is being built.
// This stub exposes `/mcp/tools` to surface the available tool schemas and
// `/mcp/sse` as the streaming endpoint; replace with the official server impl.

const tools = [
  {
    handler: createDoc,
    inputSchema: createDocInput,
    name: "create_doc",
  },
  {
    handler: getDoc,
    inputSchema: getDocInput,
    name: "get_doc",
  },
  {
    handler: editDoc,
    inputSchema: editDocInput,
    name: "edit_doc",
  },
  {
    handler: postComment,
    inputSchema: postCommentInput,
    name: "post_comment",
  },
] as const;

export const mcpRoutes = new Elysia({ prefix: "/mcp" })
  .get("/tools", () =>
    tools.map((t) => ({
      // Surfaces tool name only today; the MCP SDK wiring will emit
      // full JSON Schema here once @modelcontextprotocol/sdk is in.
      input: t.name,
      name: t.name,
    }))
  )
  .get(
    "/sse",
    () =>
      new Response("mcp sse endpoint placeholder", {
        headers: { "content-type": "text/event-stream" },
      })
  );
