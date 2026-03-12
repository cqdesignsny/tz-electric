import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  href?: string
  className?: string
  hover?: boolean
}

export default function Card({ children, href, className, hover = true }: CardProps) {
  const styles = cn(
    'bg-white rounded-xl border border-gray-100 overflow-hidden',
    hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
    className,
  )

  if (href) {
    return (
      <Link href={href} className={cn(styles, 'block')}>
        {children}
      </Link>
    )
  }

  return <div className={styles}>{children}</div>
}
