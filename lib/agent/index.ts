/**
 * Core agent entry point (architecture.md agent flow):
 * query the Knowledge Base via Sanity Context MCP, extract a candidate quote,
 * verify it as an exact substring of sourceDocument.body in code, check supersedes,
 * check for opposing-stance contradictions, and write claim/quoteEvidence back via writeClient.
 */
export { askAgent } from './answer'
export type { AskResult, Citation, Stance, ClaimStatus } from './types'
