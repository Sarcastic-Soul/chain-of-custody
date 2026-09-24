import type { ReactNode } from 'react'

export const metadata = {
  title: 'Chain of Custody',
  description: 'An agent that only answers with claims it can trace to an exact quote in a source document.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#0b0d10', color: '#e6e8eb' }}>
        {children}
      </body>
    </html>
  )
}
