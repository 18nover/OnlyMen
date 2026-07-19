# NSID Conventions

An NSID (Namespaced Identifier) is a reverse-DNS string that names a lexicon
(`app.bsky.feed.post`, `com.atproto.repo.createRecord`,
`tools.ozone.moderation.defs`). It is permanent once a lexicon ships — third
parties may already depend on it the moment it's public.

## Namespace ownership in this stack

- **`com.atproto.*`** — core protocol methods and types owned by the AT
  Protocol spec itself (repo CRUD, sync, identity, moderation primitives).
  Changes here affect every AT Protocol implementation, not just Bluesky's.
- **`app.bsky.*`** — the Bluesky application layer (feed, actor/profile,
  graph/follows, notification, embeds, and the newer `ageassurance` and
  `contact` families). OnlyMen inherits this namespace wholesale from the
  fork; we build product behavior on top of these upstream schemas rather
  than adding our own NSIDs to the namespace.
- **`tools.ozone.*`** — moderation tooling namespace (Vision's domain model,
  reviewed by you for schema mechanics).
- **Custom OnlyMen namespace** (if we ever ship an NSID that isn't upstream
  Bluesky) — reserve a distinct reverse-DNS root before defining anything;
  never squat inside `app.bsky.*` for non-upstream features, since that
  namespace's evolution isn't ours to control and a future upstream addition
  could collide with ours.

## Structure

`<reverse-domain>.<namespace>.<name>` — e.g. `app.bsky.feed.post`:
`app.bsky` is the domain/namespace root, `feed` groups related defs, `post`
is the specific def name. Sub-defs within a file use a `#fragment`:
`app.bsky.feed.defs#postView`.

## Naming rules

- Lowercase, dot-separated, no underscores.
- Group by domain concept (`feed`, `graph`, `actor`, `notification`), not by
  implementation detail — name for what it models, not which service reads
  it.
- Verbs for methods (`createRecord`, `getProfile`), nouns for records
  (`post`, `like`, `profile`).
- Never reuse an NSID for a semantically different shape, even after
  deprecating the original — the ID is permanent and third parties may have
  cached assumptions about it.

## Before assigning a new NSID

1. Check it doesn't collide with an existing upstream `app.bsky.*` or
   `com.atproto.*` NSID (these evolve independently of this fork — pull
   latest upstream lexicons before assuming a name is free).
2. Confirm the namespace root matches who conceptually owns the feature
   (product feature → `app.bsky.*` extension; moderation → `tools.ozone.*`;
   truly custom → a reserved distinct root).
3. Get sign-off from whichever agent owns the consuming domain (Vision for
   moderation, Forge for backend-only internal methods) before publishing —
   once shipped, the name is permanent.
