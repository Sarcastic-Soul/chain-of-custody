export type Stance = 'supports' | 'contradicts'
export type ClaimStatus = 'grounded' | 'contradicted' | 'ungrounded'

/** Ollama Cloud models offered in the UI. Kept here (not models.ts) so the client bundle never pulls in the provider SDK. */
export const MODEL_IDS = ['gpt-oss:120b', 'gemma4:31b'] as const
export type ModelId = (typeof MODEL_IDS)[number]
export const DEFAULT_MODEL_ID: ModelId = 'gpt-oss:120b'
/**
 * Writes the GROQ queries. In side-by-side tests it wrote broader queries than gpt-oss:120b (which
 * often came back nearly empty) and was about twice as fast, but it paraphrases quotes more, so
 * gpt-oss:120b stays the default for picking them.
 */
export const RETRIEVAL_MODEL_ID: ModelId = 'gemma4:31b'
/** Writes the GROQ queries when the retrieval model is at capacity. */
export const RETRIEVAL_FALLBACK_MODEL_ID: ModelId = 'gpt-oss:120b'

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
  /** Model that chose the quotes for this answer. */
  modelId: ModelId
  /** Set when the chosen model was at capacity and another model answered instead. */
  fallbackFrom?: ModelId
  /** Model that wrote the GROQ queries. */
  retrievalModelId: ModelId
  /** Verification pipeline counts, for surfacing the grounding process in the UI. */
  trace: {
    /** Quotes the model proposed from retrieved source documents. */
    candidatesProposed: number
    /** Proposed quotes discarded for not being an exact substring of the cited source document. */
    candidatesRejected: number
    /** Verified quotes kept after the supersedes chain resolution. */
    citationsKept: number
    /** True when every verified quote pointed the same way, so the agent tried to disprove the answer. */
    crossExamined: boolean
    /** Opposite-side quotes the cross-examination found that passed verification. */
    counterQuotesKept: number
  }
}
