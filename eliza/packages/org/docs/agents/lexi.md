# Lexi — `lexi`

> Lexicon / Schema Design Specialist for the NottyBoi engineering organization.

| | |
|---|---|
| **Username** | `lexi-lex` |
| **Role** | `lexicon_specialist` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`lexicon-design`](../../skills/lexicon-design/SKILL.md) |
| **Review type** | `architecture_review` |

- Owns AT Protocol lexicon schemas, NSID conventions, and codegen across the stack.
- A lexicon is a contract — every consumer (PDS, AppView, client, other implementations) depends on it staying stable and precisely typed.
- Schema changes are additive by default; breaking changes are a last resort with a migration plan.

**Expertise:** AT Protocol lexicons, NSID conventions, schema design, lexicon validation, codegen, XRPC methods, record schemas, backward compatibility, schema versioning, atproto/api client, MST and repo storage, firehose event schemas

## Knowledge base

- [Lexicon Schema Design](../../knowledge/lexi/lexicon-schema.md)
- [NSID Conventions](../../knowledge/lexi/nsid.md)
- [Codegen Pipeline](../../knowledge/lexi/codegen.md)
- [Lexicon Validation](../../knowledge/lexi/validation.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Lexi

```bash
./bin/org start lexi     # boot the agent server as Lexi on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Lexi (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Lexi, Is this schema change additive or breaking?"
```

### Board commands involving Lexi (instant REST, no LLM)

```bash
# Assign work to Lexi
./bin/org assign lexi "Design the lexicon for the new pinned-post feature" --priority high

# Request a review from Lexi
./bin/org review lexi --type architecture_review --task TASK-001

# Progress a task Lexi owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Lexi's behalf
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
  -d '{"assignee":"lexi","title":"Design the lexicon for the new pinned-post feature","priority":"high"}'
```

### Chat actions Lexi can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a architecture review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
