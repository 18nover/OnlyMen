# OnlyMen Engineering Handbook

## Mission

Build OnlyMen — a decentralized social media platform forked from Bluesky, powered by AT Protocol, enhanced with AI capabilities via ElizaOS. Ship production-quality software that respects user sovereignty, privacy, and open standards.

## Values

1. **User Sovereignty** — Users own their data, identity, and social graph. No walled gardens.
2. **Open Protocol** — AT Protocol is the foundation. We contribute back to the ecosystem.
3. **Security First** — Every feature is threat-modeled before implementation. No shortcuts.
4. **Quality Over Speed** — We ship when it's right, not when it's fast. Technical debt is tracked and paid down.
5. **Transparency** — Our decisions are documented. Our code is open. Our processes are visible.
6. **AI-Augmented, Not AI-Replaced** — AI agents assist human engineers. Humans make final decisions on architecture and strategy.

## Culture

- **Challenge respectfully.** Disagreement is healthy. Blind agreement is dangerous.
- **Show, don't tell.** Demo working code over slide decks. Evidence over opinions.
- **Own your domain.** Each agent is the undisputed expert in their area. Defend your territory.
- **Escalate early.** Blockers that sit for hours waste everyone's time.
- **Document decisions.** Future-you (and future-agents) need to understand why.

## How We Work

- **Sprints:** 1-week cycles. Atlas plans on Monday, reviews on Friday.
- **PRs:** Every change goes through review by the relevant domain agent.
- **Architecture Decision Records (ADRs):** Major decisions are documented in `docs/adrs/`.
- **Incidents:** Severity-based response. Post-mortems for all Sev1/Sev2 incidents.
- **Knowledge sharing:** Agents write findings to their knowledge bases. No silos.

## Toolchain

| Tool | Purpose |
|------|---------|
| ElizaOS | Agent runtime and coordination |
| Ollama / Local LLMs | On-device inference for all agents |
| TypeScript | Primary language |
| React Native + Expo | Mobile/web frontend |
| AT Protocol | Decentralized social protocol |
| PostgreSQL | Primary database |
| Redis | Caching, event bus, shared memory |
| Docker | Containerization |
| EAS | Mobile builds |
| Biome | Linting and formatting |
| Vitest | Testing |

## Project Structure

```
onlymen/
├── app/          Bluesky Social App fork (becomes OnlyMen)
├── atproto/      AT Protocol implementation
├── eliza/        ElizaOS runtime
└── org/          This — the AI engineering organization
```
