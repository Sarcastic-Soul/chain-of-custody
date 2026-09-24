'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  ArrowUp,
  Ban,
  ExternalLink,
  GitCompareArrows,
  History,
  Loader2,
  Quote,
  ShieldAlert,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { VerdictBadge } from '@/components/agent/verdict-badge'
import { VerificationTrace } from '@/components/agent/verification-trace'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_GEMINI_MODEL_ID, GEMINI_MODEL_IDS, type AskResult, type GeminiModelId } from '@/lib/agent/types'

const MODEL_LABELS: Record<GeminiModelId, string> = {
  'gemini-3.8-flash': 'Gemini 3.8 Flash',
  'gemini-3.7-flash': 'Gemini 3.7 Flash',
  'gemini-3.6-flash': 'Gemini 3.6 Flash (fastest)',
  'gemini-3.5-flash': 'Gemini 3.5 Flash',
}

const EXAMPLE_QUESTIONS = [
  'Did Hindenburg accuse Super Micro of accounting manipulation?',
  'Did Ernst & Young resign as Super Micro’s auditor?',
  'Did the Special Committee find evidence of fraud at Super Micro?',
  'Is Super Micro currently delisted from Nasdaq?',
]

interface ChatTurn {
  id: string
  question: string
  status: 'pending' | 'done' | 'error'
  result?: AskResult
  error?: string
}

function AnswerBubble({ result }: { result: AskResult }) {
  return (
    <div className="max-w-[85%] rounded-2xl border border-border/60 bg-card px-4 py-3.5">
      <div className="mb-2">
        <VerdictBadge status={result.status} />
      </div>
      <p className="text-[15px] leading-relaxed">{result.answer}</p>

      {result.supersededNotice && (
        <p className="mt-2 flex items-start gap-2 text-sm italic text-muted-foreground">
          <History className="mt-0.5 size-3.5 shrink-0" />
          {result.supersededNotice}
        </p>
      )}

      {result.status !== 'ungrounded' && result.citations.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2.5">
          {result.citations.map((citation, i) => (
            <li key={i} className="rounded-lg border border-border/60 bg-background/40 p-3">
              <blockquote className="border-l-2 border-primary/50 pl-3 text-sm text-foreground/90">
                &ldquo;{citation.quoteText}&rdquo;
              </blockquote>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {citation.sourceUrl ? (
                  <a
                    href={citation.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {citation.sourceTitle}
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <span>{citation.sourceTitle}</span>
                )}
                <span>&middot;</span>
                <span className="capitalize">{citation.stance}</span>
                <span>&middot;</span>
                <span>{citation.publishedAt.slice(0, 10)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Home() {
  const [question, setQuestion] = useState('')
  const [modelId, setModelId] = useState<GeminiModelId>(DEFAULT_GEMINI_MODEL_ID)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const loading = turns.some((t) => t.status === 'pending')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns])

  const lastResult = [...turns].reverse().find((t) => t.result)?.result ?? null

  async function submitQuestion(q: string) {
    const trimmed = q.trim()
    if (!trimmed || loading) return

    const id = crypto.randomUUID()
    setTurns((prev) => [...prev, { id, question: trimmed, status: 'pending' }])
    setQuestion('')

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, model: modelId }),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(body?.error || `Request failed (${res.status})`)
      }

      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'done', result: body as AskResult } : t)))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'error', error: message } : t)))
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitQuestion(question)
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <SiteHeader />

      <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {turns.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="max-w-xl">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    An agent that only says what it can prove.
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Ask a factual question. Chain of Custody retrieves source documents from a Sanity Knowledge
                    Base through Sanity Context MCP and answers only with claims traced to an exact verbatim
                    quote &mdash; no sourced quote, no answer.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1">
                    <Quote className="size-3.5" /> Verbatim quotes only
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1">
                    <Ban className="size-3.5" /> Refuses when ungrounded
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1">
                    <GitCompareArrows className="size-3.5" /> Surfaces contradictions
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1">
                    <History className="size-3.5" /> Newest source wins staleness
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {EXAMPLE_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submitQuestion(q)}
                      className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-2">
                {turns.map((turn) => (
                  <div key={turn.id} className="flex flex-col gap-3">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-[15px] text-primary-foreground">
                        {turn.question}
                      </div>
                    </div>

                    {turn.status === 'pending' && (
                      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Verifying against sources...
                      </div>
                    )}

                    {turn.status === 'error' && (
                      <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                        {turn.error}
                      </div>
                    )}

                    {turn.status === 'done' && turn.result && <AnswerBubble result={turn.result} />}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border/60 bg-background pt-3">
            <div className="mb-2 flex items-center justify-end">
              <Select value={modelId} onValueChange={(value) => setModelId(value as GeminiModelId)}>
                <SelectTrigger size="sm" className="h-7 w-auto gap-1.5 border-none bg-transparent px-2 text-xs text-muted-foreground shadow-none hover:bg-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {GEMINI_MODEL_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {MODEL_LABELS[id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {turns.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => submitQuestion(q)}
                    disabled={loading}
                    className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitQuestion(question)
              }}
              className="flex items-end gap-2 rounded-2xl border border-border/60 bg-card p-2"
            >
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question... (Enter to send, Shift+Enter for a new line)"
                rows={1}
                className="max-h-40 min-h-9 resize-none border-none bg-transparent px-2 py-1.5 text-[15px] shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
              <Button type="submit" size="icon" disabled={loading || !question.trim()} className="shrink-0">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
              </Button>
            </form>
          </div>
        </div>

        <aside className="hidden min-h-0 overflow-y-auto lg:block">
          <VerificationTrace result={lastResult} />
        </aside>
      </div>
    </div>
  )
}
