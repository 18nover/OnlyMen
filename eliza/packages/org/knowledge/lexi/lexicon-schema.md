# Lexicon Schema Design

A lexicon is a JSON schema document that defines one or more `defs` under a
single NSID. It is the only source of truth for a record shape or XRPC
method — the PDS, AppView, and every client (including this app) implement
against it, never the other way around.

## File anatomy (`atproto/lexicons/**/*.json`)

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.post",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["text", "createdAt"],
        "properties": {
          "text": { "type": "string", "maxLength": 3000, "maxGraphemes": 300 },
          "createdAt": { "type": "string", "format": "datetime" },
          "embed": { "type": "union", "refs": ["app.bsky.embed.images", "app.bsky.embed.record"] }
        }
      }
    }
  }
}
```

- `lexicon: 1` — the lexicon spec version, not this schema's version.
- `id` — the NSID; matches the file's reverse-DNS path.
- `defs.main` — the primary definition for this NSID; additional named defs
  (e.g. `#labelValueDefinition`) live alongside it in the same file.
- `type: "record"` defs need `key` (record key strategy: `tid`, `literal:self`,
  `any`) — this determines how the record is addressed in the repo's MST.

## Def types you'll design most often

- **`record`** — something stored in a user's repo (posts, likes, profiles).
- **`query`** / **`procedure`** — XRPC methods (read vs. write), with
  `parameters`, `input`, `output`, and `errors`.
- **`subscription`** — streaming XRPC (the firehose is
  `com.atproto.sync.subscribeRepos`).
- **`object`** — reusable shape referenced from other defs via `ref`/`refs`.
- **`union`** — one-of-many shape, used heavily for embeds and moderation
  event types.

## Full field-type inventory (per the atproto lexicon spec)

Primitives: `null`, `boolean`, `integer` (with `minimum`/`maximum`/`enum`/
`const`/`default`), `string` (with `maxLength`/`minLength` in bytes,
`maxGraphemes`/`minGraphemes`, `enum`, `const`, `default`, `knownValues`,
`format`). String formats: `at-identifier`, `at-uri`, `cid`, `datetime`,
`did`, `handle`, `nsid`, `tid`, `record-key`, `uri`, `language`.

Composites and special types:
- **`object`** — `properties`, `required[]`, `nullable[]` (nullable is
  distinct from optional: present-but-null vs absent).
- **`array`** — `items` + `minLength`/`maxLength` (item count).
- **`ref`** — points to another def: same-file `#name`, or global
  `nsid#name`. **`union`** — `refs[]`, open by default (new variants may
  appear; consumers must tolerate unknown ones); `closed: true` exists but
  is rare.
- **`blob`** — media reference with `accept` (MIME patterns) and `maxSize`;
  actual bytes are uploaded via `com.atproto.repo.uploadBlob` and stored on
  the PDS.
- **`bytes`** (`maxLength`) and **`cid-link`** — raw binary / content links
  in the underlying CBOR data model.
- **`token`** — a named symbolic value (no shape) used like a well-known
  constant in `knownValues`/unions.
- **`params`** — only for `parameters` on query/procedure/subscription:
  flat HTTP query params (primitives and arrays of primitives only).
- **`unknown`** — an object of undeclared shape; use sparingly (e.g. record
  passthrough), it disables validation at that node.

`knownValues` vs `enum`: `enum` is closed (validation fails on anything
else); `knownValues` is documentation for an open string — clients must
handle unlisted values gracefully. Upstream uses `knownValues` almost
everywhere (see `app.bsky.ageassurance.defs#status`) so behavior can evolve
without schema breaks.

## String constraints matter

`maxLength` is a byte limit; `maxGraphemes` is a user-facing character limit
distinct from it (emoji and combining characters are multiple bytes but one
grapheme). Get both right — client-side character counters must match the
schema's `maxGraphemes`, not `maxLength`.

## Designing for additive evolution

- New fields are `optional` by default — never required, or every existing
  record retroactively fails validation.
- Never repurpose an existing field's meaning or type — add a new field and
  deprecate the old one in documentation (the schema itself has no
  "deprecated" flag; note it in the def's description and in your own docs).
- Unions (`refs: [...]`) can gain new members additively; consumers that
  don't recognize a new union member should degrade gracefully, not crash —
  confirm this with Nova/Forge before adding a union variant.

## Review checklist before shipping a new lexicon

1. NSID correct and non-colliding (see `nsid.md`).
2. Required vs. optional fields deliberately chosen, not copy-pasted.
3. String/array bounds set (`maxLength`, `maxGraphemes`, `maxItems`) —
   unbounded fields are a storage and abuse-surface risk.
4. Error variants enumerated for `query`/`procedure` defs, not left to
   generic HTTP errors.
5. Codegen run and generated output reviewed (see `codegen.md`).
