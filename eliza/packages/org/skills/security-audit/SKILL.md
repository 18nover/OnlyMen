---
name: security-audit
description: >
  Comprehensive security audit skill for OnlyMen iOS/Android applications.
  Provides structured methodologies for threat modeling, code review, dependency
  analysis, secret detection, and compliance verification aligned with OWASP
  Mobile Top 10 and privacy regulations.
version: 1.0.0
authors:
  - Sentinel
tags:
  - security
  - audit
  - owasp
  - compliance
  - threat-modeling
applicable_agents:
  - Sentinel
---

# Security Audit Skill

## Overview

This skill provides a structured methodology for conducting security audits of
OnlyMen iOS and Android applications. It covers threat modeling, secure code
review, dependency analysis, secret detection, and privacy compliance. Use this
skill when performing security assessments, pre-release audits, or incident
response investigations.

## Scope

This skill applies to:
- React Native application code (TypeScript/JavaScript)
- Native iOS (Swift/Objective-C) and Android (Kotlin/Java) bridge code
- Backend API integrations and AT Protocol implementations
- CI/CD pipeline configurations
- Third-party dependencies and SDKs
- Local data storage and encryption mechanisms

---

## 1. OWASP Mobile Top 10 Checklist

Evaluate the application against each OWASP Mobile Top 10 (2024) category.

### M1: Improper Credential Usage
- [ ] No hardcoded API keys, tokens, or secrets in source code
- [ ] Credentials stored in secure enclave / Keychain / Keystore only
- [ ] Tokens have appropriate expiration and refresh mechanisms
- [ ] Biometric authentication backed by hardware security
- [ ] Session tokens invalidated on logout

### M2: Inadequate Supply Chain Security
- [ ] All dependencies pinned to known-good versions
- [ ] Dependency lockfiles committed and verified in CI
- [ ] No use of untrusted or abandoned packages
- [ ] Build reproducibility verified
- [ ] Third-party SDKs audited for data collection behavior

### M3: Insecure Authentication/Authorization
- [ ] Authentication required for all sensitive endpoints
- [ ] Server-side validation of all authorization checks
- [ ] No client-side-only access control
- [ ] Multi-factor authentication supported for sensitive operations
- [ ] Account lockout mechanisms in place

### M4: Insufficient Input/Output Validation
- [ ] All user inputs sanitized before processing
- [ ] Deep link parameters validated before navigation
- [ ] Push notification payloads validated
- [ ] Clipboard data treated as untrusted
- [ ] File imports validated for type and content

### M5: Insecure Communication
- [ ] TLS 1.2+ enforced for all network traffic
- [ ] Certificate pinning implemented for API endpoints
- [ ] No sensitive data transmitted over insecure channels
- [ ] WebSocket connections authenticated and encrypted
- [ ] DNS resolution verified (no DNS spoofing vectors)

### M6: Inadequate Privacy Controls
- [ ] PII minimization — collect only what is necessary
- [ ] User consent obtained before data collection
- [ ] Data deletion capability provided
- [ ] Analytics events scrubbed of sensitive data
- [ ] Third-party analytics reviewed for privacy compliance

### M7: Insufficient Binary Protections
- [ ] ProGuard/R8 rules applied (Android)
- [ ] Bitcode disabled to prevent reverse engineering analysis
- [ ] Anti-tampering detection in place
- [ ] Jailbreak/root detection where appropriate
- [ ] Runtime application self-protection (RASP) considered

### M8: Security Misconfiguration
- [ ] Debug mode disabled in production builds
- [ ] WebView configurations hardened
- [ ] Exported components restricted (Android manifest)
- [ ] App Transport Security enforced (iOS)
- [ ] Network security config properly configured

### M9: Insecure Data Storage
- [ ] No sensitive data in UserDefaults/SharedPreferences
- [ ] No sensitive data in logs or debug output
- [ ] SQLite databases encrypted at rest
- [ ] Temporary files cleaned up after use
- [ ] Screenshot/recording protection on sensitive screens

### M10: Insufficient Cryptography
- [ ] Industry-standard algorithms used (AES-256, RSA-2048+)
- [ ] No custom or proprietary cryptographic implementations
- [ ] Keys generated with cryptographically secure RNG
- [ ] Key rotation mechanism in place
- [ ] IVs/nonces are unique and unpredictable

---

## 2. Threat Modeling (STRIDE)

Apply the STRIDE framework to identify threats across system components.

### STRIDE Categories

