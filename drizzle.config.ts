import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  dialect: "postgresql",
  out: "./packages/db/drizzle",
  schema: "./packages/db/src/schema.ts",
  strict: true,
  verbose: true,
});
