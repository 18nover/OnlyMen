# Codegen Pipeline

Generated TypeScript is derived from lexicon JSON — never hand-edit
generated output. Two toolchains exist in `atproto/`; know which one produces
what you're looking at before touching it.

## Legacy: `atproto/packages/lex-cli`

- `gen-api` — generates the client SDK consumed as `@atproto/api`.
- `gen-server` — generates server-side XRPC method scaffolding (used by PDS
  and AppView implementations).
- `gen-md` — generates Markdown documentation from lexicon defs.
- `gen-ts-obj` — generates a TypeScript object embedding the lexicon JSON
  (how servers bundle their schemas for runtime validation).

## Modern: the `lex/*` package family

- **`lex`** — core codegen entry point.
- **`lex-builder`** — programmatic lexicon construction.
- **`lex-schema`** — schema validation/typing layer.
- **`lex-client`** / **`lex-server`** — generated client/server bindings.
- **`lex-cbor`**, **`lex-json`**, **`lex-data`**, **`lex-document`** —
  encoding/serialization layers (repo records are CBOR internally, JSON at
  the XRPC boundary).
- **`lex-resolver`** — resolves cross-lexicon refs at build/runtime.
- **`lex-installer`**, **`lex-password-session`** — supporting tooling, not
  core to schema-to-code generation.

## The generated client: `atproto/packages/api`

This is what `app/` actually imports as `@atproto/api`, pinned at an exact
version (`0.20.28` in `app/package.json` — exact pin, not a range) rather
than a semver range, because generated types can shift shape between
versions in ways that break the client silently if picked up automatically.

## Workflow after any lexicon change

1. Edit the lexicon JSON in `atproto/lexicons/`.
2. Run the appropriate codegen command for the affected package (check that
   package's `CLAUDE.md`/`package.json` scripts — codegen entry points vary
   by which lexicon family you touched).
3. Review the generated diff by hand — confirm only the intended
   types/fields changed; an unexpectedly large diff usually means a shared
   ref/union moved in a way that touches unrelated defs.
4. Bump `app/`'s `@atproto/api` pin deliberately once the new generated
   package version is published — never let this drift to "whatever
   resolves," since an unreviewed generated-type change reaching the client
   build can silently break compilation or runtime shape assumptions.

## Anti-patterns

- Hand-editing anything under a package's generated-output directory — it
  will be silently overwritten on the next codegen run, and the drift from
  the real schema is invisible until something breaks in production.
- Running codegen against a lexicon that hasn't passed schema review —
  generated code from an unreviewed schema propagates the mistake into every
  consumer's type system.
- Loosening `app/`'s exact version pin to a semver range "for convenience" —
  this defeats the whole point of pinning against a codegen'd client.
