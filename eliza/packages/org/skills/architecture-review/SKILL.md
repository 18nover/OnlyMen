---
name: architecture-review
description: >
  Comprehensive architecture review skill for OnlyMen system design. Provides
  structured methodologies for Architecture Decision Records (ADRs), trade-off
  analysis, system design patterns, AT Protocol architecture assessment,
  scalability review, and maintainability evaluation.
version: 1.0.0
authors:
  - Atlas
  - Echo
  - Nova
  - Forge
tags:
  - architecture
  - system-design
  - adr
  - scalability
  - at-protocol
  - design-patterns
applicable_agents:
  - Atlas
  - Echo
  - Nova
  - Forge
---

# Architecture Review Skill

## Overview

This skill provides a structured methodology for reviewing, evaluating, and
documenting architectural decisions in OnlyMen systems. It covers Architecture
Decision Records (ADRs), trade-off analysis, system design patterns, AT Protocol
architecture, scalability assessment, and maintainability review. Use this skill
when conducting architecture reviews, evaluating design alternatives, or
documenting significant technical decisions.

## Scope

This skill applies to:
- React Native application architecture
- Backend service design and API architecture
- AT Protocol implementation and data layer
- Cross-platform architecture decisions
- Data flow and state management patterns
- Infrastructure and deployment architecture
- Third-party integration architecture

---

## 1. Architecture Decision Records (ADRs)

### ADR Template

Every significant architectural decision should be documented using the following
format. ADRs are stored in `docs/adr/` and numbered sequentially.

```markdown
# ADR-{NUMBER}: {TITLE}

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-{NUMBER}
**Date:** YYYY-MM-DD
**Deciders:** {list of people involved}
**Technical Story:** {link to issue/ticket}

## Context

{What is the issue that we're seeing that is motivating this decision?}

## Decision

{What is the change that we're proposing and/or doing?}

## Consequences

### Positive
- {benefit 1}
- {benefit 2}

### Negative
- {drawback 1}
- {drawback 2}

### Risks
- {risk 1 and mitigation}

## Alternatives Considered

### Option A: {name}
- **Description:** {what it involves}
- **Pros:** {advantages}
- **Cons:** {disadvantages}
- **Verdict:** {why not chosen}

### Option B: {name}
- {same structure}

## References
- {links to relevant docs, articles, discussions}
```

### When to Write an ADR

- Choosing a state management library
- Selecting a navigation framework
- Deciding on data persistence strategy
- Choosing between monolith and microservices
- Selecting a testing framework or strategy
- Adopting a new language or runtime
- Changing database technology
- Implementing authentication/authorization
- Adopting a new deployment strategy
- Any decision that is difficult or costly to reverse

### ADR Quality Criteria

- [ ] Clear problem statement in Context
- [ ] Decision stated unambiguously
- [ ] Consequences are honest and complete
- [ ] At least two alternatives considered
- [ ] Trade-offs explicitly stated
- [ ] Affected teams identified
- [ ] Rollback strategy defined where applicable

---

## 2. Trade-Off Analysis

### Trade-Off Framework

For each architectural option, evaluate across these dimensions:

| Dimension | Weight | Option A | Option B | Option C |
|---|---|---|---|---|
| Development velocity | 25% | | | |
| Runtime performance | 20% | | | |
| Maintainability | 20% | | | |
| Scalability | 15% | | | |
| Learning curve | 10% | | | |
| Ecosystem maturity | 10% | | | |

### Common Trade-Offs

**Consistency vs. Availability (CAP Theorem)**
- Strong consistency: ACID transactions, synchronous replication
- High availability: Eventual consistency, asynchronous replication
- For social features: Availability often preferred (acceptable stale data)
- For financial features: Consistency required (no stale data)

**Performance vs. Maintainability**
- Micro-optimizations: Faster but harder to maintain
- Clean abstractions: Slightly slower but easier to change
- Default to maintainability; optimize measured bottlenecks only

**Flexibility vs. Simplicity**
- Feature flags: Flexible but adds complexity
- Configuration: Adaptable but more surface area
- Convention: Simple but less adaptable
- Start simple; add flexibility when requirements demand it

**Build vs. Buy**
- Build: Full control, maintenance burden, longer time-to-market
- Buy: Less control, vendor dependency, faster time-to-market
- Prefer buy for undifferentiated capabilities
- Prefer build for core differentiators

### Trade-Off Analysis Template

```markdown
## Trade-Off Analysis: {Feature/Decision}

### Option A: {Name}
**Description:** {Brief description}

| Criterion | Score (1-5) | Notes |
|---|---|---|
| Performance | | |
| Maintainability | | |
| Scalability | | |
| Security | | |
| Cost | | |
| Time to implement | | |

### Option B: {Name}
{Same structure}

### Recommendation
{Which option and why, with explicit acknowledgment of trade-offs}
```

