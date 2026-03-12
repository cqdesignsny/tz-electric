import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  label?: string
  title: string
  description?: string
  centered?: boolean
  light?: boolean
  className?: string
}

export default function SectionHeader({
  label,
  title,
  description,
  centered = true,
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && 'text-center', 'max-w-3xl', centered && 'mx-auto', 'mb-12', className)}>
      {label && (
        <span className={cn(
          'inline-block text-sm font-semibold uppercase tracking-wider mb-3',
          light ? 'text-sky' : 'text-blue',
        )}>
          {label}
        </span>
      )}
      <h2 className={cn(
        'font-heading font-bold',
        light ? 'text-white' : 'text-navy',
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn(
          'mt-4 text-lg',
          light ? 'text-gray-300' : 'text-gray-600',
        )}>
          {description}
        </p>
      )}
    </div>
  )
}
