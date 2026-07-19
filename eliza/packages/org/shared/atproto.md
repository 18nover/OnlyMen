# AT Protocol Primer

Every OnlyMen agent works on a fork of the Bluesky stack. This is the shared
mental model: what AT Protocol is, how the pieces talk, and exactly where
each piece lives in this repo.

## The one-paragraph version

AT Protocol (ATProto) is a federated social networking protocol. Users are
identified by a **DID** (permanent) and a **handle** (human-readable, DNS- or
HTTP-verified). Each user's data lives in a signed, portable **repository**
hosted on a **PDS** (Personal Data Server). Record shapes and API methods are
defined by **lexicons** (JSON schemas with permanent NSID names). Clients and
servers talk **XRPC** (HTTP methods generated from lexicons). Indexers
subscribe to the **firehose** (a stream of signed repo commits) to build
**AppViews** — the aggregated, queryable view (feeds, profiles, threads) the
app actually reads. Moderation runs through **labels** and the **Ozone**
service. Anyone can run any piece; users can move between PDSes without
losing identity or data.

## Identity

- **DID** — permanent identifier, e.g. `did:plc:abc123…`. `did:plc` is the
  default (a self-auditing registry); `did:web` maps a DID to a domain. The
  DID document lists the user's signing keys, handle, and current PDS.
- **Handle** — `alice.example.com`, verified via DNS TXT record or
  `/.well-known/atproto-did`. Handles can change; the DID never does.
- Repo code: `atproto/packages/{did,identity}` (resolution),
  `atproto/packages/crypto` (Ed25519/secp256k1 signing).

## Repositories and records

- A repo is a signed Merkle Search Tree (**MST**) of records, exported as
  **CAR** files. Every commit is signed by the user's key — data is
  self-authenticating and portable.
- A record is addressed by `at://<did>/<collection>/<rkey>`, where
  `collection` is a lexicon NSID (e.g. `app.bsky.feed.post`) and `rkey` is
  usually a **TID** (timestamp identifier).
- Repo code: `atproto/packages/repo`; sync/CAR handling in
  `atproto/packages/sync`.

## Lexicons

- JSON schema documents under `atproto/lexicons/`, named by **NSID**
  (reverse-DNS, permanent once shipped). Namespaces in this repo:
  - `com.atproto.*` — protocol core: repo CRUD, sync, identity, server,
    moderation reporting, labels
  - `app.bsky.*` — the application layer: actor, feed, graph, notification,
    embed, video, bookmark, draft, labeler, richtext, unspecced — plus the
    newer `ageassurance` and `contact` families (see below)
  - `chat.bsky.*` — DMs; `tools.ozone.*` — moderation tooling;
    `com.atproto.temp.*`/`internal`/`site` — transitional surfaces
- Three method types: **query** (GET), **procedure** (POST), and
  **subscription** (websocket event stream). Records are a fourth lexicon
  type stored in repos.
- Validation: `atproto/packages/lexicon` (`Lexicons` class). Codegen:
  `atproto/packages/lex-cli` and the `lex*` family generate the typed client
  (`atproto/packages/api`, published as `@atproto/api`) and server stubs.
- **OnlyMen ships no custom lexicons.** We inherit upstream schemas and
  build product behavior on top. If we ever need our own, we reserve our own
  reverse-DNS root (open decision) — never new NSIDs inside `app.bsky.*`.

## XRPC

HTTP endpoints at `/xrpc/<nsid>`, generated from lexicons. Client:
`atproto/packages/xrpc` (wrapped by `@atproto/api`'s `Agent`); server:
`atproto/packages/xrpc-server` (method registration, auth verifiers, rate
limits). The app never hand-writes REST calls — it calls generated methods
like `agent.getTimeline(...)`.

## Federation topology

```
user ── app/ client ──XRPC──▶ PDS (packages/pds)      user data, auth, blobs
                                │  signed commits
                                ▼
                             firehose  com.atproto.sync.subscribeRepos
                                │
                                ▼
                             AppView (packages/bsky)   indexes, hydrates,
                                ▲       serves feeds/profiles/threads
                                │ labels
                             Ozone (packages/ozone)    moderation: reports,
                             bsync (packages/bsync)    events, takedowns
```

- **PDS** — hosts repos, handles auth (sessions, OAuth, app passwords),
  stores blobs, proxies AppView reads. Deployed from `atproto/services/pds`.
- **AppView** — consumes the firehose, indexes into Postgres, serves the
  `app.bsky.*` read surface. Deployed from `atproto/services/bsky`.
- **Ozone** — moderation event log, review queues, labeling. Deployed from
  `atproto/services/ozone`. **bsync** syncs private state.
- Local everything-at-once network for tests: `atproto/packages/dev-env`.

## Moderation model

Moderation is data: **labels** (`com.atproto.label.defs`) are signed
verdicts attached to content/accounts, emitted by labeler services and
consumed by clients according to user preferences. Reports flow in via
`com.atproto.moderation.createReport`; moderators act through Ozone
(`tools.ozone.*` — events, takedowns, appeals). Severity/blur behavior is a
protocol contract (`labelValueDefinition`), not client guesswork.

## The OnlyMen instantiation

- **Product**: decentralized social app for gay men, 18+. Web + Android
  first (web = Go binary + static export; Android via EAS builds), iOS
  later. Privacy and user safety are load-bearing: this community faces
  real-world hostility, so data-collection surfaces get extra scrutiny.
- **`app/`** — fork of bluesky-social/social-app. React Native + Expo
  (web/iOS/Android), React Navigation (`src/Navigation.tsx`, `src/routes.ts`),
  ALF design system (`src/alf/`, imported as `#/alf` — palette rebrand
  deliberately deferred, still Bluesky blue), state via TanStack Query
  (`src/state/`), talks to the backend exclusively through `@atproto/api`.
- **`atproto/`** — fork of bluesky-social/atproto (pnpm monorepo). All
  services above plus supporting packages (`oauth*`, `syntax`, `common*`,
  `aws`, `tap`, `ws-client`).
- **Age assurance** — upstream `app.bsky.ageassurance.*` lexicons
  (`defs`, `begin`, `getConfig`, `getState`; status:
  `unknown|pending|assured|blocked`, access: `unknown|none|safe|full`) with
  a full client flow in `app/src/ageAssurance/` and
  `app/src/components/ageAssurance/`. For an 18+ app this is core
  infrastructure, not an edge case.
- **Contact matching** — upstream `app.bsky.contact.*` lexicons
  (`importContacts`, `getMatches`, `dismissMatch`, `startPhoneVerification`,
  `verifyPhone`, `sendNotification`, `getSyncStatus`, `removeData`) with UI
  in `app/src/components/contacts/`. Phone numbers are high-sensitivity
  data for our users — any work here goes through security review.
- **eliza/ agents** (you) are development helpers grounded in this repo.
  You do not post to or read from the live Bluesky network.

## Where to verify claims

Never assert file contents from memory — read them. Lexicon truth:
`atproto/lexicons/**/*.json`. Generated client truth:
`atproto/packages/api/src/client/`. Service wiring truth:
`atproto/services/*` and `atproto/packages/dev-env`. Client truth:
`app/src/`.
