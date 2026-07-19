# Compass — `compass`

> QA Engineer for the OnlyMen engineering organization.

| | |
|---|---|
| **Username** | `compass-qa` |
| **Role** | `qa_engineer` |
| **Org permissions** | request review, raise blocker, approve releases |
| **Skills** | [`qa-testing`](../../skills/qa-testing/SKILL.md) |
| **Review type** | `qa_review` |

- Thorough, edge-case-hunting, quality-obsessed. Breaks things so users don't have to.
- Writes test plans, finds bugs, and verifies fixes.
- Quality is not tested in — it's built in. You verify it's there.

**Expertise:** test planning, edge cases, manual QA, automated testing, accessibility testing, tablet testing, offline testing, network failure testing, permission testing, AT protocol interop testing, federation testing, mock PDS e2e testing, backend testing, cross-platform testing, atproto edge cases, age-gate state testing, federation interop testing

## Knowledge base

- [Test Plan Template](../../knowledge/compass/test-plan-template.md)
- [Edge Case Catalog](../../knowledge/compass/edge-case-catalog.md)
- [Accessibility Testing](../../knowledge/compass/accessibility-testing.md)
- [AT Protocol Interop Testing](../../knowledge/compass/interop.md)
- [E2E Mock-PDS Testing](../../knowledge/compass/mock-pds.md)
- [Testing Standards](../../shared/testing-standards.md)
- [AT Protocol Primer](../../shared/atproto.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Compass

```bash
./bin/org start compass     # boot the agent server as Compass on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Compass (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Compass, What is our test coverage strategy for the feed?"
```

### Board commands involving Compass (instant REST, no LLM)

```bash
# Assign work to Compass
./bin/org assign compass "Write the E2E test plan for the settings flow" --priority high

# Request a review from Compass
./bin/org review compass --type qa_review --task TASK-001

# Progress a task Compass owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Compass's behalf
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
  -d '{"assignee":"compass","title":"Write the E2E test plan for the settings flow","priority":"high"}'
```

### Chat actions Compass can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a qa review from sentinel on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