---

## 3. System Design Patterns

### React Native Application Patterns

**Container/Presenter Pattern**
```
Container (smart) → manages state, data fetching, business logic
Presenter (dumb) → receives props, renders UI, no side effects
```
- Use when: Components need testable, reusable UI separate from logic
- Avoid when: Simple components where separation adds unnecessary complexity

**Compound Component Pattern**
```
Context Provider → manages shared state
Child components → consume context, compose UI
```
- Use when: Building complex components with internal state coordination
- Avoid when: Simple parent-child relationships suffice

**Repository Pattern**
```
Repository → abstracts data sources (API, local DB, cache)
ViewModel/Hook → consumes repository, manages UI state
```
- Use when: Data comes from multiple sources or data layer changes frequently
- Avoid when: Single data source with simple CRUD

**HOC/Hook Composition Pattern**
```
withAuth(Screen) → adds authentication
withTheme(Screen) → adds theme context
useErrorHandler() → catches and reports errors
```
- Use when: Cross-cutting concerns applied to multiple components
- Avoid when: Concern is specific to one component

### Backend Patterns

**API Gateway Pattern**
- Single entry point for all client requests
- Handles authentication, rate limiting, request routing
- Useful for: Mobile clients, third-party integrations

**Event Sourcing**
- Store state changes as immutable event log
- Current state derived from event replay
- Useful for: Audit trails, temporal queries, collaborative features

**CQRS (Command Query Responsibility Segregation)**
- Separate read and write models
- Optimize each for its specific access pattern
- Useful for: High-read/write ratio systems, complex queries

**Saga Pattern**
- Manage distributed transactions as sequence of local transactions
- Handle failures with compensating transactions
- Useful for: Multi-service workflows, payment processing

### Pattern Selection Guide

| Requirement | Recommended Pattern |
|---|---|
| Complex UI state | Compound Component / State Machine |
| Multiple data sources | Repository Pattern |
| Cross-cutting concerns | HOC / Hook Composition |
| Audit requirements | Event Sourcing |
| Read/write optimization | CQRS |
| Multi-step workflows | Saga Pattern |
| Feature toggling | Feature Flag Pattern |
| Offline support | Cache-First + Sync Pattern |

---

## 4. AT Protocol Architecture

