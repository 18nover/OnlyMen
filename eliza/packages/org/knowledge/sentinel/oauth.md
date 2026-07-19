# ATProto OAuth Profile

ATProto specifies a hardened OAuth 2.0 profile for client → PDS auth. Our
fork carries the full implementation under `atproto/packages/oauth/`:
`oauth-provider` (+ `-api`, `-ui`) runs **on the PDS** (the PDS is the
authorization server), `oauth-client` (+ `-browser`, `-node`, `-expo`)
implements the client side, with `jwk*`, `oauth-types`, and `oauth-scopes`
supporting. The session-JWT flow (`createSession`) still exists and is what
`app/` uses today; OAuth is the strategic direction and mandatory for
third-party clients.

## What makes the ATProto profile stricter than vanilla OAuth

- **Client metadata documents, not registration**: a client is identified
  by a URL (`client_id` IS the metadata URL, e.g.
  `https://app.example.com/oauth-client-metadata.json`). The server fetches
  redirect URIs, scopes, and keys from it — no shared client secrets for
  public clients, no manual registration step.
- **PAR (Pushed Authorization Requests) required**: the authorization
  request is POSTed server-to-server first; the browser only carries an
  opaque `request_uri`. Kills parameter-tampering and referer leakage.
- **PKCE required** (S256) for all clients.
- **DPoP required (with server-provided nonces)**: every token request and
  API call carries a proof-of-possession JWT signed by a per-session key,
  binding tokens to the key holder. A stolen bearer token alone is useless;
  replay is bounded by nonce rotation.
- **Issuer discovery flows from identity**: handle → DID → DID document →
  PDS → protected-resource metadata → authorization server. The client
  must pin the resolved issuer to the account's declared PDS
  (mix-up-attack defense).
- **Scopes**: `atproto` (identity) plus granular scopes
  (`packages/oauth/oauth-scopes`); legacy `transition:*` scopes exist for
  session-parity migration. Enforce least privilege — review any client
  requesting broad scopes.

## Review checklist for auth work

1. Tokens: short-lived access, rotating refresh; revocation actually
   revokes (test it); tokens never in URLs or logs.
2. DPoP: nonce handling correct on both sides; clock-skew tolerance
   bounded.
3. Redirect URIs: exact-match against client metadata; custom schemes
   (`onlymen://…`) only for the native app with claimed
   https universal links preferred.
4. Session fixation/CSRF on the authorize UI (`oauth-provider-ui`);
   `state` verified.
5. App passwords remain a separate, scoped legacy surface — they must
   never grant account-management (email/password/identity) rights.
6. Cross-check with Forge's `auth-patterns.md` (the four server-side auth
   surfaces) — service-auth JWTs are NOT OAuth and must not be conflated.

## OnlyMen posture

- First-party app: session JWTs now, planned migration to OAuth —
  migration plan is a Sentinel+Forge deliverable, not a client-only change.
- Any third-party ecosystem access happens through OAuth only; no password
  sharing, no long-lived bearer tokens.
- Privacy note: the authorization server sees login timing/IPs for every
  session — logs here are sensitive-population metadata; apply the same
  retention scrutiny as age-assurance events.
