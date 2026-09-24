import { GitCompareArrows, ShieldCheck, Swords } from 'lucide-react'
import { readClient } from '@/lib/sanity/client'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const revalidate = 60

interface TrustMetricSnapshot {
  computedAt: string
  groundingRate: number
  contradictionSurfaceRate: number
  redTeamPassRate: number
}

interface RedTeamRunSummary {
  suiteVersion: string
  runAt: string
  aggregateScore: number
}

const SNAPSHOT_QUERY = `*[_type == "trustMetricSnapshot"] | order(computedAt desc)[0]{computedAt, groundingRate, contradictionSurfaceRate, redTeamPassRate}`
const RUNS_QUERY = `*[_type == "redTeamRun"] | order(runAt desc)[0...5]{suiteVersion, runAt, aggregateScore}`

function formatPercent(value: number | undefined): string {
  if (value === undefined || value === null) return 'no data yet'
  return `${Math.round(value * 100)}%`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const TILES = [
  { key: 'groundingRate', label: 'Grounding rate', icon: ShieldCheck },
  { key: 'contradictionSurfaceRate', label: 'Contradiction surface rate', icon: GitCompareArrows },
  { key: 'redTeamPassRate', label: 'Red-team pass rate', icon: Swords },
] as const

export default async function DashboardPage() {
  const [snapshot, runs] = await Promise.all([
    readClient.fetch<TrustMetricSnapshot | null>(SNAPSHOT_QUERY),
    readClient.fetch<RedTeamRunSummary[]>(RUNS_QUERY),
  ])

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Trust Dashboard</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live numbers on how often this agent grounds its claims, surfaces contradictions instead of
          resolving them silently, and survives a repeatable red-team suite of poisoned and adversarial
          source documents.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TILES.map((tile) => (
            <Card key={tile.key}>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <tile.icon className="size-4" />
                  {tile.label}
                </div>
                <div className="mt-2 text-4xl font-semibold tracking-tight">
                  {formatPercent(snapshot?.[tile.key])}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {snapshot?.computedAt && (
          <p className="mt-3 text-xs text-muted-foreground">Last computed {formatDate(snapshot.computedAt)}</p>
        )}

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Recent red-team runs</CardTitle>
          </CardHeader>
          <CardContent>
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">no data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Suite version</th>
                      <th className="px-3 py-2 font-medium">Run at</th>
                      <th className="px-3 py-2 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run, i) => (
                      <tr key={`${run.suiteVersion}-${run.runAt}-${i}`} className="border-b border-border/40">
                        <td className="px-3 py-2">
                          <Badge variant="outline">{run.suiteVersion}</Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{formatDate(run.runAt)}</td>
                        <td className="px-3 py-2 font-medium">{formatPercent(run.aggregateScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
