import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV_LINKS = [
  { href: '/', label: 'Ask' },
  { href: '/dashboard', label: 'Trust Dashboard' },
  { href: '/studio', label: 'Studio' },
]

export function SiteHeader() {
  return (
    <header className="border-border/60 sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ShieldCheck className="size-5 text-primary" strokeWidth={2.25} />
          <span>Chain of Custody</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 md:flex">
            <Badge variant="outline">Sanity Content Lake</Badge>
            <Badge variant="outline">Context MCP</Badge>
            <Badge variant="outline">Gemini</Badge>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex items-center gap-4 overflow-x-auto border-t border-border/60 px-4 py-2 text-sm text-muted-foreground sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 transition-colors hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
