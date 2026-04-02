interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg'
  readonly className?: string
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-text-muted border-t-accent-primary ${sizes[size]} ${className}`}
      role="status"
      aria-label="加载中"
    />
  )
}
