---
name: run-eliza
description: Run, start, boot, or smoke-test the elizaOS agent server with a onlymen org character (Atlas, Nova, Forge, …) and drive it over HTTP — send chat messages, check health, exercise org-coordinator actions. No API keys needed; chat is served by the local claude CLI subscription.
---

# Run elizaOS with a onlymen org agent

All paths are relative to the `eliza/` repo root. The driver is
`.claude/skills/run-eliza/driver.sh` — a curl-based smoke harness around the
`@elizaos/agent` HTTP server. The server boots headless; there is no GUI to
screenshot (the dashboard UI is a separate unbuilt Vite app).

## Prerequisites

- Bun 1.3+ and the repo installed: `bun install` at the repo root (once).
- A logged-in `claude` CLI (`~/.claude/.credentials.json` must exist).
  Chat inference shells out to it via `plugin-cli-inference`
  (`ELIZA_CHAT_VIA_CLI=claude-sdk`) — no `ANTHROPIC_API_KEY` needed.
- No database setup: the boot creates a PGlite store inside its state dir.

## Run (agent path) — the driver

```bash
.claude/skills/run-eliza/driver.sh start atlas   # boot Atlas on :2139 (~30s to ready)
.claude/skills/run-eliza/driver.sh health        # {"ready":true,...,"plugins":{"loaded":25,"failed":0}}
.claude/skills/run-eliza/driver.sh agents        # [{"id":"8bd2...","name":"Atlas","status":"running"}]
.claude/skills/run-eliza/driver.sh say "Atlas, run SUMMARIZE and report the org status."
.claude/skills/run-eliza/driver.sh logs 40       # tail the server log
.claude/skills/run-eliza/driver.sh stop
```

`start <name>` takes any character from `packages/org/characters/`
(atlas, nova, forge, sentinel, pixel, compass, circuit, echo, pulse,
lexi, vision, scribe, prism). Overrides: `ELIZA_RUN_PORT` (default 2139),
`ELIZA_RUN_STATE` (default `/tmp/eliza-run-state`), `ELIZA_RUN_BACKEND`
(`claude-sdk` default; `claude` = cold-spawn per call, much slower).

`say` posts to `POST /api/agents/<id>/message` with `{userId, text}` and
returns `{"response": "...", "agentName": "Atlas"}`. A chat turn takes
**1–3 minutes** (warm Claude SDK session; first turn is the slowest). The
org-coordinator actions (ASSIGN_WORK, REQUEST_REVIEW, ESCALATE,
REPORT_COMPLETE, SUMMARIZE) are exercised through normal chat — name the
action in the message and the text-planner routes to it.

## What the driver does under the hood

Boot line (this is the manual path if you need it):

```bash
cd packages/agent
ELIZA_STATE_DIR=/tmp/eliza-run-state \
ELIZA_API_PORT=2139 \
ELIZA_CHAT_VIA_CLI=claude-sdk \
ELIZA_PLANNER_NATIVE_TOOLS=0 \
ELIZA_AGENT_CHARACTER_JSON="$(cat ../org/characters/atlas.json)" \
bun --conditions=eliza-source src/bin.ts serve
```

It also writes `plugins.entries["@onlymen/plugin-org-coordinator"]` into
`$ELIZA_STATE_DIR/eliza.json` before boot so the org plugin loads
(25 plugins loaded vs 24 without it; look for
`Registering plugin: plugin-org-coordinator` in the log).

## Verify the org packages (fast, no server)

```bash
bun run --cwd packages/org verify                        # character schema + biome lint
bun run --cwd plugins/plugin-org-coordinator typecheck   # tsc --noEmit
bun run --cwd plugins/plugin-org-coordinator lint
```

## The org CLI (preferred over raw driver commands)

`packages/org/bin/org` wraps this driver plus the org-coordinator REST
routes. Board writes are instant (no LLM); `say` is the chat path:

```bash
cd packages/org
./bin/org start prism && ./bin/org status
./bin/org assign nova "Implement the settings screen" --priority high
./bin/org review prism --type accessibility_review --task TASK-001
./bin/org task TASK-001 done
./bin/org summary && ./bin/org board
./bin/org stop
```

Per-agent command docs: `packages/org/docs/agents/<name>.md`
(regenerate with `bun run --cwd packages/org docs`).

## Gotchas

- **The planner sometimes routes chat requests to the built-in TASKS
  surface** instead of the org actions (and then fails on the port-2138
  assumption below). Saying "use the REPORT_COMPLETE action from the org
  coordinator plugin" gets it routed correctly; for deterministic writes use
  the `org` CLI's REST commands instead of chat.
- **Plugin routes need `rawPath: true`** to be served at their literal path;
  without it the route is registered under a plugin-name-prefixed path and
  your `/api/...` curl 404s.

- **`bun run start` fails with `Cannot find module '@elizaos/core'`.** The
  workspace `dist/` bundles are not built. Run under
  `bun --conditions=eliza-source` (as the driver does) so package exports
  resolve to `src/` instead of `dist/`.
- **`ELIZA_CHAT_VIA_CLI` alone is not enough.** In default native-tools
  planner mode nothing serves `ACTION_PLANNER` and every action-triggering
  message fails with `No handler found for delegate type: ACTION_PLANNER`
  ("Something glitched…" in chat). Set `ELIZA_PLANNER_NATIVE_TOOLS=0`.
- **The built-in task-coordinator assumes port 2138.** When the model picks
  the built-in TASKS surface instead of an org action it calls
  `127.0.0.1:2138` and gets ConnectionRefused if you boot on another port.
  Harmless for smoke runs; boot on 2138 if you need that surface.
- **`ready:true` ≠ fully booted.** Health returns ready at ~11 plugins;
  deferred boot finishes ~30–60s later (`"settled":true`,
  `plugins.loaded:25`). The driver's `start` returns at first ready — wait
  for `settled` before asserting on plugin counts.
- **Planner JSON can leak into the reply.** Text-planner mode sometimes
  prefixes the response with `{"success": true, "decision": "FINISH", ...}`.
  Cosmetic; the real reply follows.
- **`TEXT_EMBEDDING` warnings on first boot** while
  `gte-small_fp16.gguf` (~65 MB) downloads for local embeddings. Harmless;
  memory search works once it's cached (under `$ELIZA_STATE_DIR/models`).
- **`pg_trgm unavailable` warnings** — PGlite can't `CREATE EXTENSION`;
  full-text search still works.
- **Plugin tsconfig vs TypeScript version.** Root `tsconfig.json` sets
  `ignoreDeprecations: "6.0"`; a plugin pinning `typescript@^5.x` locally
  fails with `TS5103 Invalid value for '--ignoreDeprecations'`. Pin
  `typescript: ^6.0.3` like the sibling plugins.

## Troubleshooting

- `Agent not found` on `/api/agents/<id>/message` → the id must be the
  runtime agent id from `GET /api/agents`, not the character name.
- `userId and text are required` → body must be JSON with both fields.
- Server won't die / port busy → `kill $(cat /tmp/eliza-run-state/driver-server.pid)`;
  stale PGlite locks clear on next boot.
- Chat returns the fallback "no provider" message → the `claude` CLI is not
  logged in on this machine; check `~/.claude/.credentials.json`.
