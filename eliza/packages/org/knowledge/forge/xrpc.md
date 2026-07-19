# XRPC — the API layer

XRPC is ATProto's HTTP RPC convention: every API method is a lexicon, served
at `/xrpc/<nsid>`. Queries are GET (parameters in the query string),
procedures are POST (JSON or binary body), subscriptions are websockets.
There is no hand-written REST surface anywhere in the stack — if an endpoint
exists, a lexicon defines it.

## Client side — `atproto/packages/xrpc` + `@atproto/api`

- `packages/xrpc` is the transport: typed request/response, error classes,
  header handling.
- `packages/api` layers the generated client on top: an `Agent` exposes
  every lexicon method as a namespaced call
  (`agent.app.bsky.feed.getTimeline(...)`, with sugar like
  `agent.getTimeline`). Generated types give exact input/output/error
  shapes per NSID.
- Typed errors: each lexicon `errors` entry becomes a class the client can
  `instanceof`-match (e.g. `InvalidEmail` on `ageassurance.begin`). Prefer
  matching typed errors over string-matching messages.

## Server side — `atproto/packages/xrpc-server`

- Methods are registered against the lexicon set: the server validates
  params/input against the schema before your handler runs, and validates
  output shape in dev.
- **Auth verifiers** attach per-method: session auth (PDS), service-auth
  JWT verification (AppView), role/admin auth (e.g.
  `app.bsky.contact.sendNotification`), or open access. Auth is per-method
  by design — never assume a namespace implies an auth level.
- **Rate limits** attach per-method or per-route-group (see
  `packages/pds/src/rate-limits.ts`), keyed by IP or credential.
- Errors: handlers throw typed XRPC errors that map to lexicon-declared
  error names + HTTP status; unknown errors surface as `InternalServerError`
  — never leak internals in error messages.
- Streaming: subscriptions (`com.atproto.sync.subscribeRepos`) use the
  websocket path with sequenced, resumable frames (see `firehose.md`).

## Proxying — how one XRPC surface spans services

The client talks only to its PDS. For methods the PDS doesn't own (most
`app.bsky.*` reads), `pipethrough.ts` forwards the call to the configured
AppView, attaching a **service-auth JWT** (short-lived, signed with the
user's repo key, audience-bound to the AppView) so the AppView knows the
viewer without holding sessions. Design implication: a new read endpoint is
implemented in the AppView, but reachable through the PDS unchanged.

## Adding a new endpoint (the contract-first loop)

1. Lexi designs/reviews the lexicon JSON (input/output/errors/auth needs).
2. Codegen regenerates client + server types (`lex-cli gen-api` /
   `gen-server`).
3. Implement the handler in the owning service (`pds/src/api/...` or
   `bsky/src/api/...`), register auth verifier + rate limit.
4. AppView reads follow the pipeline: skeleton → hydration → rules →
   presentation (`appview.md`).
5. Client consumes it through the regenerated `@atproto/api` (Nova).

## Review checklist (XRPC-specific)

- Auth verifier explicitly chosen and least-privilege; no accidental
  open-access procedures.
- Rate limit set for anything unauthenticated or abuse-prone
  (`startPhoneVerification` is the canonical example).
- Errors enumerated in the lexicon, not invented ad hoc in the handler.
- Pagination via `cursor` + bounded `limit` (max enforced by schema).
- Response assembled in views/presentation code — business logic does not
  live in the route handler.