| Category | Description | Mobile-Relevant Questions |
|---|---|---|
| **S**poofing | Impersonation of users/systems | Can an attacker impersonate a user? Are auth tokens protectable? |
| **T**ampering | Unauthorized modification | Can local data be modified? Are API payloads integrity-checked? |
| **R**epudiation | Denying actions occurred | Are all sensitive actions logged? Is audit trail tamper-proof? |
| **I**nformation Disclosure | Exposing sensitive data | Is data encrypted at rest and in transit? Are logs sanitized? |
| **D**enial of Service | Making system unavailable | Can API abuse cause downtime? Are rate limits in place? |
| **E**levation of Privilege | Gaining unauthorized access | Can a regular user access admin functions? Are permissions enforced server-side? |

### Threat Modeling Process

1. **Decompose the application**
   - Map all data flows (app → server → third-party)
   - Identify trust boundaries (device, network, server)
   - Catalog all entry points (APIs, deep links, push notifications)

2. **Identify threats per component**
   - Apply STRIDE to each data flow and trust boundary
   - Document threat scenarios with attacker profiles
   - Rate threats using DREAD or CVSS scoring

3. **Mitigate identified threats**
   - Document countermeasures for each threat
   - Prioritize by risk level (Critical → High → Medium → Low)
   - Track mitigations as security work items

### Deliverable Template

```markdown
## Threat: [Threat Name]
- **Component:** [Affected component]
- **STRIDE Category:** [Category]
- **Description:** [What could go wrong]
- **Impact:** [Low/Medium/High/Critical]
- **Likelihood:** [Low/Medium/High]
- **Mitigation:** [Countermeasure]
- **Status:** [Open/In Progress/Resolved]
```

---

## 3. Code Review for Security

### Review Checklist

**Input Validation**
- [ ] All external inputs validated against expected schema
- [ ] Deep link handlers validate parameters before routing
- [ ] Push notification handlers validate payload structure
- [ ] File import handlers validate file type and content

**Authentication & Authorization**
- [ ] Auth checks present at all route/page boundaries
- [ ] API calls include proper authorization headers
- [ ] Token refresh logic handles edge cases (concurrent, expired)
- [ ] Logout properly invalidates all sessions

**Data Handling**
- [ ] Sensitive variables not logged or stored in plain text
- [ ] User data sanitized before rendering (XSS prevention)
- [ ] File system operations use safe paths (no path traversal)
- [ ] Clipboard operations clear sensitive data appropriately

**Cryptography**
- [ ] No custom encryption implementations
- [ ] Key material never appears in logs or error messages
- [ ] Random number generation uses CSPRNG
- [ ] Encryption parameters (IV, salt) are unique per operation

**Error Handling**
- [ ] Errors do not leak sensitive system information
- [ ] Stack traces not exposed to users
- [ ] Error boundaries prevent information disclosure
- [ ] Graceful degradation does not bypass security controls

### Anti-Patterns

- **Never** store secrets in AsyncStorage, UserDefaults, or SharedPreferences
- **Never** use `console.log` with sensitive data in production
- **Never** implement custom encryption or hashing
- **Never** trust client-side validation alone
- **Never** disable SSL verification for debugging in production builds
- **Never** use `eval()` or dynamic code execution
- **Never** embed credentials in binary or source code

---

## 4. Dependency Vulnerability Scanning

### Tools

- **npm audit** / **yarn audit** — known vulnerability scanning
- **Snyk** — continuous vulnerability monitoring
- **Dependabot** — automated dependency update PRs
- **OWASP Dependency-Check** — comprehensive CVE scanning

### Process

1. Run `npm audit --audit-level=high` before every release
2. Review and triage all Critical and High severity findings
3. Verify no malicious packages introduced (typosquatting check)
4. Validate license compatibility for all dependencies
5. Document accepted risks with justification

### Red Flags

- Dependencies with known CVEs and no patch available
- Packages with excessive permissions or network access
- Abandoned packages (>2 years without updates)
- Packages downloading binaries at install time
- Typosquatting (e.g., `reacr-native` instead of `react-native`)

---

## 5. Secret Detection

### Scan Targets

- Source code files (.ts, .tsx, .js, .swift, .kt, .java)
- Configuration files (.env, .json, .yaml, .plist)
- Build scripts and CI/CD configurations
- Git history (committed secrets)
- Docker/container configurations

### Patterns to Detect

```
API keys, tokens, passwords, private keys, connection strings,
AWS access keys, Firebase keys, third-party SDK secrets,
hardcoded certificates, encryption keys
```

### Tools

- **truffleHog** / **gitleaks** — git history scanning
- **detect-secrets** — baseline secret detection
- **git-secrets** — pre-commit hook prevention

### Remediation

