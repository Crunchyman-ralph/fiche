# AI edits apply by default; Suggestions are opt-in

When an AI Co-author edits a Doc through the MCP, the default behaviour is to *apply* the edit directly — the Doc text changes, a new revision is recorded, and the human is not asked to accept anything. Suggestions (RFM `{++...++}` / `{--...--}` / `{~~...~>...~~}`) still exist, but only as an opt-in mode used when the AI is uncertain, when the human explicitly asks for "propose, don't apply", or when an edit deletes text the human authored.

## Why

The PM's working pattern with her agent is conversational: she tells the agent what to do, the agent acts, she glances at the result. Forcing every AI edit to land as a pending Suggestion that she must individually accept turns that flow into approval-clicking and destroys the smoothness that makes the AI worth having in the loop.

Linear revision history (ADR — implicit in the storage design) is the safety net. Any AI edit-session creates one revision; one click reverts the entire session. Granular accept/reject still exists for the cases where the human wants to cherry-pick — she opens the revision and sees the diff — but it's the exception, not the default.

This is against the grain of RFM's spec, which positions reviewable suggestions as the central artifact. We use RFM as the format because of its portability and human-readable annotations, not because we adopt its suggestion-first review model wholesale. Comments and explicit Suggestions still flow through RFM; "AI just edited the prose" flows through plain Markdown changes captured in revisions.

## Consequences

- The MCP write verbs likely unify into one with a mode flag — `edit_doc(doc_id, change, mode="apply"|"suggest", by, note?)` — rather than separate `apply` and `suggest` endpoints. Default mode is `apply`.
- The default behaviour of agents we ship skills/install.md for should be `apply`. The skill documentation makes the trade-off explicit so power users can opt their agent into `suggest` if they prefer.
- Revisions are now the *primary* safety affordance, not a "nice to have." The diff/compare view between revisions is MVP, not v1.1.
- Editing-while-PM-is-looking creates surprise UX. Doc-level presence (Q2) gives a soft hint ("Maya's AI is making changes") but we should be deliberate about how the UI signals an in-flight AI revision — a banner, a brief highlight on the changed spans, something that prevents "wait, did I just lose my place?"
