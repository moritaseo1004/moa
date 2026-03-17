import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InlineSpinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />
}
