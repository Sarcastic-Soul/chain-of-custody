import { NextResponse } from 'next/server'
import { askAgent } from '@/lib/agent'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const question = typeof body?.question === 'string' ? body.question.trim() : ''

  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  try {
    const result = await askAgent(question)
    return NextResponse.json(result)
  } catch (error) {
    console.error('askAgent failed', error)
    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 })
  }
}
