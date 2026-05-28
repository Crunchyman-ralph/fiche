// Transport-agnostic handlers. Called from both the HTTP router and the MCP server.
// Add real implementations against @fiche/db when the schema is ready.

import { z } from "zod";

export const createDocInput = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

export const getDocInput = z.object({
  id: z.string(),
});

export const editDocInput = z.object({
  doc_id: z.string(),
  span: z.object({ from: z.number(), to: z.number() }).optional(),
  change: z.string(),
  mode: z.enum(["apply", "suggest"]).default("apply"),
  by: z.string(),
  via: z.string().optional(),
  note: z.string().optional(),
});

export const postCommentInput = z.object({
  doc_id: z.string(),
  span: z.object({ from: z.number(), to: z.number() }).optional(),
  text: z.string(),
  by: z.string(),
  via: z.string().optional(),
  re: z.string().optional(),
});

export type CreateDocInput = z.infer<typeof createDocInput>;
export type GetDocInput = z.infer<typeof getDocInput>;
export type EditDocInput = z.infer<typeof editDocInput>;
export type PostCommentInput = z.infer<typeof postCommentInput>;

// TODO: wire these up to @fiche/db.
export async function createDoc(_input: CreateDocInput) {
  throw new Error("not implemented");
}

export async function getDoc(_input: GetDocInput) {
  throw new Error("not implemented");
}

export async function editDoc(_input: EditDocInput) {
  throw new Error("not implemented");
}

export async function postComment(_input: PostCommentInput) {
  throw new Error("not implemented");
}
