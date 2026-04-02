import { ImageOff } from 'lucide-react'

interface EmptyStateProps {
  readonly title: string
  readonly description: string
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
        <ImageOff className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    </div>
  )
}
