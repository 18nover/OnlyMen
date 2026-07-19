# Reporting — from user tap to resolution

The report pipeline end-to-end, plus the store-compliance requirements that
make it launch-critical for an 18+ UGC app.

## Protocol path

1. **Client** (`app/`): report UI (`ReportDialog` and related components)
   collects a reason + optional comment against a subject — an account
   (`com.atproto.admin.defs#repoRef`) or a record
   (`com.atproto.repo.strongRef`, e.g. a specific post URI+CID).
2. **Submission**: `com.atproto.moderation.createReport` (procedure,
   authed) with a `reasonType` from the report reason taxonomy
   (`com.atproto.moderation.defs` + the richer `tools.ozone.report.defs`
   set: violence, sexual content, child safety, harassment, misleading,
   rule violations, self-harm, appeals). The user's PDS forwards reports
   to the configured moderation service.
3. **Ozone intake**: the report becomes a `modEventReport` in the event
   log; subject status opens (`reviewOpen`) and `lastReportedAt` is
   stamped. Queue routing (`tools.ozone.queue.*` — `routeReports`,
   `listQueues`, `assignModerator`) assigns it by subject type + reason.
4. **Moderator action**: acknowledge / escalate / label / takedown /
   mute — each an explicit `modEvent*` (see `ozone.md` and
   `moderation-actions.md` for the event → status state machine).
5. **Effect**: labels flow to AppViews and clients; takedowns remove from
   our services; the reporter's client can reflect resolution. Appeals
   come back through the same pipe (`reasonAppeal` → `modEventResolveAppeal`).

## Severity is not uniform

Child-safety and imminent-harm reports are not ordinary queue items:
priority routing, immediate escalation, and (for CSAM) the `BlobDiverter`
path exist specifically so this material is diverted, not casually viewed.
OnlyMen policy must define the human-escalation chain (Atlas + human
operator) before launch — an 18+ app will receive underage-user reports
and must handle them as account-level age-assurance + child-safety cases,
not content disputes.

## Store compliance (launch gate, Play first then App Store)

Both stores require for UGC apps — and reviewers actively test:
- In-app reporting on every piece of UGC (post, profile, DM) — reachable
  in ≤ a couple of taps, no web detour.
- **User blocking** that takes effect immediately (ATProto blocks are
  public repo records — pair with mute for the privacy-sensitive path).
- Terms/EULA acceptance with zero-tolerance-for-objectionable-content
  language at signup.
- Evidence of active moderation (acted-on reports, response SLAs).
- 18+: age gating at entry (our `app.bsky.ageassurance.*` flow) plus the
  store's own age-rating questionnaire answered honestly.
Apple additionally expects a developer-response mechanism for objectionable
content and can reject on moderation-quality grounds — staffing the queue
is a launch requirement, not an ops nicety.

## OnlyMen review checklist for report-surface changes

- Every new content surface (drafts, DMs, live features) ships with report
  + block wired in — no surface launches reportable-content-first.
- Reporter privacy: reports are confidential to the moderation service;
  never leak reporter identity to the subject (harassment vector in a
  community where outing is the harm model).
- Reason taxonomy changes are lexicon changes — coordinate with Lexi;
  routing changes are Ozone config — coordinate queue SLAs with Atlas.
