# Why this beats the current top Path One submissions

Comparison against the three 9/10-scored Path One posts found when scoring current submissions at https://dev.to/t/sanitychallenge/latest.

| Competitor | Strength | What Chain of Custody does differently |
|---|---|---|
| **Poisoned Pages** — https://dev.to/rudratosh/sanitys-knowledge-base-stopped-6-of-7-poisoned-pages-the-7th-fooled-claude-opus-5-4fhp | Manual prompt-injection test, 6/7 attacks blocked, honest about the failure | Same idea, systematized: `redTeamCase` + `redTeamRun` make it a versioned, re-runnable suite with a published, reproducible score — not a one-time test a judge has to take on faith |
| **TSB Oracle** — https://dev.to/chanadev/i-made-my-agent-prove-every-quote-against-the-source-document-1700 | Verifies quotes against source, deliberately withholds contradictions to force reasoning | Same exact-substring verification (`quoteEvidence`), plus the `supersedes` field so the agent can distinguish "unresolved contradiction" from "one source is simply outdated" |
| **Tell Me More** — https://dev.to/sword_luan_6dfb4e81cf5f15/tell-me-more-an-agent-that-queries-your-past-without-letting-hindsight-rewrite-it-2f0n | Longitudinal correctness over a real 126-document dataset, 63 tests, live demo | Chain of Custody's domain (journalism/research) is externally verifiable by anyone, not just the agent's own owner — judges can check the sources themselves |

## The one thing none of the three have

A **public, live Trust Dashboard** that queries the agent's own historical performance (`trustMetricSnapshot`) via Sanity Context MCP and displays it as a running artifact. All three competitors report a number once, in the blog post, at submission time. This project's reliability score stays queryable and re-computable after submission — closer to how a real production system would be judged.

## Judging criteria fit

The challenge's stated Path One criteria are "meaningful Sanity Context use" and "knowledge base implementation." Both are hard to fake here because:
- Quote verification is checked in code against `sourceDocument.body`, not asserted by the model.
- The red-team score is computed from a re-runnable suite, not a claim.
- The Knowledge Base itself (`sourceDocument`, `supersedes`, `contentHash`) is the mechanism that makes staleness and tampering detectable, not an afterthought bolted onto a generic RAG setup.
