# Incident Response

## Severity Levels

| Level | Description | Response Time | Resolution Target | Examples |
|-------|-------------|---------------|-------------------|----------|
| Sev1 | Complete outage or data breach | 15 minutes | 2 hours | Server down, security breach, data loss |
| Sev2 | Major feature broken | 1 hour | 8 hours | Login broken, posting fails, DMs down |
| Sev3 | Minor feature broken | 4 hours | 24 hours | Notification delay, UI glitch, slow loading |
| Sev4 | Cosmetic or low-impact | 24 hours | 1 sprint | Typo, minor visual bug, edge case |

## Response Process

### Detection
- Automated monitoring alerts (Circuit)
- User reports (Scribe triages)
- Agent discovery during routine work

### Triage (Atlas)
1. Determine severity level
2. Assign incident commander (usually Atlas)
3. Assemble response team
4. Create incident channel

### Containment (Circuit + Sentinel)
1. Identify root cause
2. Implement immediate fix or workaround
3. Verify fix in staging
4. Deploy to production
5. Monitor for regression

### Communication
- **Internal:** Atlas updates all agents via `ORG_INCIDENT` event
- **External:** Scribe updates users if user-facing
- **Status page:** Circuit updates status.onlymen.com

### Resolution
1. Fix confirmed working in production
2. Monitoring confirms no regression
3. Atlas declares incident resolved
4. Scribe writes post-mortem

### Post-Mortem (Scribe + Atlas)
Within 48 hours of resolution:
1. Timeline of events
2. Root cause analysis
3. Impact assessment
4. Action items to prevent recurrence
5. Lessons learned

## Incident Roles

| Role | Agent | Responsibilities |
|------|-------|-----------------|
| Incident Commander | Atlas | Decision making, coordination, communication |
| Technical Lead | Circuit | Implementation of fix, infrastructure |
| Security Lead | Sentinel | Security implications, data protection |
| Communications | Scribe | User-facing updates, documentation |
| Subject Expert | Domain agent | Domain-specific investigation |

## Escalation Matrix

```
User Report → Scribe triages → Atlas assigns severity
    ↓
Sev3/Sev4 → Domain agent fixes → Compass verifies → Atlas closes
    ↓
Sev1/Sev2 → Atlas assembles team → Circuit contains → Sentinel reviews → Scribe documents
```
