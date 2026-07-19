/**
 * Generates docs/agents/<name>.md — one command reference per org agent —
 * from the character JSON (identity, role, knowledge) plus the per-agent
 * command map below (skills, review type, tailored examples). Re-run after
 * changing characters or the org CLI: `bun run docs`.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface CharacterFile {
  name: string
  username: string
  bio: string[]
  topics: string[]
  settings: Record<string, string>
  knowledge: Array<{ path: string; title: string }>
}

/** Per-agent curation the character file does not carry. */
const AGENT_META: Record<string, { skills: string[]; reviewType: string; exampleTask: string; exampleAsk: string }> = {
  atlas: {
    skills: ['architecture-review'],
    reviewType: 'architecture_review',
    exampleTask: 'Plan the sprint for the notifications feature',
    exampleAsk: 'Give me the org status and current blockers',
  },
  circuit: {
    skills: ['devops-deployment'],
    reviewType: 'code_review',
    exampleTask: 'Set up the staging deployment pipeline',
    exampleAsk: 'Walk me through the release deployment checklist',
  },
  compass: {
    skills: ['qa-testing'],
    reviewType: 'qa_review',
    exampleTask: 'Write the E2E test plan for the settings flow',
    exampleAsk: 'What is our test coverage strategy for the feed?',
  },
  echo: {
    skills: ['code-audit'],
    reviewType: 'code_review',
    exampleTask: 'Audit the atproto packages for dead code',
    exampleAsk: 'Audit the repository for dependency drift',
  },
  forge: {
    skills: ['backend-dev'],
    reviewType: 'code_review',
    exampleTask: 'Implement the notifications API endpoint',
    exampleAsk: 'How should we shape the PDS notification lexicon?',
  },
  nova: {
    skills: ['react-native-dev', 'expo-dev'],
    reviewType: 'code_review',
    exampleTask: 'Implement the notifications settings screen',
    exampleAsk: 'What is the right navigation pattern for the new tab?',
  },
  pixel: {
    skills: ['accessibility-review'],
    reviewType: 'design_review',
    exampleTask: 'Define tokens for the new badge component',
    exampleAsk: 'Which spacing tokens should the settings rows use?',
  },
  prism: {
    skills: ['accessibility-review'],
    reviewType: 'accessibility_review',
    exampleTask: 'Run the accessibility audit on the media viewer',
    exampleAsk: 'Audit the notifications screen for WCAG AA compliance',
  },
  pulse: {
    skills: ['performance-review'],
    reviewType: 'code_review',
    exampleTask: 'Profile feed scroll performance on Android',
    exampleAsk: 'Where are our worst render bottlenecks right now?',
  },
  scribe: {
    skills: ['technical-writing'],
    reviewType: 'code_review',
    exampleTask: 'Document the org coordination API',
    exampleAsk: 'Draft the release notes for this sprint',
  },
  sentinel: {
    skills: ['security-audit'],
    reviewType: 'security_review',
    exampleTask: 'Threat-model the OAuth login flow',
    exampleAsk: 'Review the auth flow for token leakage risks',
  },
  lexi: {
    skills: ['lexicon-design'],
    reviewType: 'architecture_review',
    exampleTask: 'Design the lexicon for the new pinned-post feature',
    exampleAsk: 'Is this schema change additive or breaking?',
  },
  vision: {
    skills: ['moderation-tooling'],
    reviewType: 'code_review',
    exampleTask: 'Design the label taxonomy for AI-generated content',
    exampleAsk: 'What queue should ban-evasion reports route to?',
  },
}

const pkgRoot = join(import.meta.dirname, '..')
const outDir = join(pkgRoot, 'docs', 'agents')
mkdirSync(outDir, { recursive: true })

