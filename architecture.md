# Architecture — Chain of Custody

## Components

1. **Sanity dataset** — holds `sourceDocument`, `claim`, `quoteEvidence`, `redTeamCase`, `redTeamRun`, `trustMetricSnapshot` (see `schema.md`).
2. **Agent (TypeScript/Node)** — connects to the dataset through Sanity Context MCP. On each question:
   - Queries the Knowledge Base for candidate `sourceDocument`s (and any prior `claim`/`quoteEvidence` already extracted).
   - Extracts a candidate quote from the source text.
   - **Verifies the quote is an exact substring** of `sourceDocument.body` before it is allowed into the answer — this check happens in code, not by trusting the model's output.
   - Checks for a `supersedes` chain — if the source has been superseded, prefer the newer document, and say so explicitly rather than silently switching.
   - If two verified quotes on the same claim have opposing `stance`, answer with both, flagged as a contradiction, and write a `claim` with `status: contradicted`.
   - If no exact-match quote can be found, refuses and writes `status: ungrounded`.
3. **Red-team harness (script, run via `npm run redteam`)**:
   - Seeds `redTeamCase` documents (each pointing at a poisoned/adversarial `sourceDocument`) into the dataset.
   - Runs each case's `probeQuestion` through the agent.
   - Compares the agent's actual behavior to `expectedBehavior` and records `passed`.
   - Writes one `redTeamRun` document with all results plus `aggregateScore`.
   - Re-runnable on demand — the score in the submission is reproducible by anyone with the repo and a Sanity project.
4. **Trust Dashboard (small Next.js page, read-only)**:
   - Runs a GROQ query for the latest `trustMetricSnapshot` and the last few `redTeamRun`s.
   - Displays grounding rate, contradiction-surfacing rate, and red-team pass rate as a live, public page — not a static number pasted into a blog post.
   - A background job (or the red-team script itself, on completion) computes and writes a fresh `trustMetricSnapshot`.

## Build order (suggested)

1. Schema first — get `sourceDocument`, `claim`, `quoteEvidence` into Sanity Studio and hand-seed a small set of real source documents (5–10 real articles/filings) plus 2–3 known contradictions.
2. Agent core — exact-substring quote verification is the load-bearing piece; get that solid before anything else.
3. Red-team cases — write the four categories from `schema.md` (`promptInjection`, `fabricatedAuthority`, `staleClaim`, `nearMissQuote`), at least 3–5 cases each.
4. Red-team runner script + `redTeamRun` write-back.
5. Trust Dashboard last — it's a thin read layer over data the rest of the system already produces.

## What to capture for the submission post

- Sanity project ID / public dataset URL (required by the challenge).
- A short demo: ask a grounded question (clean answer + citation), a contradicted question (both quotes shown), an ungrounded question (explicit refusal), and one red-team probe live.
- Link to the Trust Dashboard.
- The `redTeamRun` aggregate score, with an honest note on which categories are weakest — mirroring the "6 of 7" honesty that made Poisoned Pages credible, but backed by a re-runnable suite instead of a single manual pass.
