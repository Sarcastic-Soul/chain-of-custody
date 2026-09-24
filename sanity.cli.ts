import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || 'q0vyljg1',
    dataset: process.env.SANITY_DATASET || 'production',
  },
  studioHost: 'chain-of-custody-devto',
  deployment: {
    appId: 'wlub396dovfebsepbi1s3817',
  },
})