const slugs = readdirSync(join(pkgRoot, 'characters'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort()

for (const slug of slugs) {
  const character = JSON.parse(
    readFileSync(join(pkgRoot, 'characters', `${slug}.json`), 'utf8'),
  ) as CharacterFile
  const meta = AGENT_META[slug]
  if (!meta) {
    throw new Error(`AGENT_META has no entry for "${slug}" — add one so the doc can be generated`)
  }
  const role = character.settings.ORG_ROLE ?? 'unknown'
  const permissions = Object.entries(character.settings)
    .filter(([k, v]) => k.startsWith('ORG_CAN_') && v === 'true')
    .map(([k]) => k.replace('ORG_CAN_', '').toLowerCase().replace(/_/g, ' '))

  const doc = `# ${character.name} — \`${slug}\`

> ${character.bio[0]}

| | |
|---|---|
| **Username** | \`${character.username}\` |
| **Role** | \`${role}\` |
| **Org permissions** | ${permissions.length > 0 ? permissions.join(', ') : '—'} |
| **Skills** | ${meta.skills.map((s) => `[\`${s}\`](../../skills/${s}/SKILL.md)`).join(', ')} |
| **Review type** | \`${meta.reviewType}\` |

${character.bio.slice(1).map((line) => `- ${line}`).join('\n')}

**Expertise:** ${character.topics.join(', ')}

## Knowledge base

${character.knowledge.map((k) => `- [${k.title}](${k.path.replace('../', '../../')})`).join('\n')}

## Commands

All commands run from \`packages/org/\` (or put \`packages/org/bin\` on your
PATH). The server must be running for everything except \`start\`/\`agents\`.

### Run ${character.name}

\`\`\`bash
./bin/org start ${slug}     # boot the agent server as ${character.name} on :2139
./bin/org status            # health + running agent
./bin/org logs 40           # tail the server log
./bin/org stop
\`\`\`

### Talk to ${character.name} (LLM chat — 1–3 min per turn)

\`\`\`bash
./bin/org say "${character.name}, ${meta.exampleAsk}"
\`\`\`

### Board commands involving ${character.name} (instant REST, no LLM)

\`\`\`bash
# Assign work to ${character.name}
./bin/org assign ${slug} "${meta.exampleTask}" --priority high

# Request a review from ${character.name}
./bin/org review ${slug} --type ${meta.reviewType} --task TASK-001

# Progress a task ${character.name} owns
./bin/org task TASK-001 in_progress
./bin/org task TASK-001 done

# Raise a blocker on ${character.name}'s behalf
./bin/org escalate "Blocked on upstream API change" --severity high --task TASK-001

# Board state
./bin/org summary
./bin/org board
\`\`\`

REST equivalents (the CLI is a thin wrapper over these):

\`\`\`bash
curl -s localhost:2139/api/org/summary
curl -s localhost:2139/api/org/board
curl -s -X POST localhost:2139/api/org/tasks \\
  -H 'content-type: application/json' \\
  -d '{"assignee":"${slug}","title":"${meta.exampleTask}","priority":"high"}'
\`\`\`

### Chat actions ${character.name} can trigger

When you chat (via \`org say\` or the dashboard), the planner can route to
these org actions — parameters are extracted from your message:

| Action | Parameters | Example message |
|---|---|---|
| \`ASSIGN_WORK\` | assignee, title, priority?, description?, deadline? | "Assign ${slug === 'nova' ? 'forge' : 'nova'} the search screen, high priority" |
| \`REQUEST_REVIEW\` | reviewer, type?, taskId? | "Request a ${meta.reviewType.replace('_', ' ')} from ${slug === 'sentinel' ? 'prism' : 'sentinel'} on TASK-001" |
| \`ESCALATE\` | description, severity?, taskId? | "Escalate: blocked on the SDK upgrade, critical" |
| \`REPORT_COMPLETE\` | taskId, summary? | "TASK-001 is done — shipped and tested" |
| \`SUMMARIZE\` | — | "Give me the org status" |
`
  writeFileSync(join(outDir, `${slug}.md`), doc)
  console.log(`ok docs/agents/${slug}.md`)
}

// Index page linking every agent doc.
const index = `# NottyBoi Org Agents — Command Reference

One document per agent, generated by \`bun run docs\`
(scripts/generate-agent-docs.ts). Do not edit the generated files by hand.

| Agent | Role | Doc |
|---|---|---|
${slugs
  .map((slug) => {
    const c = JSON.parse(readFileSync(join(pkgRoot, 'characters', `${slug}.json`), 'utf8')) as CharacterFile
    return `| ${c.name} | \`${c.settings.ORG_ROLE ?? 'unknown'}\` | [docs/agents/${slug}.md](agents/${slug}.md) |`
  })
  .join('\n')}

Shared command surface: see any agent doc — the \`org\` CLI
(\`packages/org/bin/org\`) is the entry point for all of them.
`
writeFileSync(join(pkgRoot, 'docs', 'README.md'), index)
console.log(`ok docs/README.md (${slugs.length} agents)`)
