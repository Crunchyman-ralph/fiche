import { Elysia, t } from "elysia";

import {
  createDoc,
  createDocInput,
  editDoc,
  editDocInput,
  getDoc,
  postComment,
  postCommentInput,
} from "../handlers/docs.ts";

// HTTP transport — what the web UI calls via Eden Treaty.
// The MCP transport (apps/api/src/mcp) wraps the same handlers for agents.
// Elysia does shape validation; Zod re-parsing at the boundary applies
// schema defaults (e.g. editDocInput's mode = "apply") so handlers
// receive a fully-defaulted input.
export const httpRoutes = new Elysia({ prefix: "/api" })
  .post("/docs", ({ body }) => createDoc(createDocInput.parse(body)), {
    body: t.Object({
      content: t.Optional(t.String()),
      title: t.Optional(t.String()),
    }),
  })
  .get("/docs/:id", ({ params }) => getDoc({ id: params.id }))
  .post(
    "/docs/:doc_id/edits",
    ({ body, params }) =>
      editDoc(editDocInput.parse({ ...body, doc_id: params.doc_id })),
    {
      body: t.Object({
        by: t.String(),
        change: t.String(),
        mode: t.Optional(t.Union([t.Literal("apply"), t.Literal("suggest")])),
        note: t.Optional(t.String()),
        span: t.Optional(t.Object({ from: t.Number(), to: t.Number() })),
        via: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/docs/:doc_id/comments",
    ({ body, params }) =>
      postComment(postCommentInput.parse({ ...body, doc_id: params.doc_id })),
    {
      body: t.Object({
        by: t.String(),
        re: t.Optional(t.String()),
        span: t.Optional(t.Object({ from: t.Number(), to: t.Number() })),
        text: t.String(),
        via: t.Optional(t.String()),
      }),
    }
  );
