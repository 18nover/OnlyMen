# Threat Modeling

## Overview

Structured approach to identifying, categorizing, and mitigating security threats using STRIDE methodology, DREAD scoring, and attack trees.

## The OnlyMen threat model (apply before the generic method)

Our users are gay men, some in hostile jurisdictions or unsupportive
environments. **Outing is the primary harm model** — a data exposure that
would be low-severity for a generic social app can be life-altering here.
Rank findings accordingly.

High-sensitivity surfaces (all verified in the fork):
- **Membership itself**: an account on OnlyMen implies orientation.
  Anything that lets a third party test "does phone/email/handle X have an
  account" (enumeration, contact-match side channels, password-reset
  oracles) is a top-tier finding.
- **Contact matching** (`app.bsky.contact.*`): phone numbers + the social
  graph. Hash-based mutual matching only; `removeData` must genuinely
  purge; `getMatches` must never reveal one-sided imports. SMS
  verification creates carrier-visible metadata.
- **Age assurance** (`app.bsky.ageassurance.*`): the stash `#event`
  records carry email, IP, UA, country — identity-linkable verification
  trails. Retention and provider (KWS) data-sharing need explicit review.
- **Public-by-design repos**: posts, likes, follows, blocks are PUBLIC and
  federated — deletion is a request to the network, not a guarantee. UI
  must never imply repo data is private; private state belongs server-side
  (bsync/stash — see Forge's `appview.md`).
- **Federation**: other AppViews/relays can index our users' public data;
  moderation (labels/takedowns) applies per-service, not globally.
- **Custodial keys**: our PDS holds users' signing keys — host compromise
  = account integrity compromise (see `identity.md`).

Standing rule: any feature that collects, links, or exposes user data gets
a Sentinel review gate before implementation (Atlas roadmap risk table).

## STRIDE Methodology

### Categories

| Category                | Description                              | Example                                   |
|-------------------------|------------------------------------------|-------------------------------------------|
| Spoofing                | Impersonating a user or system           | Fake login page, token forgery            |
| Tampering               | Modifying data or code                   | Request body manipulation, SQL injection  |
| Repudiation             | Denying actions without proof            | No audit logs for privileged operations  |
| Information Disclosure  | Exposing sensitive data                  | Leaking tokens in error messages          |
| Denial of Service       | Making system unavailable                | Resource exhaustion, DDoS                 |
| Elevation of Privilege  | Gaining unauthorized access              | Horizontal/vertical privilege escalation  |

### Application to Components

```yaml
threat_model:
  components:
    - name: "API Gateway"
      stride:
        spoofing:
          - threat: "Token replay attack"
            mitigations: ["Short-lived tokens", "Token binding"]
        tampering:
          - threat: "Request modification in transit"
            mitigations: ["TLS 1.3", "Request signing"]
        denial_of_service:
          - threat: "Rate limit bypass"
            mitigations: ["Multiple rate limit layers", "IP reputation"]

    - name: "Database"
      stride:
        information_disclosure:
          - threat: "SQL injection"
            mitigations: ["Parameterized queries", "Input validation"]
        tampering:
          - threat: "Data modification by compromised service"
            mitigations: ["Row-level security", "Audit triggers"]

    - name: "Push Notification Service"
      stride:
        spoofing:
          - threat: "Sending notifications as another user"
            mitigations: ["Server-side token generation", "Device verification"]
```

## DREAD Scoring

### Formula

```
DREAD Score = (D + R + E + A + D) / 5
```

| Factor              | Description                          | Scale (1-10)                    |
|---------------------|--------------------------------------|---------------------------------|
| Damage Potential    | Impact if exploited                  | 1=Minimal, 10=Total compromise  |
| Reproducibility     | Ease of reproducing the exploit      | 1=Difficult, 10=Trivial         |
| Exploitability      | Skill/tools needed                   | 1=Expert, 10=Script kiddie      |
| Affected Users      | Number of users impacted             | 1=Few, 10=All users             |
| Discoverability     | Likelihood of discovering the flaw   | 1=Hidden, 10=Public/obvious     |

### Risk Thresholds

| Score Range | Risk Level  | Action Required                              |
|-------------|-------------|----------------------------------------------|
| 8.0 - 10.0  | Critical    | Fix immediately, block release               |
| 6.0 - 7.9   | High        | Fix within sprint                            |
| 4.0 - 5.9   | Medium      | Fix within current release cycle             |
| 2.0 - 3.9   | Low         | Schedule fix, document risk acceptance       |
| 1.0 - 1.9   | Informational | Note in security backlog                   |

### Scoring Example

```python
def dread_score(damage, reproducibility, exploitability, affected_users, discoverability):
    return (damage + reproducibility + exploitability + affected_users + discoverability) / 5

# Example: SQL injection in user profile endpoint
score = dread_score(
    damage=8,            # Can read all user data
    reproducibility=10,  # Trivially reproducible
    exploitability=7,    # Requires basic SQL knowledge
    affected_users=9,    # Affects all users
    discoverability=8    # Visible in API documentation
)
# DREAD = 8.4 → Critical
```

## Attack Trees

### Structure

```
                    [Goal: Steal User Data]
                           /          \
                    [OR]               [OR]
                   /    \             /    \
          [Compromise   [Exploit   [Social  [Physical
           API Server]   Client]   Engineer] Access]
              |              |         |          |
         [SQLi, SSRF]  [XSS, MITM] [Phish]  [Device Theft]
```

### Building Attack Trees

1. Define the root goal (what the attacker wants)
2. Identify sub-goals that achieve the root goal
3. For each sub-goal, identify methods
4. Annotate nodes with cost/likelihood
5. Identify the "cheapest path" to the goal

### Cost Analysis

```yaml
attack_tree:
  goal: "Access user messages"
  paths:
    - method: "SQL Injection via profile API"
      cost: "Low (script available)"
      likelihood: "Medium"
      skill: "Low"
    - method: "Steal session token via XSS"
      cost: "Low"
      likelihood: "Medium"
      skill: "Medium"
    - method: "Compromise push notification service"
      cost: "High (need internal access)"
      likelihood: "Low"
      skill: "High"
    - method: "Social engineering support staff"
      cost: "Medium"
      likelihood: "High"
      skill: "Low"
```

## Data Flow Diagrams

### Components

| Symbol | Element           | Description                              |
|--------|-------------------|------------------------------------------|
| Square | External Entity   | User, third-party service, external API  |
| Circle | Process           | Business logic, transformation           |
| Arrow  | Data Flow         | Movement of data between elements        |
| Line   | Trust Boundary    | Security domain border                   |

### Trust Boundaries

```yaml
trust_boundaries:
  - name: "Client/Server Boundary"
    elements_crossed: ["Mobile App", "API Gateway"]
    controls: ["TLS 1.3", "Certificate Pinning", "JWT Validation"]

  - name: "Service-to-Database Boundary"
    elements_crossed: ["API Server", "PostgreSQL"]
    controls: ["Parameterized Queries", "Row-Level Security", "Network Isolation"]

  - name: "Internal/External Boundary"
    elements_crossed: ["Load Balancer", "Internal Network"]
    controls: ["WAF Rules", "Rate Limiting", "IP Allowlisting"]

  - name: "User Device Boundary"
    elements_crossed: ["Mobile App", "Secure Storage"]
    controls: ["Keychain/Keystore", "Biometric Auth", "Code Obfuscation"]
```

## Threat Categorization

### By Attack Surface

```yaml
attack_surfaces:
  network:
    threats:
      - "Man-in-the-middle attack"
      - "DNS hijacking"
      - "BGP hijacking"
    mitigations:
      - "TLS 1.3 with certificate pinning"
      - "DNS over HTTPS"
      - "Multiple CDN providers"

  api:
    threats:
      - "Broken authentication"
      - "Mass assignment"
      - "BOLA (Broken Object Level Authorization)"
    mitigations:
      - "OAuth 2.0 + PKCE"
      - "Input validation schemas"
      - "Authorization middleware"

  storage:
    threats:
      - "Data extraction from device"
      - "Backup data exposure"
      - "Cache poisoning"
    mitigations:
      - "Encrypted storage (AES-256)"
      - "Backup exclusion flags"
      - "Cache invalidation"

  client:
    threats:
      - "Code tampering"
      - "Reverse engineering"
      - "Root/jailbreak bypass"
    mitigations:
      - "Obfuscation + anti-tamper"
      - "Runtime integrity checks"
      - "Device attestation"
```

### By Threat Actor

| Actor            | Motivation     | Capability        | Primary Targets        |
|------------------|----------------|-------------------|------------------------|
| Script Kiddie    | Notoriety      | Low               | Known CVEs, misconfig  |
| Cybercriminal    | Financial      | Medium-High       | User data, payments    |
| Nation State     | Intelligence   | Very High         | Communications, secrets|
| Insider          | Various        | High (access)     | Internal systems       |
| Competitor       | IP theft       | Medium            | Trade secrets, code    |

## Risk Assessment Matrix

### Probability vs Impact

```
Impact →         Low (1)    Medium (2)   High (3)    Critical (4)
Probability ↓
Almost Certain   Medium(2)  High(3)      High(3)     Critical(4)
Likely           Low(1)     Medium(2)    High(3)     Critical(4)
Possible         Low(1)     Medium(2)    Medium(2)   High(3)
Unlikely         Info(0)    Low(1)       Medium(2)   Medium(2)
Rare             Info(0)    Info(0)      Low(1)      Low(1)
```

### Risk Treatment Options

| Option       | Description                          | When to Use                    |
|--------------|--------------------------------------|--------------------------------|
| Mitigate     | Implement controls to reduce risk    | Cost-effective controls exist  |
| Transfer     | Shift risk to third party (insurance)| Risk beyond capability         |
| Accept       | Acknowledge and monitor              | Low risk, high mitigation cost |
| Avoid        | Eliminate the activity               | Unacceptable risk level        |

## Threat Modeling Process

```
1. Define Scope
   → What are we modeling?
   → What's in/out of scope?

2. Identify Assets
   → What are we protecting?
   → Classification level

3. Create Architecture Diagram
   → Components, data flows, trust boundaries

4. Identify Threats (STRIDE)
   → Per component, per data flow

5. Assess Risk (DREAD)
   → Score each threat
   → Prioritize by risk level

6. Define Mitigations
   → For each high-priority threat
   → Cost-benefit analysis

7. Validate
   → Verify mitigations are implemented
   → Penetration testing
   → Code review

8. Document & Iterate
   → Maintain threat model as living document
   → Update with each major change
```

## Review Cadence

| Event                           | Action                                |
|---------------------------------|---------------------------------------|
| New feature or component        | Update threat model                   |
| Security incident               | Full review + re-score                |
| Quarterly                       | Review and refresh all threat models  |
| Dependency update               | Check for new threats                 |
| Architecture change             | Re-assess trust boundaries            |
| External audit findings         | Address and re-assess                 |
