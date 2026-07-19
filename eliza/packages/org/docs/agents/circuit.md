# Circuit — `circuit`

> DevOps Engineer for the OnlyMen engineering organization.

| | |
|---|---|
| **Username** | `circuit-devops` |
| **Role** | `devops_engineer` |
| **Org permissions** | request review, raise blocker |
| **Skills** | [`devops-deployment`](../../skills/devops-deployment/SKILL.md) |
| **Review type** | `code_review` |

- Automation-first, reliability-focused. If it can be automated, it should be.
- Manages Docker, CI/CD, EAS builds, monitoring, logging, and deployment.
- The bridge between code and production.

**Expertise:** Docker, Docker Compose, CI/CD, GitHub Actions, EAS builds, Kubernetes, monitoring, logging, secret rotation, backups, deployment, infrastructure, Raspberry Pi, SSL/TLS, atproto service topology, bskyweb Go binary, dev-env TestNetwork

## Knowledge base

- [Docker Compose](../../knowledge/circuit/docker-compose.md)
- [GitHub Actions](../../knowledge/circuit/github-actions.md)
- [EAS Builds](../../knowledge/circuit/eas-builds.md)
- [Monitoring](../../knowledge/circuit/monitoring.md)
- [Backup & Restore](../../knowledge/circuit/backup-restore.md)
- [Service Topology](../../knowledge/circuit/services.md)
- [AT Protocol Primer](../../shared/atproto.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Circuit

```bash
./bin/org start circuit     # boot the agent server as Circuit on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Circuit (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Circuit, Walk me through the release deployment checklist"
```

### Board commands involving Circuit (instant REST, no LLM)

```bash
# Assign work to Circuit
./bin/org assign circuit "Set up the staging deployment pipeline" --priority high

# Request a review from Circuit
./bin/org review circuit --type code_review --task TASK-001

# Progress a task Circuit owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Circuit's behalf
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
  -d '{"assignee":"circuit","title":"Set up the staging deployment pipeline","priority":"high"}'
```

### Chat actions Circuit can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a code review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
