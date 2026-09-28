export type Stance = 'supports' | 'contradicts'
export type ClaimStatus = 'grounded' | 'contradicted' | 'ungrounded'

/** Gemini models offered in the UI, newest first. Kept here (not geminiModel.ts) so the client bundle never pulls in the Google SDK. */
export const GEMINI_MODEL_IDS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
] as const
export type GeminiModelId = (typeof GEMINI_MODEL_IDS)[number]
export const DEFAULT_GEMINI_MODEL_ID: GeminiModelId = 'gemini-3.6-flash'
/** Writes the GROQ queries. Its free-tier limit is far higher than the flash models', so each question spends exactly one flash call, on choosing quotes. */
export const RETRIEVAL_MODEL_ID: GeminiModelId = 'gemini-3.5-flash-lite'

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
  /** Gemini model that chose the quotes for this answer. */
  modelId: GeminiModelId
  /** Set when the chosen model was at capacity and another flash model answered instead. */
  fallbackFrom?: GeminiModelId
  /** Gemini model that wrote the GROQ queries. */
  retrievalModelId: GeminiModelId
  /** Verification pipeline counts, for surfacing the grounding process in the UI. */
  trace: {
    /** Quotes the model proposed from retrieved source documents. */
    candidatesProposed: number
    /** Proposed quotes discarded for not being an exact substring of the cited source document. */
    candidatesRejected: number
    /** Verified quotes kept after the supersedes chain resolution. */
    citationsKept: number
  }
}
