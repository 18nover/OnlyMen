---
name: moderation-tooling
description: >
  Ozone moderation system design skill for Vision. Covers the moderation
  event model, subject status state machine, label taxonomy design, report
  triage/queue routing, appeals, and strikes.
version: 1.0.0
authors:
  - Vision
tags:
  - ozone
  - moderation
  - labels
  - trust-and-safety
  - at-protocol
applicable_agents:
  - Vision
  - Forge
  - Sentinel
---

# Moderation Tooling Skill

Structured methodology for designing moderation capabilities on Ozone
(`atproto/packages/ozone`) — event types, label taxonomy, report triage, and
the review-state machine every moderation decision flows through.

## 1. Is this a new event, a new label, or a new report reason?

Most "new moderation feature" requests are **not** a new `modEvent*` type.
Check in this order before proposing one:

1. **New report reason?** → add to `tools.ozone.report.defs#reasonType`,
   route it to a queue. No event-model change needed.
2. **New label?** → design a `labelValueDefinition` (see §3). No event-model
   change needed.
3. **New state-machine behavior?** → only now consider a new `modEvent*`
   type — and only if an existing event genuinely can't express it.

## 2. Moderation event design

Every event carries `subject`, `createdBy` (moderator or service DID),
`createdAt`, and optionally `modTool` (which surface produced it). When
designing a new event's effect on `subjectStatusView.reviewState`:

- State the transition explicitly: `reviewOpen -> reviewEscalated`, never
  "whatever the current state is" unless that's deliberate (mute events
  preserve current state on purpose — muting is orthogonal to review
  disposition).
- If it changes public visibility (takedown-class), it **must** have a
  working reverse action that undoes every field the forward action touched.
- Decide whether it carries a `strikeCount` and whether that count expires.

## 3. Label design checklist

1. **Trust tier first**: self-label (author-declared, in `selfLabels`) or
   labeler label (authoritative, streamed via `subscribeLabels`)? Never share
   a `val` string across tiers.
2. **`severity`**: `alert` (harm categories) / `inform` (neutral disclosure) /
   `none` (pure filter signal, no visible chrome).
3. **`blurs`**: `content` (hide everything) / `media` (images/video/audio
   only) / `none`.
4. **`defaultSetting`**: most harm categories default to `hide`; disclosures
   default to `warn` or `ignore`.
5. Write the `labelValueDefinitionStrings` copy (name + description per
   locale) before shipping — hand to Scribe, never ship a placeholder.
6. Never redefine a `!`-prefixed system label's semantics (`!hide`, `!warn`,
   `!no-unauthenticated`) — those exist specifically to bypass user overrides.

## 4. Report triage and queue design

- Route by `reportTypes` + `subjectTypes`, not by moderator availability.
- Design queue SLAs around response-time requirements: child-safety/imminent-
  harm gets the tightest SLA and routes to trained moderators only; spam/
  low-severity can tolerate automated pre-filtering (which still must emit a
  `modEvent`, never a silent auto-resolve).
- Never let a report fall into a generic "other" reason bucket if a specific
  one exists — it's a routing dead-end that loses the signal needed for both
  queue assignment and trend analysis.
- Track `other`-routed volume as a taxonomy-completeness signal, not noise.

## 5. Appeals and reverse paths

- `modEventResolveAppeal` is the only correct way to close an `appealed`
  state — routing an appeal through a side channel (support ticket, DM)
  breaks the audit trail.
- Every takedown-class action needs a tested reverse path. A reverse action
  must reset every field the forward action set (e.g. reversing a time-boxed
  takedown must also clear `suspendUntil`, not just flip `takendown`).

## 6. Client-visible impact — always spec this

For any event-type or label change, hand the exact before/after state to
whoever implements the client (`ContentHider`/`PostHider`/`ScreenHider`/
`ModerationDetailsDialog`). A moderation model change that doesn't specify
its client rendering isn't done — the state machine and the UI are one
feature, not two.

## 7. Review checklist

1. Does an existing event/label/reason cover this? (§1)
2. Reverse path exists and is tested, if applicable.
3. Strike interaction decided explicitly (carries a count? expires?).
4. Client rendering spec handed off, not left implicit.
5. Anything CSAM-adjacent or involving blob diversion routes through
   Sentinel review before merging — no exceptions.
