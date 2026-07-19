# Age Assurance & Contact Lexicons

The two upstream lexicon families OnlyMen depends on most. Both live in
`atproto/lexicons/app/bsky/` and are consumed through the generated client
(`atproto/packages/api/src/client/types/app/bsky/{ageassurance,contact}/`).
They are upstream Bluesky schemas — we build on them, we do not modify them.

## `app.bsky.ageassurance.*` (4 files)

For an 18+ app this is core infrastructure. The flow: client reads config,
computes/fetches state, and gates UI by access level.

### `defs` — the shared shapes
- `#status` (string): `unknown | pending | assured | blocked` — where the
  user is in the assurance process.
- `#access` (string): `unknown | none | safe | full` — what the user may do,
  derived from status + regional rules. This is the value the app gates on.
- `#state` (object): `{ status, access, lastInitiatedAt? }` — the computed
  result returned by `getState` and `begin`.
- `#stateMetadata`: `{ accountCreatedAt? }` — lets the client apply
  account-age rules locally.
- `#config` / `#configRegion`: per-region policy. `configRegion` carries
  `countryCode` (ISO 3166-1), optional `regionCode` (ISO 3166-2),
  `minAccessAge`, optional `additionalVerificationMethods`
  (`device` = Apple Declared Age Range / Google Play Age Signals; the
  third-party KWS flow is always supported), and an **ordered** `rules`
  array — first matching rule wins, last rule must be a default.
- Rule union (7 variants): `configRegionRuleDefault`,
  `…IfDeclaredOverAge`, `…IfDeclaredUnderAge`, `…IfAssuredOverAge`,
  `…IfAssuredUnderAge`, `…IfAccountNewerThan`, `…IfAccountOlderThan` —
  each maps a condition (declared age, assured age, account creation date)
  to an `#access` level.
- `#event`: the stash-stored audit record of an assurance attempt
  (`attemptId` UUID, status, access, country/region, email, init/complete
  IP + UA). High-sensitivity data — retention and access need Sentinel
  review.

### Methods
- `getConfig` (query, no params) → `#config`. Client fetches regional policy.
- `getState` (query, params `countryCode` required + `regionCode`) →
  `{ state, metadata }`.
- `begin` (procedure): input `{ email, language, countryCode, regionCode? }`
  → `#state`. Errors: `InvalidEmail`, `DidTooLong`, `InvalidInitiation`,
  `RegionNotSupported`. Kicks off the email-based third-party verification.

### Client consumption (`app/src/ageAssurance/`)
`index.tsx` + `state.ts` provide the context; `useBeginAgeAssurance.ts`
wraps `begin`; `useComputeAgeAssuranceRegionAccess.ts` applies the region
rules; UI in `app/src/components/ageAssurance/` (badge, dismissible notice,
appeal dialog, error states). OnlyMen policy decisions (which regions,
which `minAccessAge`, how strict the default rule is) are server-side
config, not schema changes.

## `app.bsky.contact.*` (9 files)

Phone-based contact matching ("find your friends"), following the protocol
in https://docs.bsky.app/blog/contact-import-rfc (hash-based private
matching — raw phone numbers are not stored). Flow:

1. `startPhoneVerification` (procedure): `{ phone }` → SMS code. Errors
   include `RateLimitExceeded`, `InvalidPhone`.
2. `verifyPhone` (procedure): `{ phone, code }` → `{ token }` (JWT proving
   phone control, used to authorize the import).
3. `importContacts` (procedure): `{ token, contacts: string[] }` — E.164
   numbers, 1–1000 items, must not include the user's own verified phone →
   `{ matchesAndContactIndexes }`. Matching is **mutual**: a match appears
   only when both sides imported each other.
4. `getMatches` (query, cursor+limit ≤100) → `profileView[]` — excludes
   dismissed matches.
5. `dismissMatch` (procedure): `{ subject: did }` — permanent for that
   contact; re-import must not resurrect it.
6. `getSyncStatus` (query) → optional `#syncStatus`
   (`{ syncedAt, matchesCount }`); absence means never imported or data
   removed.
7. `removeData` (procedure, empty input): removes **all** stored hashes,
   matches, and sync status. This must genuinely remove — it is the privacy
   escape hatch.
8. `sendNotification` (procedure, **role auth** — system-to-system via
   bsync): `{ from: did, to: did }` match notifications.
9. `defs`: `#matchAndContactIndex` (`match: profileView`, `contactIndex`
   0–999 → correlates a match to the client's local contact list),
   `#syncStatus`, `#notification` (bsync stash object).

### Client consumption (`app/src/components/contacts/`)
`FindContactsFlow.tsx` (+ `.web.tsx`), screens (`PhoneInput`,
`VerifyNumber`, `GetContacts`, `ViewMatches`), `phone-number.ts`
(E.164 normalization), `country-allowlist.ts` (rollout gating),
`FindContactsBannerNUX.tsx`.

### OnlyMen sensitivity note
Phone numbers + a social graph of gay men is outing-risk data. Any change
touching this surface requires Sentinel review; `removeData` behavior is a
hard product guarantee. Matching stays hash-based and mutual-only; never
propose designs that store raw numbers or reveal one-sided imports.

## Schema-mechanics takeaways for review work

- Both families show canonical patterns: `defs` files for shared shapes,
  `ref`/`union` composition, `knownValues` for open string enums (clients
  must tolerate unknown values), integer bounds (`minimum`/`maximum`),
  `format: datetime|did`, cursor pagination, and typed `errors` arrays.
- The ordered-rules-with-default pattern (`configRegion.rules`) is the
  lexicon way to express policy tables without breaking changes: adding a
  rule variant to the union is additive.
- `sendNotification`'s role-auth shows service-to-service methods living in
  the same namespace as user-facing ones — auth model is per-method, not
  per-namespace.
