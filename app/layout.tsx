import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

export const metadata = {
  title: 'Chain of Custody',
  description:
    'An AI agent that only answers with claims traced to an exact verbatim quote in a Sanity-stored source document — and refuses when it cannot find one.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