### AT Protocol Components

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PDS        │────▶│  Relay      │────▶│  AppView    │
│  (Personal  │     │  (Firehose) │     │  (Indexing) │
│  Data Server)│     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐                        ┌─────────────┐
│  Identity   │                        │  Labelers   │
│  (DID/PLC)  │                        │  (Moderation)│
└─────────────┘                        └─────────────┘
```

### Architecture Review Points

**Data Layer**
- [ ] PDS data structures aligned with AT Protocol schemas
- [ ] Record types properly defined in Lexicon
- [ ] Data validation at PDS level before persistence
- [ ] Blob storage strategy defined (inline vs. external)
- [ ] Record history and tombstones handled correctly

**Identity Layer**
- [ ] DID resolution implemented correctly
- [ ] Handle-to-DID mapping cached with appropriate TTL
- [ ] Domain verification flow complete
- [ ] Account migration (handle/DID changes) supported
- [ ] Recovery mechanisms in place

**Network Layer**
- [ ] Firehose subscription handled with backpressure
- [ ] Event replay and catch-up logic implemented
- [ ] Rate limiting respected for all API calls
- [ ] Error handling for network partitions
- [ ] Cursor management for relay subscriptions

**Moderation Layer**
- [ ] Labeler integration for content moderation
- [ ] Mute/block lists respected
- [ ] Custom labelers supported where appropriate
- [ ] Appeal process for moderation decisions
- [ ] Transparency in moderation actions

### AT Protocol Anti-Patterns

- Storing application state in PDS records (use AppView for derived state)
- Trusting client-provided data without validation
- Ignoring firehose events (leads to data staleness)
- Caching DID resolution without TTL (identity changes)
- Bypassing Lexicon validation (breaks protocol interoperability)

---

## 5. Scalability Assessment

### Scalability Dimensions

| Dimension | What to Evaluate | Key Metrics |
|---|---|---|
| **Vertical** | Can individual components handle increased load? | CPU, memory, response time |
| **Horizontal** | Can we add more instances to handle load? | Throughput per instance, coordination overhead |
| **Data** | Can the data layer grow with demand? | Storage capacity, query performance |
| **Geographic** | Can we serve users in different regions? | Latency by region, data sovereignty |
| **Feature** | Can the architecture support new features? | Extension points, coupling analysis |

### Scalability Review Checklist

**Application Level**
- [ ] State management scales with user/feature growth
- [ ] Component rendering optimized for large data sets
- [ ] Navigation handles deep screen hierarchies
- [ ] Image/media loading scales with content volume

**API Level**
- [ ] Endpoints designed for horizontal scaling
- [ ] Database queries optimized for expected data volumes
- [ ] Rate limiting prevents abuse
- [ ] Caching reduces database load
- [ ] Background jobs handle increasing queue sizes

**Infrastructure Level**
- [ ] Auto-scaling configured and tested
- [ ] Database sharding strategy defined for data growth
- [ ] CDN for static assets and media
- [ ] Load balancer distributes traffic effectively
- [ ] Monitoring detects scaling triggers

### Scalability Anti-Patterns

| Pattern | Problem | Solution |
|---|---|---|
| N+1 queries | Database load grows with data | Batch queries, use DataLoader |
| Synchronous processing | Blocks under load | Async jobs, message queues |
| Shared mutable state | Coordination bottleneck | Event-driven, immutable state |
| Monolithic database | Scaling limit | Service decomposition, read replicas |
| No connection pooling | Connection exhaustion | Pool connections per service instance |
| Global locks | Contention under concurrency | Fine-grained locking, optimistic concurrency |

---

## 6. Security Architecture

### Security Architecture Review

**Authentication Architecture**
- [ ] Auth flow designed for mobile constraints
- [ ] Token lifecycle managed securely
- [ ] Multi-factor authentication architecture defined
- [ ] Session management follows security best practices
- [ ] Account recovery flow is secure and usable

**Authorization Architecture**
- [ ] Permission model clearly defined
- [ ] Server-side enforcement verified
- [ ] Role-based or attribute-based access control appropriate
- [ ] Resource-level permissions enforced
- [ ] Cross-tenant isolation verified

**Data Security Architecture**
- [ ] Encryption at rest and in transit
- [ ] Key management strategy defined
- [ ] Data classification and handling procedures
- [ ] Backup encryption and access controls
- [ ] Data retention and deletion policies

**Network Security Architecture**
- [ ] API gateway with rate limiting
- [ ] DDoS protection strategy
- [ ] Certificate pinning for mobile clients
- [ ] Network segmentation for services
- [ ] Web application firewall rules

### Security Architecture Patterns

```
Client → API Gateway → Auth Service → Authorization Middleware → Service
              │              │                │
              │              ▼                ▼
              │         Token Store     Permission Cache
              │
              ▼
         Rate Limiter → Request Logger → Audit Trail
```

### Security Review Checklist

- [ ] Threat model documented and current
- [ ] Security controls mapped to threats
- [ ] OWASP Mobile Top 10 addressed
- [ ] Penetration testing completed
- [ ] Security training for all developers
- [ ] Incident response plan documented and tested

---

## 7. Performance Architecture

### Performance Budget Definition

| Layer | Metric | Budget | Measurement |
|---|---|---|---|
| **Network** | API response time | < 500ms p95 | APM monitoring |
| **Network** | Payload size | < 100KB typical | Request logging |
| **Application** | Startup time | < 2s cold | Profiling tools |
| **Application** | Frame rate | > 55fps | Performance monitor |
| **Application** | Memory | < 150MB peak | Memory profiler |
| **Database** | Query time | < 100ms p95 | Database monitoring |
| **Database** | Connection count | < 100 per instance | Connection pool metrics |

### Performance Architecture Patterns

**Caching Architecture**
```
Client Cache (Memory)
    ↓ miss
HTTP Cache (ETags, Cache-Control)
    ↓ miss
CDN Cache (Edge)
    ↓ miss
API Cache (Redis/Memcached)
    ↓ miss
Database (Source of Truth)
```

**Async Processing Architecture**
```
Client Request → API Gateway → Sync Response (if cached)
                              → Message Queue (if async needed)
                                    ↓
                              Background Worker
                                    ↓
                              Result Cache / Push Notification
