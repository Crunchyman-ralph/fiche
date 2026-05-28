// Transport-agnostic handlers. Called from both the HTTP router and the MCP server.
// Add real implementations against @fiche/db when the schema is ready.

import { z } from "zod";

export const createDocInput = z.object({
  content: z.string().optional(),
  title: z.string().optional(),
});

export const getDocInput = z.object({
  id: z.string(),
});

export const editDocInput = z.object({
  by: z.string(),
  change: z.string(),
  doc_id: z.string(),
  mode: z.enum(["apply", "suggest"]).default("apply"),
  note: z.string().optional(),
  span: z.object({ from: z.number(), to: z.number() }).optional(),
  via: z.string().optional(),
});

export const postCommentInput = z.object({
  by: z.string(),
  doc_id: z.string(),
  re: z.string().optional(),
  span: z.object({ from: z.number(), to: z.number() }).optional(),
  text: z.string(),
  via: z.string().optional(),
});

export type CreateDocInput = z.infer<typeof createDocInput>;
export type GetDocInput = z.infer<typeof getDocInput>;
export type EditDocInput = z.infer<typeof editDocInput>;
export type PostCommentInput = z.infer<typeof postCommentInput>;

// Bodies below resolve to throw "not implemented"; real implementations
// land in the follow-up commit once the schema is migrated.
const notImplemented = (): never => {
  throw new Error("not implemented");
};

export const createDoc = (_input: CreateDocInput) => notImplemented();
export const getDoc = (_input: GetDocInput) => notImplemented();
export const editDoc = (_input: EditDocInput) => notImplemented();
export const postComment = (_input: PostCommentInput) => notImplemented();
