'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, Ban, ExternalLink, GitCompareArrows, History, Loader2, Quote, ShieldAlert } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { VerdictBadge } from '@/components/agent/verdict-badge'
import { VerificationTrace } from '@/components/agent/verification-trace'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { AskResult } from '@/lib/agent/types'

const EXAMPLE_QUESTIONS = [
  'Did Hindenburg accuse Super Micro of accounting manipulation?',
  'Did Ernst & Young resign as Super Micro’s auditor?',
  'Did the Special Committee find evidence of fraud at Super Micro?',
  'Is Super Micro currently delisted from Nasdaq?',
]

export default function Home() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submitQuestion(q: string) {
    const trimmed = q.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })

      const body = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(body?.error || `Request failed (${res.status})`)
      }

      setResult(body as AskResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submitQuestion(question)
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="mb-10 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            An agent that only says what it can prove.
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Ask a factual question. Chain of Custody retrieves source documents from a Sanity Knowledge Base
            through Sanity Context MCP, and answers only with claims it can trace to an exact verbatim quote.
            No sourced quote, no answer &mdash; it refuses instead of guessing.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
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
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about the seeded source documents..."
                    rows={3}
                    className="resize-none text-[15px]"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {EXAMPLE_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setQuestion(q)
                            submitQuestion(q)
                          }}
                          disabled={loading}
                          className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Button type="submit" disabled={loading || !question.trim()}>
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                      {loading ? 'Verifying against sources...' : 'Ask'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <VerdictBadge status={result.status} />
                  </div>

                  <p className="text-[15px] leading-relaxed">{result.answer}</p>

                  {result.supersededNotice && (
                    <p className="flex items-start gap-2 text-sm italic text-muted-foreground">
                      <History className="mt-0.5 size-3.5 shrink-0" />
                      {result.supersededNotice}
                    </p>
                  )}

                  {result.status !== 'ungrounded' && result.citations.length > 0 && (
                    <ul className="flex flex-col gap-3">
                      {result.citations.map((citation, i) => (
                        <li key={i} className="rounded-lg border border-border/60 p-4">
                          <blockquote className="border-l-2 border-primary/50 pl-3 text-[15px] text-foreground/90">
                            &ldquo;{citation.quoteText}&rdquo;
                          </blockquote>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <VerificationTrace result={result} />
          </aside>
        </div>
      </main>
    </div>
  )
}
