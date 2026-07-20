# Changelog

Notable changes to the OnlyMen repo (`app/`, `atproto/`, `eliza/`, docs). No
version tags have been cut yet (`v0.1.0-web-launch` is planned, not shipped),
so entries are grouped by date instead of version number. Newest first.

## Unreleased

### Docs — 2026-07-19 session (FIREWALL, CHANGELOG, AGENTS, HANDOFF, Makefile)
- **FIREWALL.md**: Created — SSH rate-limiting (`ufw limit`), Docker/UFW
  bypass warning, IPv6 rules, spec-based deletes, No RDP in core services.
- **CHANGELOG.md**: Created this file.
- **AGENTS.md**: Created with full agent roster using human names (Andrew,
  Devon, Quinn, Audrey, Morgan, Lexi, Nadia, Desiree, Ethan, Parker, Penelope,
  Seth, Karen).
- **HANDOFF.md**: Updated — added domain branding (onlymen.gay, 18nover.gay),
  Makedile reference, agent name note, session recap.
- **Makefile**: Created at project root with `make handoff`, `make changelog`,
  `make log`, `make update`, `make help`.

### Discovered
- The `claude/bluesky-agents-planning-mpzmvd` branch was merged to main
  (PR #1) — contains full NottyBoi branding sweep, agent retraining to
  ATProto/Bluesky stack, and `@nottyboi` plugin-name fix. Done. The branch
  should be deleted from remote to comply with the single-`main` convention.
- Agent character files still use code-style names (Atlas, Circuit, Forge,
  etc.) throughout `characters/*.json`, `ORG_AGENTS`, knowledge docs, and
  skill files — a rename to human names is outstanding.

## 2026-07-19 — AI org realignment + retraining

### First pass: realign agents off camera/object-detection vision

Core task: align the 13-agent "OnlyMen AI Engineering Organization"
(`eliza/packages/org/`) to actually help build the real app + AT Protocol
backend, replacing an old, unrelated camera/object-detection/livestreaming
vision.

- Deleted two off-stack skill files (`skills/computer-vision`,
  `skills/stream-integration`), replaced with `skills/moderation-tooling`
  (Vision) and `skills/lexicon-design` (Lexi).
- Fixed `ORG_AGENTS` list in coordinator plugin (was `'stream'`, now `'lexi'`).
- Regenerated agent docs via `bun run docs`.
- Rewrote root README.md.
- Fixed broken knowledge reference in atlas.json.
- Added root `.editorconfig`.
- Fixed `.env.example` (STREAM→LEXI, VISION llava→llama3.1).
- Documented project conventions in HANDOFF.md.

### Second pass: retrain on real ATProto/Bluesky stack

Merged via PR #1 (`claude/bluesky-agents-planning-mpzmvd`):

| Tier | Agents |
|---|---|
| A (Tier 1) | Lexi, Forge, Nova, Pixel |
| B (Tier 2) | Sentinel, Vision, Circuit, Compass |
| C (Tier 3) | Atlas, Echo, Pulse, Prism, Scribe |

All 13 agents updated with:
- Shared `shared/atproto.md` primer
- Standard `## Project` section anchoring them to OnlyMen-on-ATProto
- Knowledge files grounded in real codebase paths
- New docs: `services.md`, `forks.md`, `pds.md`, `appview.md`, `xrpc.md`,
  `firehose.md`, `contact-ageassurance.md`, `client.md`, `icons.md`,
  `identity.md`, `oauth.md`, `reporting.md`
- Existing 66 docs deepened with real data (breakpoints, API patterns, etc.)
- Rewritten: `onlymen-roadmap.md`, `alf-design-system.md`
- Fixed `@nottyboi` → `@onlymen` in coordinator plugin name (was breaking
  `bun install`)
- Swept ~45 NottyBoi brand references to OnlyMen

### Running agents: backend changed from Ollama to claude CLI

Default backend changed from local Ollama (llama3.1:70b / codellama:34b —
unrealistic on existing hardware) to the local `claude` CLI subscription via
`plugin-cli-inference`. `.env.example` updated with `ELIZA_RUN_BACKEND=claude-sdk`
and `ELIZA_PLANNER_NATIVE_TOOLS=0`.

### Incidents

1. **Repo restructure silently reverted fixes** — when nested git repos were
   collapsed into one, an older snapshot was used, reverting fixes that showed
   as committed. Recovered via:
   - `77beaca29` — Restore ORG_AGENTS lexi fix and missing scribe doc
   - `40d57b423` — Re-apply removal of camera/object-detection leftovers
   - `42e990f74` — Re-delete reverted skills, restore replacements
2. **Plugin name mismatch** — `@nottyboi/plugin-org-coordinator` in `package.json`
   broke `bun install` for the workspace; renamed to `@onlymen/`.

## 2026-07-19 (earlier) / 2026-07-18 — Repo setup

- Collapsed `eliza/`, `atproto/`, `app/` from separate nested git repos into
  plain tracked subdirectories of one repo.
- Added `.devcontainer/`, `.vscode/` config; removed an unused Eliza chroot.
- Initial commits: `bsky cloned as app`, `atproto cloned into onlymen`,
  `eliza cloned into onlymen`, `onlymen initial commit`.
