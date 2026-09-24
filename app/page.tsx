'use client'

import { useState, type FormEvent } from 'react'
import type { AskResult, ClaimStatus } from '@/lib/agent/types'

const STATUS_LABEL: Record<ClaimStatus, string> = {
  grounded: 'Grounded',
  contradicted: 'Contradicted',
  ungrounded: 'Ungrounded',
}

const STATUS_COLOR: Record<ClaimStatus, string> = {
  grounded: '#2ecc71',
  contradicted: '#e6a817',
  ungrounded: '#8a8f98',
}

export default function Home() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = question.trim()
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

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || `Request failed (${res.status})`)
      }

      const data: AskResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Chain of Custody</h1>
      <p style={{ color: '#9aa0a8', marginTop: 0, marginBottom: 32 }}>
        Ask a factual question. The agent only answers with claims traced to an exact quote in a
        stored source document, and refuses when it can&apos;t find one.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          rows={3}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#14171b',
            color: '#e6e8eb',
            border: '1px solid #2a2f36',
            borderRadius: 8,
            padding: 12,
            fontSize: 15,
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            marginTop: 12,
            background: loading ? '#2a2f36' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 15,
            cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </form>

      {error && (
        <p style={{ color: '#f87171', marginTop: 24 }}>Error: {error}</p>
      )}

      {result && (
        <section style={{ marginTop: 32 }}>
          <span
            style={{
              display: 'inline-block',
              background: STATUS_COLOR[result.status],
              color: '#0b0d10',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 999,
              padding: '4px 12px',
              marginBottom: 16,
            }}
          >
            {STATUS_LABEL[result.status]}
          </span>

          <p style={{ fontSize: 17, lineHeight: 1.6 }}>{result.answer}</p>

          {result.supersededNotice && (
            <p style={{ fontSize: 13, color: '#9aa0a8', fontStyle: 'italic' }}>
              {result.supersededNotice}
            </p>
          )}

          {result.status !== 'ungrounded' && result.citations.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 24 }}>
              {result.citations.map((citation, i) => (
                <li
                  key={i}
                  style={{
                    border: '1px solid #2a2f36',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <blockquote
                    style={{
                      margin: 0,
                      marginBottom: 12,
                      paddingLeft: 12,
                      borderLeft: '3px solid #3b82f6',
                      color: '#c9ccd1',
                    }}
                  >
                    &ldquo;{citation.quoteText}&rdquo;
                  </blockquote>
                  <div style={{ fontSize: 13, color: '#9aa0a8', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {citation.sourceUrl ? (
                      <a
                        href={citation.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#3b82f6' }}
                      >
                        {citation.sourceTitle}
                      </a>
                    ) : (
                      <span>{citation.sourceTitle}</span>
                    )}
                    <span>&middot;</span>
                    <span>{citation.stance}</span>
                    <span>&middot;</span>
                    <span>{citation.publishedAt}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}
