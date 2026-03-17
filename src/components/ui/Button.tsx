'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'emergency'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  external?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue text-white hover:bg-blue-dark shadow-md hover:shadow-xl hover:scale-[1.02]',
  secondary:
    'bg-navy text-white hover:bg-navy-light shadow-md hover:shadow-xl hover:scale-[1.02]',
  outline:
    'border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm',
  ghost:
    'text-navy hover:bg-gray-100',
  emergency:
    'bg-warning text-white hover:bg-amber-600 shadow-md hover:shadow-xl hover:scale-[1.02]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-7 py-3.5 text-base',
  lg: 'px-10 py-4.5 text-lg tracking-wide',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className,
  type = 'button',
  disabled = false,
  external = false,
}: ButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-full',
    'transition-all duration-300 ease-out cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    className,
  )

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={baseStyles}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={baseStyles}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseStyles}>
      {children}
    </button>
  )
}
