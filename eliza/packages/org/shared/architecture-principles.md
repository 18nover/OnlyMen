# Architecture Principles

## Core Principles

### 1. Decentralization First
OnlyMen is built on AT Protocol. Every design decision must preserve:
- **Self-authenticating data** — Users sign their own content
- **Repository-based storage** — Data lives in user repos, not our servers
- **Handle portability** — Users can move between providers without losing identity
- **Federation** — Anyone can run a PDS or AppView

### 2. Protocol Compliance
- All API surfaces must conform to AT Protocol Lexicons
- OnlyMen currently ships no custom lexicons — the fork inherits upstream namespaces (`com.atproto.*`, `app.bsky.*` including `app.bsky.ageassurance.*` and `app.bsky.contact.*`, `tools.ozone.*`)
- If OnlyMen ever needs its own lexicon, reserve a distinct reverse-DNS root first (open decision — domain/trademark not settled); never add non-upstream NSIDs inside `app.bsky.*`
- Never break backward compatibility without a migration path
- Lexicon changes require Atlas approval before implementation

### 3. Layered Architecture
```
┌─────────────────────────────────┐
│         Presentation            │  React Native + Expo (app/)
├─────────────────────────────────┤
│         Application             │  Feature modules, screens
├─────────────────────────────────┤
│         Domain                  │  Business logic, AT Protocol
├─────────────────────────────────┤
│         Infrastructure          │  API clients, storage, auth
├─────────────────────────────────┤
│         Protocol                │  AT Protocol, Lexicons (atproto/)
└─────────────────────────────────┘
```

### 4. Security by Design
- Threat model every feature before implementation
- Principle of least privilege for all API endpoints
- Zero-trust between services
- No secrets in code — ever

### 5. Offline-First
- Core functionality must work without network
- Sync when connectivity returns
- Cache aggressively, invalidate intelligently
- Local-first data with eventual consistency

### 6. Performance Budget
- App cold start: <2 seconds
- Screen transitions: <300ms
- API response perception: <100ms (optimistic updates)
- Bundle size: monitor and enforce per-platform budgets

### 7. Accessibility as Requirement
- WCAG 2.1 AA compliance minimum
- Screen reader support for all features
- Responsive layouts for phone and tablet
- High contrast and dynamic type support

## Decision Framework

When facing architectural decisions:
1. Does it preserve decentralization?
2. Does it maintain protocol compliance?
3. Does it follow the layered architecture?
4. Does it pass the security review?
5. Does it work offline?
6. Does it meet performance budgets?
7. Is it accessible?

If any answer is "no", document the trade-off in an ADR and get Atlas + domain agent approval.
