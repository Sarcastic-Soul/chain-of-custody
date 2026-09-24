# Sanity content schema — Chain of Custody

## `sourceDocument`
The raw material the agent is allowed to quote from.
- `title` (string)
- `body` (text — plain text, not portable text, so exact-substring quote matching is unambiguous)
- `url` (url, optional — public source link)
- `documentType` (string, enum: `article`, `filing`, `transcript`, `officialStatement`)
- `publishedAt` (datetime)
- `supersedes` (reference to another `sourceDocument`, optional — marks this as a correction/update of an older document)
- `contentHash` (string — sha256 of `body`, set on publish, used to detect tampering between ingestion and query time)
- `verified` (boolean — human-reviewed as a legitimate source, vs. seeded red-team material)

## `claim`
A question/topic the agent has been asked about, kept so repeated questions reuse prior grounding work.
- `question` (string)
- `evidence` (array of references to `quoteEvidence`)
- `status` (string, enum: `grounded`, `contradicted`, `ungrounded`)

## `quoteEvidence`
One verified exact quote backing (or contradicting) a claim.
- `claim` (reference to `claim`)
- `sourceDocument` (reference to `sourceDocument`)
- `quoteText` (string — must be an exact substring of the referenced `sourceDocument.body`; verified programmatically before this document is written)
- `stance` (string, enum: `supports`, `contradicts`)
- `extractedAt` (datetime)

## `redTeamCase`
One adversarial test case in the repeatable suite.
- `caseId` (string, unique slug)
- `category` (string, enum: `promptInjection`, `fabricatedAuthority`, `staleClaim`, `nearMissQuote`)
- `seedDocument` (reference to `sourceDocument` — the poisoned/adversarial document used for this case)
- `probeQuestion` (string — the question asked to trigger the case)
- `expectedBehavior` (string, enum: `refuse`, `flagContradiction`, `preferNewerSource`, `rejectNearMissQuote`)
- `description` (text)

## `redTeamRun`
One execution of the full suite (re-run on every submission update, so the score is always fresh, not a one-time claim).
- `suiteVersion` (string)
- `runAt` (datetime)
- `results` (array of objects: `{ caseId (reference), passed (boolean), agentResponse (text) }`)
- `aggregateScore` (number — `passed` count / total cases)

## `trustMetricSnapshot`
Periodic rollup the public Trust Dashboard reads.
- `computedAt` (datetime)
- `groundingRate` (number — fraction of answered claims backed by a verified quote)
- `contradictionSurfaceRate` (number — fraction of detected contradictions actually surfaced to the user, vs. silently resolved)
- `redTeamPassRate` (number — pulled from the latest `redTeamRun.aggregateScore`)

## Why this shape

- `quoteEvidence` is a separate document type from `claim`, not an inline array, so each quote's verification (exact substring match against `sourceDocument.body`) can be checked and re-checked independently — a claim's grounding status is a derived read, not something that can silently drift out of sync with its sources.
- `redTeamCase` and `redTeamRun` are separated (definition vs. execution) so the suite is versioned and re-runnable — this is what makes the pass rate a live, reproducible number instead of a one-time blog-post claim.
- `supersedes` on `sourceDocument` gives the agent an explicit signal for "this document replaces that one," which is what lets it prefer corrected sources over stale ones without guessing from timestamps alone.
