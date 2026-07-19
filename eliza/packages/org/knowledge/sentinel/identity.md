# Identity — DIDs, Handles, Keys

ATProto identity is the security root of the whole system: whoever controls
a DID's keys controls the account everywhere. Source of truth in our fork:
`atproto/packages/did` (DID parsing/documents, methods `plc.ts` and
`web.ts`) and `atproto/packages/identity` (resolution: `did/`, `handle/`,
`id-resolver.ts`).

## DID methods

- **`did:plc`** — the default. A self-auditing, centrally-hosted operation
  log (plc.directory): each operation is signed by a **rotation key** and
  hashes the previous operation, so history is verifiable. The DID document
  it produces lists the atproto **signing key** (signs repo commits), the
  handle alias, and the current PDS endpoint.
- **`did:web`** — DID document served from
  `https://<domain>/.well-known/did.json`. Simpler, but identity is only as
  durable as domain control — domain loss = identity loss. Reasonable for
  service identities; risky for user accounts.

## Key hierarchy (the part reviews get wrong)

- **Rotation keys** (did:plc only): authorize changes to the DID document
  itself — moving PDS, replacing the signing key, changing handle. Highest
  value; compromise = permanent account takeover. plc.directory allows a
  short recovery window where an earlier-listed rotation key can fork out a
  malicious operation.
- **Signing key**: signs repo commits; held by the PDS in custodial setups
  (ours). Compromise = content forgery, but recoverable via rotation keys.
- **Session/OAuth tokens**: lowest tier; scoped and revocable.
- Crypto: `atproto/packages/crypto` — secp256k1 and NIST P-256, low-S
  signatures, did:key encoding.

Review rule: any feature that touches rotation keys, PLC operations, or
key export needs a full threat model — these are unrecoverable-loss
surfaces. Our PDS is custodial (we hold users' signing keys), which makes
PDS host security an account-integrity issue, not just availability.

## Handles

- A handle is a domain (`alice.onlymen.example`) verified **bidirectionally**:
  DNS TXT `_atproto.<handle>` → DID, or HTTPS
  `/.well-known/atproto-did`, AND the DID document must list the handle
  back. One-way verification is spoofable — always check both directions
  (`packages/identity/src/handle`).
- Handles are mutable and reusable; DIDs are the stable identifier. Never
  key authorization, blocks, or moderation state on a handle.
- Spoofing surface: lookalike domains and re-registered handles. UI must
  make the distinction between handle and DID-verified state legible.

## Resolution (`id-resolver.ts`)

Resolution is untrusted-network I/O: DNS answers and DID documents are
attacker-influenceable inputs. Cache with TTLs (PDS keeps a `did-cache`),
handle stale data (deactivated accounts, moved PDSes), and treat
resolution failure as its own state, not as "no such user".

## OnlyMen-specific identity decisions (open)

- Handle domain(s) we offer users — blocked on the domain/trademark
  decision (Atlas roadmap).
- did:plc dependency on plc.directory (Bluesky-operated) is accepted at
  launch; document it as a trust dependency.
- Account migration (PDS→PDS) preserves the DID — supporting it well is a
  product commitment to data portability, and a security review surface
  (migration = key + data handoff).
