import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { DEFAULT_GEMINI_MODEL_ID, GEMINI_MODEL_IDS, RETRIEVAL_MODEL_ID, type GeminiModelId } from './types'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

export function isGeminiModelId(value: string): value is GeminiModelId {
  return (GEMINI_MODEL_IDS as readonly string[]).includes(value)
}

export function getGeminiModel(modelId: GeminiModelId = DEFAULT_GEMINI_MODEL_ID) {
  return google(modelId)
}

const CAPACITY_PATTERN = /quota|rate.?limit|resource_exhausted|high demand|overloaded/i

/** True for quota, rate-limit and overload errors, including the RetryError the AI SDK wraps them in. */
export function isCapacityError(err: unknown): boolean {
  if (!(err instanceof Error)) return CAPACITY_PATTERN.test(String(err))
  const { statusCode, lastError } = err as { statusCode?: number; lastError?: unknown }
  if (statusCode === 429 || statusCode === 503) return true
  if (lastError && lastError !== err && isCapacityError(lastError)) return true
  return CAPACITY_PATTERN.test(err.message)
}

function errorText(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  const { responseBody, lastError } = err as { responseBody?: string; lastError?: unknown }
  const nested = lastError && lastError !== err ? errorText(lastError) : ''
  return `${err.message} ${responseBody ?? ''} ${nested}`
}

/** True when a model's free-tier daily quota is used up, so retrying before the reset only wastes requests. */
export function isDailyQuotaError(err: unknown): boolean {
  return /PerDay/i.test(errorText(err))
}

/**
 * The chosen model first, then the other flash models newest first. Each model has its own
 * free-tier quota, so when one is used up the next can still answer. The retrieval model is left
 * out unless it was chosen, since it picks quotes noticeably worse.
 */
export function fallbackChain(modelId: GeminiModelId): GeminiModelId[] {
  return [modelId, ...GEMINI_MODEL_IDS.filter((id) => id !== modelId && id !== RETRIEVAL_MODEL_ID)]
}
