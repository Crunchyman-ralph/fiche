# Fiche

A collaborative document surface for product managers and their AI agents. Word-style commenting and suggested edits over a plain-markdown file, with the user's own AI agent (Claude Code, Codex, etc.) acting on their behalf alongside human colleagues.

Positioning: Fiche is the **Figma playground for PMs** — the place where PMs collaborate with delight, with their agents and with each other, before exporting to the misery tools (Jira, Linear, Notion, Confluence) where the work goes to be tracked. It is upstream of those tools, not a replacement for them.

The name comes from the French _fiche_ — a focused, structured note or record (a _fiche produit_, a _fiche de lecture_, the colored draft paper students use during the bac). Every Doc in Fiche is, literally, a fiche.

## Language

**Doc**:
The artifact being collaborated on. A plain markdown file with RFM annotations on top. Product positioning treats Docs as PM artifacts (PRDs, briefs, RFCs, plans), but the data model is generic — no schemas, kinds, templates, or validation. The PM brings their own way of writing; we provide the surface to collaborate on it.
_Avoid_: PRD, spec, plan, file, document, page (these are particular shapes a Doc can take, not the thing itself).

**Co-author**:
A human collaborator on a Doc. Co-authors act through either the web UI directly or through an Agent acting on their behalf via the MCP. Every annotation has a Co-author as its `author` (RFM `by`); an Agent, if used, is recorded as `via`.
_Avoid_: collaborator, reviewer, editor, contributor.

**Agent**:
An AI tool (Claude Code, Codex, Cursor, Copilot, etc.) that performs actions on a Co-author's behalf via the MCP. Agents are _means_, not actors — they do not have their own identity in a Doc. When an Agent makes a change, the annotation reads `by="<co-author>" via="<agent>"` (e.g., `by="ralph" via="claude"`), matching the Slack convention of attributing to the human with the AI noted as the vehicle.
_Avoid_: AI co-author, AI user, bot, assistant.

**Suggestion**:
A pending edit attached to a span of a Doc — insertion, deletion, or replacement — that does not change the Doc's accepted text until a human accepts it. Produced by Co-authors (typically the AI, occasionally a human). Stored as RFM `{++…++}` / `{--…--}` / `{~~…~>…~~}`.
_Avoid_: edit, change, diff, proposal, patch.

**Comment**:
A note attached to a span of a Doc that never changes the Doc's text. Forms threads (`re=`-linked replies). Both humans and AI agents can post Comments. Stored as RFM `{>>…<<}`.
_Avoid_: annotation (ambiguous — Suggestions are also annotations in the RFM sense), note, remark, feedback.

**RFM (Roughdraft-Flavored Markdown)**:
The on-disk storage format for Docs. CriticMarkup plus a small metadata block; portable, diffable, git-readable. Used as plumbing — never surfaced to the PM in UI or copy.
_Avoid_: "our format", CriticMarkup (the underlying spec, but not what we call our format internally).
