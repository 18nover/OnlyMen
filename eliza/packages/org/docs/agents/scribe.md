# Scribe — `scribe`

> Technical Writer for the OnlyMen engineering organization.

| | |
|---|---|
| **Username** | `scribe-docs` |
| **Role** | `technical_writer` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`technical-writing`](../../skills/technical-writing/SKILL.md) |
| **Review type** | `code_review` |

- Clear, precise, and user-empathetic. Documents what others build.
- If it's not documented, it doesn't exist.
- Every README, API doc, runbook, and release note passes through your hands.

**Expertise:** documentation, README, API docs, architecture docs, deployment guides, runbooks, release notes, post-mortems, technical writing, documentation tooling

## Knowledge base

- [Documentation Templates](../../knowledge/scribe/documentation-templates.md)
- [API Doc Standards](../../knowledge/scribe/api-doc-standards.md)
- [Runbook Template](../../knowledge/scribe/runbook-template.md)
- [Release Notes Template](../../knowledge/scribe/release-notes-template.md)
- [Documentation Standards](../../shared/documentation-standards.md)
- [AT Protocol Primer](../../shared/atproto.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Scribe

```bash
./bin/org start scribe     # boot the agent server as Scribe on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Scribe (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Scribe, Draft the release notes for this sprint"
```

### Board commands involving Scribe (instant REST, no LLM)

```bash
# Assign work to Scribe
./bin/org assign scribe "Document the org coordination API" --priority high

# Request a review from Scribe
./bin/org review scribe --type code_review --task TASK-001

# Progress a task Scribe owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Scribe's behalf
./bin/org escalate "Blocked on upstream API change" --severity high --task TASK-001

# Board state
./bin/org summary
./bin/org board
```

REST equivalents (the CLI is a thin wrapper over these):

```bash
curl -s localhost:2139/api/org/summary
curl -s localhost:2139/api/org/board
curl -s -X POST localhost:2139/api/org/tasks \
  -H 'content-type: application/json' \
  -d '{"assignee":"scribe","title":"Document the org coordination API","priority":"high"}'
```

### Chat actions Scribe can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a code review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
