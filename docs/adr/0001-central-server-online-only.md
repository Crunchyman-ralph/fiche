# Central server, online-only collaboration

Fiche requires a central server for every deployment, including self-host. There is no offline mode, no local-first storage, and no CRDT/sync engine — Docs live on the server and clients read/write against it while connected.

## Why

The wedge ("two people and their AI on the same Doc") is collaboration. Local-first architectures (Roughdraft is one) optimize for solo authorship with optional sync; they make multi-user collaboration a long, expensive engineering project (CRDT, conflict resolution, sync transports, offline edit reconciliation). We are doing the opposite — collaboration is the first feature, not the last — so the cheap path is to require a server and skip CRDT entirely.

Consequences worth recording:

- Self-hosters need an always-on server. There is no "download a desktop app and run Fiche locally" path. This is deliberate; the desktop-app shape would kill the collaboration wedge.
- The "open-source, free, self-hostable" posture from the plan is intact, but distribution-by-default is the managed hosted product. Self-host is for power users / privacy-sensitive orgs.
- We are not Roughdraft. We borrow the format (`@roughdraft/rfm`) but not the local-first architecture.

## Considered and rejected

- **Local-first with optional sync** (Roughdraft shape): killed the collab wedge, deferred the hardest engineering until later.
- **Desktop app per user with peer-to-peer sync**: solves self-host friction but ruins the "PM #2 just clicks a link" invite flow that is the marketing department.
- **Hybrid (offline edits, online merge)**: would require a CRDT/sync layer for collab to remain correct, which is the whole cost we are dodging.