```

**Data Loading Architecture**
```
Critical Path Data → Preloaded during splash screen
Above Fold Data → Loaded on first render
Below Fold Data → Lazy loaded on scroll
Prefetched Data → Preloaded during idle time
```

### Performance Architecture Checklist

- [ ] Caching layers defined for each data type
- [ ] Async processing for non-critical operations
- [ ] Lazy loading strategy for UI components
- [ ] Background sync strategy defined
- [ ] Offline support architecture documented
- [ ] Performance budgets enforced in CI
- [ ] Monitoring and alerting configured

---

## 8. Maintainability Review

### Code Maintainability Metrics

| Metric | Target | Tool |
|---|---|---|
| Cyclomatic complexity | < 10 per function | ESLint, SonarQube |
| Code duplication | < 3% | SonarQube |
| Test coverage | > 80% | Jest, coverage reports |
| Technical debt ratio | < 5% | SonarQube |
| Documentation coverage | > 90% for public APIs | TypeDoc, API docs |

### Maintainability Checklist

**Code Organization**
- [ ] Clear separation of concerns (UI, business logic, data)
- [ ] Consistent directory structure
- [ ] Module boundaries well-defined
- [ ] No circular dependencies
- [ ] Appropriate use of abstractions (not over/under-engineered)

**Documentation**
- [ ] Architecture diagrams current
- [ ] ADRs for all significant decisions
- [ ] API documentation generated and current
- [ ] Onboarding documentation for new developers
- [ ] Runbooks for operational procedures

**Testing**
- [ ] Unit tests for business logic
- [ ] Integration tests for API contracts
- [ ] E2E tests for critical user journeys
- [ ] Test maintenance burden acceptable
- [ ] CI/CD pipeline fast and reliable

**Code Quality**
- [ ] Linting rules enforced in CI
- [ ] Type coverage > 95%
- [ ] No `@ts-ignore` or `eslint-disable` without justification
- [ ] Consistent code style across team
- [ ] Code review process enforced

### Technical Debt Management

```markdown
## Technical Debt Item: {Title}
- **Category:** Code | Architecture | Infrastructure | Documentation
- **Impact:** {How this affects development velocity or system reliability}
- **Effort:** {Estimated time to resolve}
- **Priority:** High | Medium | Low
- **Proposed Solution:** {How to address it}
- **Related ADR:** {Link if applicable}
```

---

## 9. Review Process

### Architecture Review Meeting Format

**Duration:** 60-90 minutes
**Attendees:** Tech Lead, relevant engineers, architect

**Agenda:**
1. **Context** (10 min) — Present the problem or change
2. **Options** (20 min) — Review proposed alternatives
3. **Trade-offs** (15 min) — Discuss implications of each option
4. **Decision** (10 min) — Reach consensus or identify needed data
5. **Documentation** (5 min) — Assign ADR author and timeline

### Review Criteria

| Criterion | Questions to Answer |
|---|---|
| **Correctness** | Does the design solve the stated problem? |
| **Completeness** | Are all requirements and constraints addressed? |
| **Consistency** | Does it align with existing architectural principles? |
| **Feasibility** | Can it be implemented with available resources? |
| **Flexibility** | Does it accommodate future requirements? |
| **Simplicity** | Is it as simple as possible while meeting requirements? |

### Architecture Principles

1. **Simplicity first** — Choose the simplest solution that works
2. **Reversibility** — Prefer decisions that are easy to change
3. **Evidence-based** — Measure before optimizing
4. **Explicit over implicit** — Document assumptions and trade-offs
5. **Fail fast** — Design for early error detection
6. **Defense in depth** — No single point of failure for critical paths

---

## Escalation Paths

| Issue Type | Severity | Response Time | Escalation |
|---|---|---|---|
| Architecture blocker (feature cannot proceed) | Critical | Immediate | Atlas + Engineering Lead |
| Security architecture vulnerability | Critical | Immediate | Atlas + Sentinel |
| Scalability concern (production impact) | High | 24 hours | Atlas + Pulse |
| Maintainability degradation | Medium | 1 sprint | Atlas + Tech Lead |
| Architecture documentation gaps | Low | Backlog | Atlas |

### Architecture Escalation Process

1. **Identify** — Document the architectural issue
2. **Assess** — Evaluate impact on current and future development
3. **Propose** — Draft alternative solutions with trade-off analysis
4. **Review** — Conduct architecture review meeting
5. **Decide** — Reach consensus or escalate to CTO
6. **Document** — Write ADR capturing decision and rationale
7. **Implement** — Execute architectural change with verification

---

## Common Gotchas

- **Over-engineering** — Building for scale you don't have yet. Start simple, evolve.
- **Under-documentation** — Decisions without context become cargo cult patterns.
- **Premature abstraction** — Abstracting before patterns are clear leads to wrong abstractions.
- **Ignoring operational concerns** — Architecture must be deployable, monitorable, and debuggable.
- **Single points of failure** — Critical paths must have redundancy or graceful degradation.
- **Distributed monolith** — Services coupled so tightly they must be deployed together.
- **Big ball of mud** — No clear boundaries between components; changes ripple everywhere.
- **Golden hammer** — Applying the same pattern to every problem regardless of fit.
- **Resume-driven development** — Choosing technologies for novelty rather than fit.
- **Conway's Law violation** — Architecture not aligned with team structure and communication.
- **AT Protocol specifics** — Confusing PDS with application storage; treating relay as database.
- **React Native bridge** — Excessive bridge calls; not accounting for serialization cost.
