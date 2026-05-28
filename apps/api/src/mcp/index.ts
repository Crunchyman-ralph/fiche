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
    name: "create_doc",
    inputSchema: createDocInput,
    handler: createDoc,
  },
  {
    name: "get_doc",
    inputSchema: getDocInput,
    handler: getDoc,
  },
  {
    name: "edit_doc",
    inputSchema: editDocInput,
    handler: editDoc,
  },
  {
    name: "post_comment",
    inputSchema: postCommentInput,
    handler: postComment,
  },
] as const;

export const mcpRoutes = new Elysia({ prefix: "/mcp" })
  .get("/tools", () =>
    tools.map((t) => ({
      name: t.name,
      // TODO: emit JSON Schema once the MCP SDK is wired.
      input: t.name,
    })),
  )
  .get("/sse", () => {
    // TODO: full JSON-RPC-over-SSE handshake via @modelcontextprotocol/sdk.
    return new Response("mcp sse endpoint placeholder", {
      headers: { "content-type": "text/event-stream" },
    });
  });
