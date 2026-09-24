import { CircleCheck, CircleSlash, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ClaimStatus } from '@/lib/agent/types'

const CONFIG: Record<ClaimStatus, { label: string; icon: typeof CircleCheck; className: string }> = {
  grounded: {
    label: 'Grounded',
    icon: CircleCheck,
    className: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  contradicted: {
    label: 'Contradicted',
    icon: TriangleAlert,
    className: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  ungrounded: {
    label: 'Ungrounded',
    icon: CircleSlash,
    className: 'border-transparent bg-muted text-muted-foreground',
  },
}

export function VerdictBadge({ status, className }: { status: ClaimStatus; className?: string }) {
  const { label, icon: Icon, className: variantClassName } = CONFIG[status]
  return (
    <Badge className={cn('h-6 gap-1.5 px-2.5 text-[13px]', variantClassName, className)}>
      <Icon className="size-3.5" />
      {label}
    </Badge>
  )
}
