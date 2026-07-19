# Service Topology — what actually gets deployed

The OnlyMen production surface is four backend services from `atproto/`
plus the web front-end from `app/`. Everything below is verified against
the fork.

## Backend services (`atproto/services/{pds,bsky,ozone,bsync}`)

Each service dir is a thin runtime wrapper (`index.ts`, `run-script.ts`,
`tracer.ts`, own `Dockerfile`) around the corresponding package:

- **pds** → `packages/pds`. Accounts, repos (SQLite per actor), blobs,
  auth, firehose sequencer. Backup = actor-store dirs + accounts DB.
- **bsky** (AppView) → `packages/bsky`. Firehose indexer + read API.
  Needs **Postgres** and **Redis**; the heavy scaling component.
- **ozone** → `packages/ozone`. Moderation event log + review API
  (`OzoneService`/`OzoneDaemon` — API and daemon jobs run separately).
  Postgres-backed.
- **bsync** → `packages/bsync`. Private-state sync (mutes, stash data:
  age-assurance events, contact data) between services.

Wiring: client → PDS (auth, writes, proxied reads) → AppView (reads) with
firehose PDS→AppView/Ozone and bsync carrying private state. Health metric
that matters most: firehose lag (see Forge's `firehose.md`).

## Local/dev network — `atproto/packages/dev-env`

`TestNetwork` boots the whole stack in-process (`pds.ts`, `bsky.ts`,
`bsync.ts`, `ozone.ts`, `plc.ts`, `feed-gen.ts`, seeding in `seed/`,
`mock/`). This is what integration tests and local development run
against — no hand-built docker-compose needed for dev. Compass's
`mock-pds.md` covers test usage.

## Web front-end (`app/Dockerfile`)

Two-stage build, verified:
1. `pnpm` image builds the Expo **static web export** into `bskyweb/`
   (bundle + `templates/scripts.html`).
2. `golang:1.26` builds the **bskyweb Go binary** with the static assets
   embedded via `go:embed`. Note `ENV GOARCH="amd64"` is hardcoded —
   cross-arch deploys (ARM hosts) must override it or rebuild.
Result: one self-contained binary serving the web app — the web launch
path needs a container host + TLS, nothing else app-side.

## Android/iOS — EAS (`app/eas.json`)

Real profiles: `base` (Node 24.18.0), `development` (dev client, internal
distribution, iOS simulator), `preview` (internal, production channel),
`production` (auto-increment build numbers). **Expo Go is not a shipping
path** — custom native modules in `app/modules/` require real
`eas build` artifacts. `appVersionSource: "remote"` — version bumps happen
in EAS, not in files.

## What is NOT set up yet (open per docs/HANDOFF.md)

- No CI running `pnpm verify` / `bun run verify` across the three trees.
- No repo-wide secret scanning.
- Hosting decision for the backend stack (needs a real server; a
  Raspberry Pi was assessed and rejected for the Ollama workload — the
  atproto stack itself is lighter but still needs Postgres/Redis).
- Domains/TLS blocked on the domain/trademark decision.
