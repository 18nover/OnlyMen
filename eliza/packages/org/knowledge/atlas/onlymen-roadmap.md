# OnlyMen Project Roadmap — Atlas Knowledge Base

## Project Overview

OnlyMen is a decentralized social media app for gay men, 18+, built on AT
Protocol — the protocol behind Bluesky. It is a fork-and-rebrand of the
Bluesky stack: `app/` (the social-app client fork), `atproto/` (the protocol
backend fork: PDS, AppView, Ozone moderation, bsync, lexicons), and `eliza/`
(the AI engineering org that helps build it). Launch targets are **web and
Android first, iOS later**.

### Vision
A privacy-respecting, community-owned social space for gay men where users
own their data and identity (account portability, federation), moderation is
transparent and accountable, and an 18+ age gate is enforced credibly enough
to satisfy app-store and regulatory requirements.

### Core Principles
1. Decentralization is the product — never break AT Protocol compatibility
2. User safety first — this community faces real-world hostility; privacy
   failures have outsized consequences
3. Ship web first — the web build (Go binary + static export) has no store
   gatekeeper
4. Track upstream — stay mergeable with bluesky-social/social-app and
   bluesky-social/atproto; document every intentional divergence
5. Technical excellence — verified builds, tested code, documented decisions

---

## Phase 1: Foundation (current)

**Goal:** a working, rebranded, self-hostable stack.

### Workstreams

#### W1.1 Branding sweep
- Replace remaining upstream/legacy branding ("Bluesky" user-facing strings,
  stale "NottyBoi" references) with OnlyMen across `app/`
- App name, package name, bundle identifiers, deep-link schemes
- ALF color palette rebrand is **deliberately deferred** — `app/src/alf/`
  keeps Bluesky's blue palette until brand guidelines exist; do not invent
  colors
- Trademark / name clearance check before any store submission

#### W1.2 Backend bring-up
- Run the atproto stack (PDS, AppView, Ozone, bsync) from
  `atproto/services/` with Postgres + Redis
- Decide hosting: the stack needs a real server; a Raspberry Pi assessment
  exists but was never executed
- Configure identity: handle domain, DID:PLC vs did:web decisions blocked on
  the domain/trademark decision

#### W1.3 Web launch path
- `app/` web build: Go binary + static export, Docker-ready
- Deploy behind TLS; smoke-test signup → post → feed → moderation loop
  against our own PDS/AppView

#### W1.4 Android launch path
- EAS builds (`eas build`) — Expo Go is **not** a shipping mechanism
- Google Play 18+ UGC compliance: age gating, block/report flows, content
  policy, listing metadata

#### W1.5 CI and hygiene
- Repo-wide secret scanning, CI for `pnpm verify` (app, atproto) and
  `bun run verify` (eliza)
- Keep the fork rebasable: document divergences from upstream

### Exit Criteria
- Web app served from our own infra against our own backend
- Android build installable via EAS with the age gate active
- No legacy branding user-visible; secrets scanned; CI green

---

## Phase 2: Community & Safety

**Goal:** the features that make OnlyMen worth choosing, built on protocol
primitives rather than proprietary silos.

- **Age assurance**: operate the upstream `app.bsky.ageassurance.*` flow
  end-to-end (status: unknown/pending/assured/blocked; access:
  unknown/none/safe/full) with a real assurance provider; 18+ enforcement at
  signup and content access
- **Moderation**: our own Ozone deployment with a label taxonomy tuned for
  the community (adult-content labels, harassment, outing/doxxing risk);
  clear appeal paths
- **Community surfaces**: feeds/feed generators for community discovery;
  starter packs; curated onboarding
- **Privacy posture**: review the `app.bsky.contact.*` phone/contact-import
  surface before enabling it — phone numbers are high-sensitivity data for
  this user base; `removeData` must genuinely remove
- **iOS groundwork**: App Store 18+ UGC compliance research (stricter than
  Play)

### Exit Criteria
- Age assurance live and enforced; moderation queue staffed and responsive
- Documented privacy review for every data-collecting surface

---

## Phase 3: Growth & iOS

**Goal:** scale the community and complete platform coverage.

- iOS build and App Store submission (EAS)
- Federation posture: decide whether OnlyMen's AppView indexes the wider
  network or only community PDSes; relay strategy
- Performance and cost: AppView/Postgres scaling, CDN for blobs
- Custom lexicons **only if a feature cannot map onto upstream schemas** —
  requires reserving our own reverse-DNS namespace first (blocked on
  domain/trademark decision); never add non-upstream NSIDs inside
  `app.bsky.*`

---

## Standing Constraints & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Store rejection (18+ UGC) | Blocks Android/iOS launch | Web-first launch; compliance checklists before submission |
| Upstream divergence | Fork becomes unmaintainable | Minimal diffs, documented divergences, regular rebases |
| Privacy breach (outing risk) | Severe harm to users | Sentinel review gates on every data-collecting feature |
| Domain/trademark unsettled | Blocks handles, DIDs, deep links, stores | Resolve early in Phase 1 |
| Infra underpowered | Backend won't run | Real server hosting decision before Phase 1 exit |

## Key Metrics
- **Safety:** report-to-resolution time, appeal resolution rate, age-gate
  bypass reports (target: zero)
- **Health:** DAU/MAU, D1/D7/D30 retention, posts per active user
- **Platform:** uptime, firehose lag, AppView indexing latency, p95 API time
- **Portability:** successful account migrations in/out (federation working
  as designed)
