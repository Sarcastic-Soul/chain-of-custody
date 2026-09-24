import { NextResponse } from 'next/server'
import { askAgent } from '@/lib/agent'
import { isGeminiModelId } from '@/lib/agent/geminiModel'
import { DEFAULT_GEMINI_MODEL_ID } from '@/lib/agent/types'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const question = typeof body?.question === 'string' ? body.question.trim() : ''
  const modelId = typeof body?.model === 'string' && isGeminiModelId(body.model) ? body.model : DEFAULT_GEMINI_MODEL_ID

  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  try {
    const result = await askAgent(question, modelId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('askAgent failed', error)
    const message = error instanceof Error ? error.message : String(error)
    const isCapacityIssue = /quota|rate.?limit|resource_exhausted|high demand|overloaded/i.test(message)

    if (isCapacityIssue) {
      return NextResponse.json(
        { error: 'The model provider is at capacity right now. Wait a few seconds and try again.' },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 })
  }
}
