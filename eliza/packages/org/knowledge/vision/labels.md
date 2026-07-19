# Label Taxonomy

Labels are protocol-level facts (`com.atproto.label.defs`), delivered as
signed statements from a labeler DID and consumed by any AppView/client. They
are not app-specific flags — the taxonomy has to be coherent across every
consumer of the label stream, not just OnlyMen's `app/`.

## Two trust tiers — never conflate them

- **Self-labels** (`selfLabel`): author-declared, attached at post/profile
  write time via `selfLabels`. Trust tier: "the author says so." Used for
  disclosures (e.g. "graphic-media", "sexual").
- **Moderator/labeler labels**: applied by a labeler service (Ozone or a
  third-party labeler), signed by the labeler's DID, delivered over the label
  subscription stream. Trust tier: "an authority says so."

UI must never render these identically — a self-label reading "labeled by the
author" next to a moderator label reading "labeled by [labeler]" is the
correct distinction; collapsing them misleads the user about who made the
claim.

## `labelValueDefinition` fields

- `identifier` — the label value string (e.g. `porn`, `spam`, `!takedown`).
  Values prefixed `!` are protocol-reserved system labels (`!hide`, `!warn`,
  `!takedown`, `!no-unauthenticated`) with fixed behavior — never redefine
  their semantics for a custom taxonomy.
- `severity`: `inform` (neutral disclosure) / `alert` (warning) / `none`.
- `blurs`: `content` (hide everything) / `media` (hide images/video/audio
  only, text still shows) / `none`.
- `defaultSetting`: `ignore` / `warn` / `hide` — the default client behavior
  before any user override.
- `adultOnly`: gates whether the user can reconfigure this label's behavior
  at all (locked to `hide` unless adult content is enabled).

## Adding a new label value

1. Determine trust tier first (self vs. moderator) — this decides whether it
   ever appears in `selfLabels` or only on the labeler stream.
2. Pick `severity`/`blurs`/`defaultSetting` — err toward `inform`/`none` for
   disclosures, `alert`/`content` for harm categories.
3. Add `labelValueDefinitionStrings` (localized name + description) — this is
   user-facing copy, not an engineering detail; route through Scribe.
4. Confirm client rendering with Nova before shipping — a new label with no
   client-side handling silently falls through to unstyled default behavior.

## Anti-patterns

- Inventing a label value ad hoc in application code instead of registering
  it in the taxonomy — this produces labels the client can't render
  correctly and that other labelers can't interpret.
- Using a moderator-label-only value inside `selfLabels`, or vice versa.
- Setting `blurs: content` for a disclosure-only label (over-blurs harmless
  content and trains users to dismiss warnings).
