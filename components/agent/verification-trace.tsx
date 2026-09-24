import { Ban, GitCompareArrows, History, Quote, Search, ShieldCheck, ShieldX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { VerdictBadge } from '@/components/agent/verdict-badge'
import type { AskResult } from '@/lib/agent/types'

const GUARDRAILS = [
  {
    icon: Quote,
    text: 'Every quote must be an exact, verbatim substring of a stored source document — checked in code, not asserted by the model.',
  },
  {
    icon: Ban,
    text: 'No verified quote survives verification → explicit refusal. The agent never guesses to fill a gap.',
  },
  {
    icon: GitCompareArrows,
    text: 'Quotes on both sides of a question are shown as a surfaced contradiction, never silently resolved for you.',
  },
  {
    icon: History,
    text: 'When a source is superseded by a newer one, only the newest version’s quotes count toward the answer.',
  },
]

function TraceRow({
  icon: Icon,
  label,
  detail,
  tone = 'default',
}: {
  icon: typeof Search
  label: string
  detail: string
  tone?: 'default' | 'good' | 'bad'
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ' +
          (tone === 'good'
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : tone === 'bad'
              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
              : 'bg-muted text-muted-foreground')
        }
      >
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-sm text-muted-foreground leading-snug">{detail}</p>
      </div>
    </div>
  )
}

export function VerificationTrace({ result }: { result: AskResult | null }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" />
            Guardrails
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3.5">
          {GUARDRAILS.map((rule) => (
            <div key={rule.text} className="flex items-start gap-3">
              <rule.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground leading-snug">{rule.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="size-4 text-primary" />
            Verification trace
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!result ? (
            <p className="text-sm text-muted-foreground">
              Ask a question to see the retrieval and verification pipeline run, step by step.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <TraceRow
                icon={Search}
                label="Queried Sanity Context MCP"
                detail={`groq_query against sourceDocument, narrowed to the question's keywords.`}
              />
              <Separator />
              <TraceRow
                icon={Quote}
                label={`${result.trace.candidatesProposed} quote${result.trace.candidatesProposed === 1 ? '' : 's'} proposed`}
                detail="Candidate quotes the model claims it copied verbatim from retrieved documents."
              />
              <Separator />
              {result.trace.candidatesRejected > 0 ? (
                <TraceRow
                  icon={ShieldX}
                  tone="bad"
                  label={`${result.trace.candidatesRejected} rejected`}
                  detail="Discarded — not an exact substring of the cited source document's body."
                  key="rejected"
                />
              ) : (
                <TraceRow
                  icon={ShieldCheck}
                  tone="good"
                  label="0 rejected"
                  detail="Every proposed quote matched its source exactly."
                />
              )}
              {result.trace.citationsKept > 0 && (
                <>
                  <Separator />
                  <TraceRow
                    icon={ShieldCheck}
                    tone="good"
                    label={`${result.trace.citationsKept} verified quote${result.trace.citationsKept === 1 ? '' : 's'} kept`}
                    detail="Passed exact-match verification and the supersedes check."
                  />
                </>
              )}
              {result.supersededNotice && (
                <>
                  <Separator />
                  <TraceRow icon={History} label="Superseded source skipped" detail={result.supersededNotice} />
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Verdict</span>
                <VerdictBadge status={result.status} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Model</span>
                <span className="text-sm text-muted-foreground">{result.modelId}</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Written to Sanity as claim <code className="text-[11px]">{result.claimId}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
