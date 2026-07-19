# PDS — Personal Data Server

`atproto/packages/pds` (deployed via `atproto/services/pds`). The PDS is the
user's home server: it holds accounts, their signed repos, and their blobs,
and it is the only backend component the client authenticates against
directly. Everything else (AppView reads) is proxied through it.

## Source layout (verified on disk)

- `account-manager/` — account records, credentials, and the OAuth provider
  store (`oauth-store.ts`). Backed by SQLite (`db/`).
- `actor-store/` — **per-user storage**: each account gets its own store
  with `repo/` (the signed MST repo), `record/`, `blob/`, and
  `preference/` sub-stores, accessed through reader/writer/transactor
  wrappers (`actor-store-reader.ts`, `actor-store-writer.ts`, …). This is
  the concrete implementation of "your data lives in your repo".
- `api/com/`, `api/app/` — XRPC method implementations for
  `com.atproto.*` (repo CRUD, server/session, sync, identity) and the
  `app.bsky.*` methods the PDS answers locally; `api/proxy.ts` +
  `pipethrough.ts` forward everything else upstream.
- `auth-verifier.ts`, `auth-scope.ts`, `auth-routes.ts` — access/refresh
  JWT session auth, app-password scopes, service-auth token verification,
  and the OAuth routes.
- `sequencer/` — the **event log that feeds the firehose**: repo commits
  are sequenced (`sequencer.ts`, `events.ts`) and streamed to subscribers
  via `outbox.ts` (`com.atproto.sync.subscribeRepos`).
- `read-after-write/` — after a local write, reads through the PDS munge
  AppView responses with the user's own not-yet-indexed changes so the
  author immediately sees their own post.
- `disk-blobstore.ts` / `image/` — blob storage and image processing;
  `crawlers.ts` — notifies relays/crawlers that new commits exist.
- `handle/`, `well-known.ts`, `did-cache/` — handle resolution and
  identity plumbing.
- `mailer/` — account emails (confirmation, password reset).
- `bsky-app-view.ts` / `app-view.ts` — configuration of which AppView the
  PDS proxies reads to.

## The write path (what happens on "post")

1. Client calls `com.atproto.repo.createRecord` (or `applyWrites`) on the
   PDS with its session.
2. The record is validated against its lexicon, written into the actor's
   repo (new signed MST commit), and blobs are associated.
3. The commit is appended to the sequencer; the firehose streams it out;
   crawlers are pinged.
4. `read-after-write` makes the change visible to the author immediately,
   while the AppView catches up asynchronously.

## Auth surfaces (coordinate with Sentinel)

- Session JWTs: short-lived access + rotating refresh tokens
  (`com.atproto.server.createSession` / `refreshSession`).
- App passwords: scoped credentials for third-party clients.
- **Service auth**: short-lived signed JWTs (user's repo signing key) for
  server-to-server calls on the user's behalf (e.g. PDS → AppView).
- OAuth: the PDS is an OAuth authorization server (`oauth-store.ts`,
  `atproto/packages/oauth*`); DPoP-bound tokens, PAR. See Sentinel's
  `oauth.md` for the protocol profile.

## OnlyMen notes

- We run our own PDS; account signup policy, age-assurance enforcement
  hooks, and invite policy are PDS-side decisions.
- SQLite-per-actor means backup strategy = actor-store directory + accounts
  DB, not one big Postgres (that's the AppView).
- Self-hosting reference: upstream wraps this package in
  https://github.com/bluesky-social/pds (Dockerfile, service wrapper);
  our deployment lives in `atproto/services/pds`.
