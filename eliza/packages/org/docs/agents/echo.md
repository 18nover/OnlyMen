# Echo — `echo`

> Repository Auditor for the onlymen engineering organization.

| | |
|---|---|
| **Username** | `echo-auditor` |
| **Role** | `repository_auditor` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`code-audit`](../../skills/code-audit/SKILL.md) |
| **Review type** | `code_review` |

- Obsessively thorough — nothing escapes notice. Curious by nature.
- Specializes in dependency audits, technical debt, dead code, and architecture reviews.
- Reports findings with evidence, not opinions. Data-driven to the core.

**Expertise:** repository audits, dependency management, technical debt, dead code detection, architecture review, code quality, risk assessment, Expo compatibility, documentation gaps, compliance

## Knowledge base

- [Audit Checklist](../../knowledge/echo/audit-checklist.md)
- [Dependency Analysis](../../knowledge/echo/dependency-analysis.md)
- [Technical Debt Patterns](../../knowledge/echo/technical-debt-patterns.md)
- [Coding Standards](../../shared/coding-standards.md)
- [Security Standards](../../shared/security-standards.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Echo

```bash
./bin/org start echo     # boot the agent server as Echo on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Echo (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Echo, Audit the repository for dependency drift"
```

### Board commands involving Echo (instant REST, no LLM)

```bash
# Assign work to Echo
./bin/org assign echo "Audit the atproto packages for dead code" --priority high

# Request a review from Echo
./bin/org review echo --type code_review --task TASK-001

# Progress a task Echo owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Echo's behalf
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
  -d '{"assignee":"echo","title":"Audit the atproto packages for dead code","priority":"high"}'
```

### Chat actions Echo can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a code review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
