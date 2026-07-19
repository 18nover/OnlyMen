---
name: lexicon-design
description: >
  AT Protocol lexicon schema design skill for Lexi. Covers lexicon file
  anatomy, NSID conventions, additive-evolution rules, XRPC method schemas,
  codegen (lex-cli / lex/* family), and lexicon validation.
version: 1.0.0
authors:
  - Lexi
tags:
  - lexicon
  - nsid
  - schema-design
  - codegen
  - at-protocol
applicable_agents:
  - Lexi
  - Forge
  - Nova
---

# Lexicon Design Skill

Structured methodology for designing, reviewing, and evolving AT Protocol
lexicon schemas (`atproto/lexicons/**/*.json`) — the contract every PDS,
AppView, and client implements against.

## 1. Choosing an NSID

NSIDs are reverse-DNS and **permanent once shipped**. Before naming anything:

1. Pick the namespace: `app.bsky.*` (product features), `com.atproto.*`
   (protocol-level), `tools.ozone.*` (moderation), `chat.bsky.*` (DMs).
2. Check for collisions across `lexicons/` — `grep -r '"id": "app.bsky...'`.
3. Name the concept, not the implementation (`app.bsky.feed.post`, not
   `app.bsky.feed.createPostRecord`).
4. `defs.main` is the primary shape; additional named defs (`#labelValueDefinition`,
   `#subjectStatusView`) live in the same file when they're tightly coupled to
   the main def, or in a `defs.json` when shared across many files in the
   namespace (see `com.atproto.label.defs`, `tools.ozone.moderation.defs`).

## 2. Def type selection

| Need | Def type | Notes |
|---|---|---|
| Something stored in a repo | `record` | needs `key`: `tid`, `literal:self`, or `any` |
| Read-only RPC | `query` | `parameters`, `output` |
| Write RPC | `procedure` | `parameters`, `input`, `output` |
| Streaming | `subscription` | e.g. `com.atproto.sync.subscribeRepos` |
| Reusable shape | `object` | referenced via `ref` |
| One-of-many | `union` | `refs: [...]`, additive — new members can be added later |

## 3. Additive evolution — the non-negotiable rule

- New fields are `optional` by default. A `required` field added to an
  existing def breaks every record written before the change.
- Never repurpose a field's meaning or type. Add a new field, note the old
  one as deprecated in its `description` (there is no schema-level deprecated
  flag).
- Union members (`refs`) can grow. Consumers must degrade gracefully on an
  unrecognized member, never crash — confirm this with whoever implements the
  client side before shipping a new variant.
- `maxLength` (bytes) and `maxGraphemes` (user-facing characters) are
  different constraints — set both deliberately, and make sure any
  client-side counter matches `maxGraphemes`.

## 4. Review checklist before shipping a lexicon change

1. NSID correct, non-colliding, namespace matches the feature owner.
2. Required vs. optional fields chosen deliberately.
3. String/array bounds set on every unbounded-looking field.
4. `query`/`procedure` defs enumerate their `errors`, not left to generic HTTP.
5. Breaking vs. additive explicitly stated in the review — a breaking change
   needs a migration plan before it merges, not after.
6. Codegen re-run (`pnpm codegen` in `atproto/`) and generated output reviewed
   — never hand-edit `packages/api`'s generated files, they're overwritten on
   the next codegen pass.

## 5. Codegen pipeline

- Legacy: `atproto/packages/lex-cli` (`gen-api`, `gen-server`, `gen-md`) — still
  drives `packages/api`'s generated client.
- Modern: `atproto/packages/lex/*` family (`lex`, `lex-builder`, `lex-cbor`,
  `lex-client`, `lex-data`, `lex-document`, `lex-json`, `lex-resolver`,
  `lex-schema`, `lex-server`) — prefer this for new service code per the
  atproto repo's own `lex-sdk` skill guidance.
- After any `lexicons/**/*.json` edit: `pnpm codegen` from the atproto repo
  root, then `pnpm build` — codegen failures on `packages/api`/`packages/ozone`
  usually mean `pnpm build:tooling` needs to run first (builds `lex-cli`/
  `lex-builder` themselves).
- `app/`'s `@atproto/api` dependency is **exact-pinned** (not a range) — a
  schema change doesn't reach the mobile app until that pin is deliberately
  bumped.

## 6. Common mistakes to catch in review

- A new "flag" field added directly to a widely-used record instead of a
  purpose-built sub-object (bloats every record with rarely-used fields).
- Reusing an existing NSID's def name for an unrelated concept in a different
  namespace (breaks the mental model that def names are locally scoped but
  should still be semantically consistent).
- Skipping `labelValueDefinitionStrings`/equivalent localized-copy defs and
  shipping an English-only placeholder — copy is part of the schema contract
  for anything user-facing.
- Treating a `union` addition as backward compatible without confirming the
  actual client behavior on an unrecognized member (untested assumption, not
  a verified one).
