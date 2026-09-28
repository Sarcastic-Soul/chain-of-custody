import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { DEFAULT_MODEL_ID, MODEL_IDS, RETRIEVAL_FALLBACK_MODEL_ID, type ModelId } from './types'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

const ollama = createOpenAICompatible({
  name: 'ollama',
  baseURL: 'https://ollama.com/v1',
  apiKey: process.env.OLLAMA_API_KEY,
})

export function isModelId(value: string): value is ModelId {
  return (MODEL_IDS as readonly string[]).includes(value)
}

export function getModel(modelId: ModelId = DEFAULT_MODEL_ID) {
  return modelId.startsWith('gemini-') ? google(modelId) : ollama(modelId)
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
 * The chosen model first, then the others in UI order. Each model has its own free-tier quota, so
 * when one is used up the next can still answer. Flash-Lite is left out unless it was chosen, since
 * it picks quotes noticeably worse.
 */
export function fallbackChain(modelId: ModelId): ModelId[] {
  return [modelId, ...MODEL_IDS.filter((id) => id !== modelId && id !== RETRIEVAL_FALLBACK_MODEL_ID)]
}
