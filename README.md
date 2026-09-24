# Chain of Custody

An AI agent for journalists, researchers, and fact-checkers that answers questions **only** with claims traced to an exact verbatim quote in a source document stored in Sanity. It queries content through Sanity Context MCP, refuses to answer when evidence is missing, surfaces (never silently resolves) contradictions between sources, prefers newer corrected sources over superseded ones, and ships with a repeatable red-team test suite whose pass rate is published on a public Trust Dashboard.

Built for the [DEV/Sanity 2026 hackathon](https://dev.to/challenges/sanity-2026-09-16), Path One track.

See `overview.md`, `architecture.md`, `schema.md`, and `why-it-wins.md` for the original design docs.

## How it works

1. A question comes in (`/` or `POST /api/ask`).
2. The agent calls Sanity Context MCP's `groq_query` tool to pull candidate `sourceDocument` records from the dataset.
3. It proposes candidate quotes via a structured tool call (`proposeCandidates`) — every quote is supposed to be copied verbatim from a document's `body` field.
4. **The candidate quotes are never trusted.** Server-side code independently re-fetches each cited `sourceDocument` and checks the quote is an exact substring of its `body`. Anything that doesn't match exactly is discarded.
5. Verified quotes are grouped by `supersedes` chain. If a chain has quotes from more than one document, only the newest document's quotes are kept, and a `supersededNotice` explains what was dropped.
6. If quotes exist on both sides of the question, the answer is `contradicted` and both are shown. If only one side has quotes, it's `grounded`. If nothing verifies, it's `ungrounded` and the agent explicitly refuses.
7. Every answer is written back to Sanity as a `claim` + `quoteEvidence` pair, so the whole run is auditable in Studio.

## Stack

- Next.js 15 (App Router) + TypeScript, pnpm
- Sanity (schema + Studio, embedded at `/studio`) — content lives in a `sourceDocument` / `claim` / `quoteEvidence` / `redTeamCase` / `redTeamRun` / `trustMetricSnapshot` schema (`schema.md`)
- [Sanity Context MCP](https://www.sanity.io/docs/ai/sanity-context-mcp) in **dataset (GROQ) mode**, so the agent gets documents back verbatim rather than AI-summarized — required for exact-substring verification to mean anything. A Knowledge Base is also attached to the same endpoint to satisfy the challenge's "backed by a Knowledge Base" requirement; GROQ mode wins when both sources are present.
- Vercel AI SDK (`ai`, `@ai-sdk/mcp`, `@ai-sdk/groq`) for the tool-calling loop
- Groq (`openai/gpt-oss-120b`) as the model provider

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in the values below
pnpm seed                    # 5 real, verbatim-quoted source documents (SMCI/Hindenburg case)
pnpm seed:redteam            # 15 adversarial fixtures + 12 red-team cases across 4 categories
pnpm dev                     # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Where to get it |
|---|---|
| `SANITY_PROJECT_ID`, `SANITY_DATASET` | Sanity manage dashboard |
| `SANITY_API_TOKEN` | Project API token, Developer/Editor role (read+write) — used for seeding and for the agent's write-back |
| `SANITY_CONTEXT_MCP_URL` | Sanity Dashboard → org → Context app → MCP endpoint URL |
| `SANITY_ORGANIZATION_TOKEN` | Org-level token with "Context Viewer" permission, plus a project-level role grant for this project |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |

The Sanity Context MCP endpoint requires a **deployed Studio (v5.1.0+)** on the dataset for GROQ/dataset-source mode to work (`npx sanity deploy`).

## Scripts

| Command | What it does |
|---|---|
| `pnpm seed` | Seeds 5 real source documents (SEC filings, Hindenburg report, company statements) with sha256 `contentHash`, forming a real `supersedes` chain and a real contradiction pair |
| `pnpm seed:redteam` | Seeds 15 poisoned/adversarial fixtures and 12 `redTeamCase` probes (3 each: prompt injection, fabricated authority, stale claims, near-miss quotes) |
| `pnpm redteam` | Runs every `redTeamCase` through the live agent, scores pass/fail against `expectedBehavior`, writes a `redTeamRun` + `trustMetricSnapshot` back to Sanity |
| `pnpm typecheck` | `tsc --noEmit` |

## Pages

- `/` — ask the agent a question, see the verdict (grounded / contradicted / ungrounded), citations, and any supersession notice
- `/studio` — embedded Sanity Studio
- `/dashboard` — Trust Dashboard: latest `trustMetricSnapshot` (grounding rate, contradiction-surfacing rate, red-team pass rate) plus recent `redTeamRun`s

## Known constraint

The Groq API key used here is on the free tier (8000 tokens/minute, shared across models). A single agent turn — dataset query + full document bodies + tool-calling overhead — runs close to that ceiling, so back-to-back questions can hit `429`s and retry with backoff (the AI SDK respects Groq's `retry-after`). `pnpm redteam` paces itself (one case at a time, 15s between cases) to stay under the limit for a full run.
