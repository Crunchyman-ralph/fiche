// Drizzle schema for Fiche.
//
// Two sections:
//   1. Better Auth tables (user, session, account, verification) — shape
//      required by better-auth's Drizzle adapter with provider "pg".
//   2. Domain tables (doc, revision, doc_collaborator). Comments and
//      Suggestions live inline in the revision's RFM via CriticMarkup
//      (ADR-0004, ADR-0005); no separate tables for MVP.
//
// See CONTEXT.md for the domain glossary.

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─────────────────────────── Better Auth ─────────────────────────────────

export const user = pgTable("user", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  id: text("id").primaryKey(),
  ipAddress: text("ip_address"),
  token: text("token").notNull().unique(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  accountId: text("account_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  id: text("id").primaryKey(),
  password: text("password"),
  providerId: text("provider_id").notNull(),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const verification = pgTable("verification", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  value: text("value").notNull(),
});

// ─────────────────────────── Domain ──────────────────────────────────────

// A Doc is the artifact being collaborated on. Its current state is the
// `currentRevisionId` revision's RFM. The FK is not enforced at the DB
// level because doc <-> revision is circular; the relation is declared
// via Drizzle's `relations()` below and enforced at the app level.
export const doc = pgTable(
  "doc",
  {
    createdAt: timestamp("created_at").notNull().defaultNow(),
    currentRevisionId: text("current_revision_id"),
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    ownerIdx: index("doc_owner_idx").on(t.ownerId),
  })
);

// A Revision is one immutable snapshot of a Doc's RFM. AI edits in "apply"
// mode create a new revision; "suggest" mode embeds suggestions in the
// existing revision's RFM as CriticMarkup. The `agent` field records the
// `via` attribution (e.g. "claude", "codex") when an Agent acted on the
// Co-author's behalf — see ADR-0005.
export const revision = pgTable(
  "revision",
  {
    agent: text("agent"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    docId: text("doc_id")
      .notNull()
      .references(() => doc.id, { onDelete: "cascade" }),
    id: text("id").primaryKey(),
    parentRevisionId: text("parent_revision_id"),
    rfm: text("rfm").notNull().default(""),
  },
  (t) => ({
    docIdx: index("revision_doc_idx").on(t.docId, t.createdAt),
  })
);

// A Co-author other than the owner who has access to a Doc. The invite
// flow (URL-only per the identity decision) inserts a row here once the
// invitee signs in.
export const docCollaborator = pgTable(
  "doc_collaborator",
  {
    addedAt: timestamp("added_at").notNull().defaultNow(),
    addedById: text("added_by_id")
      .notNull()
      .references(() => user.id),
    docId: text("doc_id")
      .notNull()
      .references(() => doc.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.docId, t.userId] }),
  })
);

// ─────────────────────────── Relations ───────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  ownedDocs: many(doc),
  sessions: many(session),
}));

export const docRelations = relations(doc, ({ one, many }) => ({
  collaborators: many(docCollaborator),
  currentRevision: one(revision, {
    fields: [doc.currentRevisionId],
    references: [revision.id],
  }),
  owner: one(user, { fields: [doc.ownerId], references: [user.id] }),
  revisions: many(revision),
}));

export const revisionRelations = relations(revision, ({ one }) => ({
  author: one(user, { fields: [revision.authorId], references: [user.id] }),
  doc: one(doc, { fields: [revision.docId], references: [doc.id] }),
  parent: one(revision, {
    fields: [revision.parentRevisionId],
    references: [revision.id],
    relationName: "revision_parent",
  }),
}));

export const docCollaboratorRelations = relations(
  docCollaborator,
  ({ one }) => ({
    addedBy: one(user, {
      fields: [docCollaborator.addedById],
      references: [user.id],
      relationName: "doc_collaborator_added_by",
    }),
    doc: one(doc, {
      fields: [docCollaborator.docId],
      references: [doc.id],
    }),
    user: one(user, {
      fields: [docCollaborator.userId],
      references: [user.id],
    }),
  })
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));
