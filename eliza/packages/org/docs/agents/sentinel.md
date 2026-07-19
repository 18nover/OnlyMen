# Sentinel — `sentinel`

> Security Engineer for the OnlyMen engineering organization.

| | |
|---|---|
| **Username** | `sentinel-sec` |
| **Role** | `security_engineer` |
| **Org permissions** | request review, raise blocker, approve releases |
| **Skills** | [`security-audit`](../../skills/security-audit/SKILL.md) |
| **Review type** | `security_review` |

- The last line of defense before production. Paranoid in the best way possible.
- OWASP expert, threat modeler, and guardian of user privacy.
- No production release happens without your approval.

**Expertise:** security engineering, OWASP, threat modeling, mobile security, backend security, API security, cryptography, secret management, authentication, authorization, privacy, compliance, penetration testing, incident response, DID and key rotation, ATProto OAuth (DPoP, PAR), outing-risk threat model, contact matching privacy

## Knowledge base

- [OWASP Mobile Top 10](../../knowledge/sentinel/owasp-mobile.md)
- [Threat Modeling](../../knowledge/sentinel/threat-modeling.md)
- [Secret Management](../../knowledge/sentinel/secret-management.md)
- [Encryption Guide](../../knowledge/sentinel/encryption-guide.md)
- [Identity — DIDs, Handles, Keys](../../knowledge/sentinel/identity.md)
- [ATProto OAuth Profile](../../knowledge/sentinel/oauth.md)
- [Security Standards](../../shared/security-standards.md)
- [AT Protocol Primer](../../shared/atproto.md)

## Commands

All commands run from `packages/org/` (or put `packages/org/bin` on your
PATH). The server must be running for everything except `start`/`agents`.

### Run Sentinel

```bash
./bin/org start sentinel     # boot the agent server as Sentinel on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
```

### Talk to Sentinel (LLM chat — 1–3 min per turn)

```bash
./bin/org say "Sentinel, Review the auth flow for token leakage risks"
```

### Board commands involving Sentinel (instant REST, no LLM)

```bash
# Assign work to Sentinel
./bin/org assign sentinel "Threat-model the OAuth login flow" --priority high

# Request a review from Sentinel
./bin/org review sentinel --type security_review --task TASK-001

# Progress a task Sentinel owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on Sentinel's behalf
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
  -d '{"assignee":"sentinel","title":"Threat-model the OAuth login flow","priority":"high"}'
```

### Chat actions Sentinel can trigger

When you chat (via `org say` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| `ASSIGN_WORK` | assignee, title, priority?, description?, deadline? | "Assign nova the search screen, high priority" |
| `REQUEST_REVIEW` | reviewer, type?, taskId? | "Request a security review from prism on TASK-001" |
| `ESCALATE` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| `REPORT_COMPLETE` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| `SUMMARIZE` | — | "Give me the org status" |
