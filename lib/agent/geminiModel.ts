import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { DEFAULT_GEMINI_MODEL_ID, GEMINI_MODEL_IDS, type GeminiModelId } from './types'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

export function isGeminiModelId(value: string): value is GeminiModelId {
  return (GEMINI_MODEL_IDS as readonly string[]).includes(value)
}

export function getGeminiModel(modelId: GeminiModelId = DEFAULT_GEMINI_MODEL_ID) {
  return google(modelId)
}
