export type Stance = 'supports' | 'contradicts'
export type ClaimStatus = 'grounded' | 'contradicted' | 'ungrounded'

export interface Citation {
  sourceDocumentId: string
  sourceTitle: string
  sourceUrl?: string
  quoteText: string
  stance: Stance
  publishedAt: string
}

export interface AskResult {
  question: string
  status: ClaimStatus
  /** Human-readable answer. For contradicted: states the conflict, does not pick a winner. For ungrounded: explicit refusal. */
  answer: string
  citations: Citation[]
  /** Set when a supersedes chain caused an older source to be skipped in favor of a newer one. */
  supersededNotice?: string
  /** id of the `claim` document written for this question. */
  claimId: string
}

/**
 * Core agent entry point (architecture.md agent flow):
 * query the Knowledge Base via Sanity Context MCP, extract a candidate quote,
 * verify it as an exact substring of sourceDocument.body in code, check supersedes,
 * check for opposing-stance contradictions, and write claim/quoteEvidence back via writeClient.
 */
export { askAgent } from './answer'
