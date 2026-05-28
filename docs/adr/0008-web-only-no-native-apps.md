# Web-only. No native desktop or mobile apps.

Fiche ships as a web application — and only a web application. We do not ship a native desktop app (Tauri, Electron, zero-native) or native mobile app (React Native, Capacitor, Flutter). Installability and the "feels like an app" experience are delivered via PWA primitives — a web manifest, a service worker, web push notifications, and "Add to Home Screen" / "Install Fiche" prompts in the browser.

## Why

The collaboration-first wedge (ADR-0001) does not benefit from a native shell. A desktop app for Fiche would be a wrapped browser tab — it has to talk to the central server anyway, gets no offline mode (deliberately, per ADR-0001), and adds no functional capability the browser cannot deliver. The "stickiness" argument for desktop apps mostly traces to value props that don't apply to us:

- **Notifications outside the browser** — solved by web push (Service Worker + Push API) on every modern OS and browser.
- **System tray / background presence** — irrelevant; the Doc is the artifact, not a live process.
- **File system access** — irrelevant for a hosted collaborative doc tool.
- **Performance** — adequate in the browser for prose editing; we are not Figma's canvas.
- **Offline mode** — explicitly out of scope (ADR-0001).

The engineering cost of going native is multi-month for a solo / team-of-one execution: code signing (Apple Developer Program, Windows code signing certs), notarization, auto-update mechanisms, app store distribution and review cycles, per-OS bug surfaces, store-listing copy, and the ongoing tax of keeping native parity with the web. None of that work pays back in user value for our product shape.

Mobile is wrong-audience. PMs do not write PRDs on phones. They occasionally read or comment, which a responsive web app handles. A native mobile editor experience is a v3+ concern, possibly never.

## What we ship instead

- **A responsive web app** that works on desktop and mobile browsers.
- **A PWA manifest + service worker** so users on Chrome/Edge/Safari can "Install Fiche" and get a standalone window, dock/taskbar icon, and OS-level launch behaviour without us shipping any native code.
- **Web push notifications** for collaboration events ("Maya commented on your Doc"). Approximately one day of work with the Push API. Covers the only real desktop-app value prop with zero app stores.

## Customer-pull rule

The same rule we apply to integrations (ADR-0006) applies here: native apps enter the roadmap only when a paying or near-paying user's continued use specifically depends on us owning a native shell, and only when no PWA mechanism could deliver the same value. A future contributor or eager early adopter saying "you should ship a Mac app" is not a market verdict; it's a request to validate against a real need before saying yes.

## Considered and rejected

- **Tauri** — most mature cross-platform shell, Rust-based, small bundles. The right choice _if_ we had to ship native — but we don't, and going native at MVP is a multi-month detour from the actual product.
- **Electron** — boring default, heavy bundles, mature ecosystem. Same verdict as Tauri.
- **zero-native (Vercel Labs)** — experimental, recently released, "one codebase, native + web" pitch. Promising but bleeding-edge; betting our editor on a v0.x experimental library is the wrong risk profile for the central engineering asset.
- **React Native / Expo for mobile** — mature, but mobile-native is wrong-audience and ships nothing the responsive web doesn't.
- **Deep links / Universal Links to optionally route into a desktop app** — solves a problem (clicking a link from Claude Code) that the web tab solves natively, with zero install required.
