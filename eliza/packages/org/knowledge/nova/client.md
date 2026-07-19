# Client ↔ Backend — how `app/` talks ATProto

The app never hand-writes HTTP. All backend access goes through
`@atproto/api` (the generated XRPC client, **exact-pinned** at `0.20.28` in
`app/package.json` — never widen to a range; generated types shift shape
between versions) wrapped in TanStack Query hooks under `app/src/state/`.

## Session and agent

- `import {useSession, useAgent} from '#/state/session'` —
  `useSession()` → `hasSession`, `currentAccount`; `useAgent()` → the
  authenticated ATProto `Agent` for API calls.
- Implementation: `app/src/state/session/` (`agent.ts`, `agent-config.ts`,
  account switching, persisted credentials). Session auth today is the
  access/refresh JWT flow against our PDS
  (`com.atproto.server.createSession`); OAuth migration is a backend-led
  change (Forge/Sentinel own the server side).
- Multi-account is first-class: the session layer holds several accounts
  and rebuilds the agent on switch.

## Query layer (`app/src/state/queries/`)

Canonical reference: `feed.ts`. The established pattern:

- Query keys via `createQueryKey(root, args)` from `#/state/queries/util`,
  args as an object; the key root matches the hook name.
- Naming: `use[Name]Query` / `use[Name]Mutation` /
  `use[Name]CacheMutation` (direct cache surgery).
- Stale times from `STALE` in `src/state/queries/index.ts`
  (`STALE.SECONDS.FIFTEEN` … `STALE.INFINITY`).
- **Cursor pagination** (the ATProto norm — every list endpoint returns an
  optional `cursor`): `useInfiniteQuery` with
  `getNextPageParam: page => page.cursor`, flattened with
  `data?.pages.flatMap(page => page.items) ?? []`.
- Persisted queries: `createQueryKey(root, args, {persistedVersion: n})`;
  bump `n` whenever the data shape changes.
- Mutation error handling: don't log network errors (inform the user);
  match **typed XRPC errors** (`err instanceof SomeNsid.SomeError`) for
  known failures; `logger.error('…', {safeMessage: error})` for the rest.

Feature-relevant hooks already present: `find-contacts.ts` (the
`app.bsky.contact.*` flow), `app-passwords.ts`, `handle.ts`,
`actor-search.ts`, plus the age-assurance layer in `app/src/ageAssurance/`
(`useBeginAgeAssurance`, `useComputeAgeAssuranceRegionAccess`).

## Read-after-write, optimistic UI

The PDS's read-after-write layer means the author sees their own writes
immediately even though AppView indexing is async. Client-side, prefer
cache mutations (`use[Name]CacheMutation`) for instant feedback over
refetch loops; expect eventual consistency for *other* users' views.

## What NOT to do

- No `fetch()` to backend endpoints; no REST assumptions. If a method
  doesn't exist in `@atproto/api`, the lexicon doesn't exist yet — that's
  a Lexi conversation, not a client workaround.
- Don't bypass the session agent (auth, proxying, and service-auth
  headers live there).
- Don't store private data in records (public repos are world-readable) —
  private state is server-side (bsync/stash; see Forge's `appview.md`).
- Don't parse `AtUri` strings by hand — use the `AtUri` helper from
  `@atproto/api`.
