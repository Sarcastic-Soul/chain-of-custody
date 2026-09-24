import { createMCPClient, type MCPClient } from '@ai-sdk/mcp'
import type { ToolSet } from 'ai'

let clientPromise: Promise<MCPClient> | undefined

/** Connects to Sanity Context MCP once and reuses the connection across calls. */
export function getMcpClient(): Promise<MCPClient> {
  if (!clientPromise) {
    clientPromise = createMCPClient({
      transport: {
        type: 'http',
        url: process.env.SANITY_CONTEXT_MCP_URL!,
        headers: {
          Authorization: `Bearer ${process.env.SANITY_ORGANIZATION_TOKEN}`,
        },
      },
      clientName: 'chain-of-custody-agent',
    })
  }
  return clientPromise
}

/** AI-SDK-compatible tools object exposing 'initial_context' and 'groq_query'. */
export async function getMcpTools(): Promise<ToolSet> {
  const client = await getMcpClient()
  return (await client.tools()) as ToolSet
}
