import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react, next],
  ignorePatterns: [
    ...core.ignorePatterns,
    // Vendored skills and agents — third-party content tracked by
    // skills-lock.json. Not subject to our lint rules.
    ".agents/skills/**",
    ".agents/agents/**",
    ".claude/skills/**",
    ".claude/agents/**",
    ".codex/skills/**",
    ".codex/agents/**",
    // Drizzle-generated migration artefacts.
    "packages/db/drizzle/**",
  ],
});