1. Rotate all exposed credentials immediately
2. Remove secrets from source code and history
3. Add pre-commit hooks to prevent future commits
4. Move secrets to secure vault (Keychain, Keystore, or env variables)
5. Audit access logs for unauthorized use of exposed credentials

---

## 6. Authentication & Authorization Review

### Authentication Flow Audit

- [ ] Login flow enforces strong password requirements
- [ ] Account lockout after failed attempts (progressive delay)
- [ ] Password reset flow does not leak account existence
- [ ] Multi-factor authentication available and enforced where required
- [ ] Biometric authentication properly integrated with secure hardware
- [ ] Session management follows OWASP session guidelines
- [ ] Concurrent session handling defined and enforced

### Token Security

- [ ] Access tokens have short expiration (15 minutes recommended)
- [ ] Refresh tokens are rotated on use
- [ ] Token binding to device/app instance
- [ ] Token revocation capability on server side
- [ ] JWT validation includes signature verification, expiry, and audience checks

### Authorization Patterns

- [ ] Principle of least privilege applied
- [ ] Server-side enforcement (never rely on client-side checks alone)
- [ ] Role-based access control (RBAC) properly implemented
- [ ] Resource-level authorization (not just endpoint-level)
- [ ] API rate limiting per user/role

---

## 7. Encryption Verification

### At Rest

- [ ] iOS Keychain used with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
- [ ] Android Keystore with hardware-backed key attestation
- [ ] Database encryption using SQLCipher or equivalent
- [ ] File-level encryption for sensitive local files
- [ ] Backup encryption or exclusion from unencrypted backups

### In Transit

- [ ] TLS 1.2 minimum, TLS 1.3 preferred
- [ ] Strong cipher suites only (no RC4, 3DES, export ciphers)
- [ ] Certificate pinning with backup pins
- [ ] HSTS enforcement on API endpoints
- [ ] No mixed content or protocol downgrade

### Key Management

- [ ] Keys generated using platform CSPRNG
- [ ] Key storage in hardware-backed secure storage
- [ ] Key rotation schedule defined and automated
- [ ] Key destruction on app uninstall or credential revocation
- [ ] No key material in logs, backups, or analytics

---

## 8. Privacy Compliance (GDPR/CCPA)

### Data Inventory

- [ ] Complete map of all personal data collected
- [ ] Purpose documented for each data element
- [ ] Legal basis identified (consent, contract, legitimate interest)
- [ ] Data retention periods defined and enforced
- [ ] Third-party data sharing documented

### User Rights

- [ ] Right to access — data export capability
- [ ] Right to deletion — account/data deletion mechanism
- [ ] Right to portability — machine-readable data export
- [ ] Right to opt-out — consent withdrawal mechanism
- [ ] Right to non-discrimination for exercising privacy rights

### Implementation

- [ ] Privacy policy link accessible from app
- [ ] Consent collection with granular options
- [ ] Data minimization enforced in collection flows
- [ ] Anonymization/pseudonymization for analytics
- [ ] Privacy impact assessment for new features
- [ ] Data processing agreements with third parties

### CCPA-Specific

- [ ] "Do Not Sell My Personal Information" link
- [ ] Opt-out mechanism for data sales/sharing
- [ ] Financial incentive disclosures where applicable
- [ ] Annual data inventory review

---

## Escalation Paths

| Severity | Response Time | Escalation |
|---|---|---|
| Critical | Immediate | CTO + Security Lead + All affected teams |
| High | 24 hours | Security Lead + Engineering Manager |
| Medium | 1 week | Engineering Manager + Tech Lead |
| Low | Next sprint | Tech Lead via standard backlog |

### Incident Response

1. **Contain** — Isolate affected systems immediately
2. **Assess** — Determine scope and impact
3. **Notify** — Inform stakeholders per severity matrix
4. **Remediate** — Deploy fix and verify
5. **Document** — Post-incident review within 48 hours
6. **Prevent** — Update controls to prevent recurrence

---

## Common Gotchas

- **Deep link injection** — Unvalidated deep links can bypass auth or execute actions
- **Log leakage** — React Native bridge logs may expose native-layer secrets
- **Backup exposure** — iOS unencrypted backups include Keychain in some configurations
- **Clipboard persistence** — Sensitive data copied to clipboard persists across apps
- **Screenshot leaks** — Sensitive screens captured in task switcher or screen recordings
- **Debug builds in production** — React Native dev menu and inspector in release builds
- **Stale tokens** — Refresh token race conditions during concurrent requests
- **Third-party SDK telemetry** — Analytics SDKs may collect more data than expected
- **WebView XSS** — Injected HTML in WebViews can execute arbitrary JavaScript
- **Intent interception (Android)** — Exported activities/intents can be triggered by other apps
