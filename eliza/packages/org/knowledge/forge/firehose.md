# Firehose & Sync

The firehose is `com.atproto.sync.subscribeRepos` — a websocket subscription
streaming every signed repo commit as it happens. It is the only way data
moves from PDSes to indexers (AppView, Ozone, feed generators, search). If
you understand the firehose, you understand how the network stays consistent
without a central database.

## Event model

- Each PDS runs a **sequencer** (`atproto/packages/pds/src/sequencer/`):
  repo commits append to a monotonically-sequenced event log, streamed to
  subscribers via `outbox.ts`.
- Events carry the commit: repo DID, ops (create/update/delete with
  collection + rkey), the signed commit object, and CAR-encoded blocks for
  the touched MST nodes/records. Identity and account-status events
  (handle changes, deactivations) flow on the same stream.
- **Cursor resumption**: subscribers track the last `seq` they processed
  and reconnect with it. Fall too far behind the sequencer's retention
  window and you must re-sync from scratch (`com.atproto.sync.getRepo` CAR
  export) — design consumers to handle both paths.
- Verification: consumers can verify commit signatures against the repo's
  signing key (DID document) — data is trustworthy without trusting the
  transport. Repo/MST mechanics live in `atproto/packages/repo`; sync
  helpers in `atproto/packages/sync`.

## Topology

```
PDS sequencer ──▶ relay (aggregates many PDSes) ──▶ AppView indexer
        │                                     └──▶ Ozone / feed gens / search
        └── crawlers.ts pings relays when new commits exist
```

At small scale (OnlyMen launch) an AppView can subscribe directly to our
own PDS — a relay matters when indexing many PDSes. The AppView's intake is
`atproto/packages/bsky/src/data-plane/server/subscription.ts` feeding
`indexing/`.

## bsync — the private-state channel

The firehose only carries **public repo data**. Private state (mutes,
notification prefs, age-assurance events, contact-matching data) moves via
`atproto/packages/bsync` (deployed from `atproto/services/bsync`): services
publish operations, subscribers (AppView's `bsync-subscription.ts`) consume
them into stash storage. Rule of thumb: if it must not be world-readable,
it goes through bsync, never into a repo.

## Operational concerns (Circuit/Pulse overlap)

- **Lag** is the health metric: seq distance between sequencer head and
  indexer cursor. Sustained lag = stale timelines.
- **Backpressure**: indexing must be batched and idempotent; replaying the
  same event twice must not corrupt indexes (reconnects redeliver).
- **Ordering**: per-repo ordering is guaranteed by seq; cross-repo ordering
  is not — don't build logic that assumes global ordering.
- Deletes arrive as ops too — indexers must handle tombstoning, and
  takedowns (Ozone) are separate from user deletes.
