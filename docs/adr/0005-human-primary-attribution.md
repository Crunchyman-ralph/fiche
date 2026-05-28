# Human-primary attribution for AI-assisted edits

Every annotation in a Doc — Comment, Suggestion, applied edit — is attributed to a human Co-author. When an Agent (Claude, Codex, etc.) made the change on the Co-author's behalf via MCP, the Agent is recorded as `via`, not as `by`. The data model is `by="ralph" via="claude"`, not `by="AI"`.

## Why

The Slack pattern ("Sent using @Claude" appended to a human-authored message) is what users already understand. The human is the actor and the responsible party; the AI is the tool they used. Treating the Agent as a separate first-class co-author obscures responsibility, breaks audit trail semantics ("Ralph said yes — but actually, Ralph's AI did, on Ralph's account, with Ralph not even watching"), and produces confusing UI where users wonder which AI did what.

In RFM, `by` is a free-form label — the spec uses "user" and "AI" as illustrative examples, not as enums. We extend the attribute model with `via` to capture Agent identity without breaking spec compatibility (other tools ignore unknown attributes).

## Consequences

- UI shows "Ralph" as the actor with a small Agent icon (Claude/Codex/Cursor) when `via` is present. Tooltip or detail panel shows "Ralph, via Claude, 2:14 PM" for transparency.
- Audit / revision history is per-human. "Ralph made 12 edits today" counts all edits Ralph triggered, including ones Claude performed on his behalf.
- Multiple Agents per user is supported by data but probably not surfaced in UI for MVP. If a Co-author connects multiple Agents, each annotation records which one acted.
- Open question deferred: how do we handle Agent actions that _no human authorized_ — e.g., a scheduled summarization or a cron job? Probably needs a `bot` or `service` attribution class later. Not MVP.

## Considered and rejected

- **`by="AI"` as a distinct co-author** (RFM's example convention): clean for the spec's portability story but wrong for our product — it makes the AI sound like an autonomous participant when it's actually Ralph's tool.
- **Per-Agent identities with their own accounts.** Would require granting an Agent first-class identity, its own login, its own permissions. Overengineered for the actual use case (Ralph's tool, acting as Ralph) and produces UI clutter.
