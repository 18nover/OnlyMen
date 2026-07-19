# Fork Auditing — tracking drift from upstream Bluesky

OnlyMen is two forks plus an agent org in one repo, single `main` branch,
remote `https://github.com/18nover/onlymen.git`. Echo's job: know exactly
what we changed, keep the delta small and documented, and keep the forks
rebasable.

## The three trees

| Dir | Upstream | Package manager | Verify |
|-----|----------|-----------------|--------|
| `app/` | `bluesky-social/social-app` | pnpm | `pnpm verify` |
| `atproto/` | `bluesky-social/atproto` | pnpm | `pnpm verify` |
| `eliza/` | `elizaOS/eliza` | bun | `bun run verify` |

History note: the repo was restructured from nested repos into one tree
(commit "atproto cloned into onlymen" etc.), so `git log --follow` does
NOT reach upstream history. Drift analysis must diff against a fresh
upstream checkout at the matching version, not rely on our git history.
Corollary (docs/HANDOFF.md lesson): verify actual file content on disk —
the restructure silently reverted some committed fixes once already.

## Known intentional divergence (the audit baseline)

- `eliza/packages/org/` + `eliza/plugins/plugin-org-coordinator/` — wholly
  ours, not upstream elizaOS.
- Branding: partial "OnlyMen" sweep in `eliza/packages/org/`; `app/` still
  carries Bluesky branding deliberately (rebrand deferred, including the
  ALF palette).
- Everything else in `app/` and `atproto/` should currently match upstream
  at fork point — `app.bsky.contact.*` and `app.bsky.ageassurance.*` are
  UPSTREAM features, not our additions. If an audit finds unexplained
  local edits in `app/` or `atproto/`, that's a finding: either document
  the divergence or revert it.

## Audit procedure

1. Pin the upstream ref: match `app/package.json` version /
   `@atproto/api` pin against upstream tags; fetch that tag to a scratch
   dir (network permitting).
2. `diff -rq` tree-vs-tree (excluding `node_modules`, lockfile noise,
   generated dirs) → classify every difference: intentional-documented /
   intentional-undocumented (fix: document) / accidental (fix: revert) /
   upstream-moved-ahead (candidate: rebase).
3. Grep sweeps: leftover legacy branding (`nottyboi`), secrets
   (repo-wide secret scan is an open HANDOFF task), TODO/FIXME inflation.
4. Dependency deltas: upstream bumps we're missing (security patches in
   `@atproto/*`, Expo SDK point releases) — feed into
   `dependency-analysis.md` workflow.
5. Record results as a dated divergence inventory; Atlas's roadmap
   requires documented divergences as a Phase 1 exit criterion.

## Rebase posture

Prefer small, well-labeled commits on top of upstream-shaped trees. Never
edit generated output (`@atproto/api` client code, `docs/agents/` in the
org package) — regenerate instead. Coordinate lexicon-adjacent drift with
Lexi (upstream lexicon changes ripple into generated types and the app).
