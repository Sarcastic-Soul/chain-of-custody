import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID || 'q0vyljg1'
const dataset = process.env.SANITY_DATASET || 'production'
const apiVersion = '2025-01-01'

/** Write-capable client — seeding, and writing claim/quoteEvidence/redTeamRun/trustMetricSnapshot back. Server-side only. */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

/** Read-only public client — Trust Dashboard. No token needed for a public dataset. */
export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})
