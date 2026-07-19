# AppView — the `app.bsky` read layer

`atproto/packages/bsky` (deployed via `atproto/services/bsky`). The AppView
consumes the firehose, indexes everything into Postgres, and serves the
aggregated read surface the app depends on: timelines, threads, profiles,
follows, notifications, search. Writes never go here — they go to the PDS;
the AppView sees them via the firehose.

## Source layout (verified on disk)

- `data-plane/` — the storage tier, split into `server/` (Postgres-backed
  gRPC-style dataplane service: `db/`, `indexing/`, `routes/`,
  `subscription.ts` for firehose intake, `bsync-subscription.ts` for
  private-state intake) and `client/` (what the API tier calls). The
  dataplane boundary exists so the public API can scale separately from
  storage.
- `hydration/` — turns bare identifiers into full view objects:
  `hydrator.ts` orchestrates `actor.ts`, `feed.ts`, `graph.ts`,
  `label.ts`. Hydration is batched — collect all DIDs/URIs needed, fetch
  once, assemble.
- `views/` — assembles lexicon-shaped responses (`profileView`,
  `postView`, thread views incl. `threads-v2.ts`) from hydrated state,
  applying viewer-dependent fields (muted, blockedBy, viewer.like).
- `pipeline.ts` — the canonical request shape: **skeleton → hydration →
  rules (moderation/visibility) → presentation**. New read endpoints
  should follow this four-step pipeline.
- `api/app/`, `api/com/` — XRPC handlers; also `api/age-assurance/` and
  `api/kws/` (the third-party age-verification callback surface — KWS is
  the provider referenced in `app.bsky.ageassurance.defs`), plus
  `blob-resolver.ts`/`image/` for serving media through the CDN path.
- `auth-verifier.ts` — verifies service-auth JWTs from PDSes (the AppView
  trusts DID-signed tokens, it has no sessions of its own).
- `bsync.ts`, `stash.ts` — private state (mutes, age-assurance events,
  contact data) that must NOT live in public repos syncs via bsync into
  "stash" storage.
- `courier.ts` — push notification delivery; `rolodex.ts` — the
  contact-matching backend surface (`app.bsky.contact.*`);
  `feature-gates/` — server-side feature flags; `kws.ts` — age-assurance
  provider client.

## Read path (what happens on "load timeline")

1. Client calls `app.bsky.feed.getTimeline` on its PDS; the PDS proxies to
   the AppView with a service-auth token identifying the viewer.
2. Skeleton: dataplane returns the list of post URIs for the view.
3. Hydration: batch-fetch posts, authors, embeds, labels, viewer state.
4. Rules: moderation/label/block/mute logic decides visibility.
5. Presentation: `views/` shapes the lexicon response.

## Private state vs public repos

Public, portable data (posts, likes, follows, profiles) lives in user repos
and reaches the AppView via the firehose. Private, service-side data (mutes,
notification prefs, age-assurance state/events, contact hashes) is **not**
repo data — it flows through bsync (`atproto/packages/bsync`) into stash.
Choosing the wrong side is an architecture error: putting private data in a
repo leaks it to the whole network.

## OnlyMen notes

- Postgres + Redis backing; this is the component with real scaling cost
  (indexing throughput, hydration fan-out). Pulse owns perf budgets here.
- Federation posture (index the whole network vs only community PDSes) is
  an AppView configuration/product decision — flagged as open in Atlas's
  roadmap.
- The moderation "rules" step is where Ozone labels take effect on reads —
  coordinate changes with Vision.
