import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

export const geminiModel = google('gemini-3.6-flash')
