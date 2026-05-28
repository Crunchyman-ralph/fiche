// Better Auth config. Wired into Elysia at apps/api/src/index.ts.
//
// MVP providers: Google OAuth only. Email-based providers (magic links,
// email + password) are deferred until SMTP is set up. See the invite
// decision in CONTEXT.md (URL-only invites for MVP) and ADR-0003 for
// why the agent does most onboarding work anyway.

import { db, schema } from "@fiche/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const SECONDS_PER_DAY = 60 * 60 * 24;
const SESSION_LIFETIME_SECONDS = SECONDS_PER_DAY * 30;
const SESSION_REFRESH_AFTER_SECONDS = SECONDS_PER_DAY;

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} not set`);
  }
  return value;
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account: schema.account,
      session: schema.session,
      user: schema.user,
      verification: schema.verification,
    },
  }),

  emailAndPassword: { enabled: false },

  secret: requireEnv("BETTER_AUTH_SECRET"),

  session: {
    expiresIn: SESSION_LIFETIME_SECONDS,
    updateAge: SESSION_REFRESH_AFTER_SECONDS,
  },

  socialProviders: {
    google: {
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    },
  },
});

export type Auth = typeof auth;
export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
