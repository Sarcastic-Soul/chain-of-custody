import type { CSSProperties } from 'react'
import { readClient } from '@/lib/sanity/client'

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
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const tileStyle: CSSProperties = {
  background: '#14171c',
  border: '1px solid #23272e',
  borderRadius: 8,
  padding: '24px 20px',
  flex: '1 1 200px',
}

const tileLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#9aa0a8',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const tileValueStyle: CSSProperties = {
  fontSize: 40,
  fontWeight: 600,
}

export default async function DashboardPage() {
  const [snapshot, runs] = await Promise.all([
    readClient.fetch<TrustMetricSnapshot | null>(SNAPSHOT_QUERY),
    readClient.fetch<RedTeamRunSummary[]>(RUNS_QUERY),
  ])

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 16px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Trust Dashboard</h1>
      <p style={{ color: '#9aa0a8', marginBottom: 40 }}>
        Live numbers on how often this agent grounds its claims, surfaces contradictions, and survives the red-team suite.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
        <div style={tileStyle}>
          <div style={tileLabelStyle}>Grounding rate</div>
          <div style={tileValueStyle}>{formatPercent(snapshot?.groundingRate)}</div>
        </div>
        <div style={tileStyle}>
          <div style={tileLabelStyle}>Contradiction surface rate</div>
          <div style={tileValueStyle}>{formatPercent(snapshot?.contradictionSurfaceRate)}</div>
        </div>
        <div style={tileStyle}>
          <div style={tileLabelStyle}>Red-team pass rate</div>
          <div style={tileValueStyle}>{formatPercent(snapshot?.redTeamPassRate)}</div>
        </div>
      </div>

      {snapshot?.computedAt && (
        <p style={{ color: '#6b7078', fontSize: 13, marginTop: -32, marginBottom: 40 }}>
          Last computed {formatDate(snapshot.computedAt)}
        </p>
      )}

      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Recent red-team runs</h2>
      {runs.length === 0 ? (
        <p style={{ color: '#9aa0a8' }}>no data yet</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #23272e', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', color: '#9aa0a8', fontWeight: 500 }}>Suite version</th>
              <th style={{ padding: '8px 12px', color: '#9aa0a8', fontWeight: 500 }}>Run at</th>
              <th style={{ padding: '8px 12px', color: '#9aa0a8', fontWeight: 500 }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run, i) => (
              <tr key={`${run.suiteVersion}-${run.runAt}-${i}`} style={{ borderBottom: '1px solid #23272e' }}>
                <td style={{ padding: '8px 12px' }}>{run.suiteVersion}</td>
                <td style={{ padding: '8px 12px' }}>{formatDate(run.runAt)}</td>
                <td style={{ padding: '8px 12px' }}>{formatPercent(run.aggregateScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
