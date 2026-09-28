import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { DEFAULT_MODEL_ID, MODEL_IDS, type ModelId } from './types'

const ollama = createOpenAICompatible({
  name: 'ollama',
  baseURL: 'https://ollama.com/v1',
  apiKey: process.env.OLLAMA_API_KEY,
})

export function isModelId(value: string): value is ModelId {
  return (MODEL_IDS as readonly string[]).includes(value)
}

export function getModel(modelId: ModelId = DEFAULT_MODEL_ID) {
  return ollama(modelId)
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

/**
 * The chosen model first, then the other one, so an overloaded model doesn't fail the question.
 * Both draw on the same Ollama account usage, so this does not help once that is used up.
 */
export function fallbackChain(modelId: ModelId): ModelId[] {
  return [modelId, ...MODEL_IDS.filter((id) => id !== modelId)]
}
