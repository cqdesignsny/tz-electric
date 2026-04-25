'use client'

import { useTheme, type Theme } from './ThemeProvider'

type Variant = 'header' | 'inline'

const OPTIONS: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', icon: <SunIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
  { value: 'system', label: 'System', icon: <DisplayIcon /> },
]

export default function ThemeToggle({
  variant = 'header',
  showLabelsOnMobile = false,
}: {
  variant?: Variant
  showLabelsOnMobile?: boolean
}) {
  const { theme, setTheme } = useTheme()

  const containerClasses =
    variant === 'header'
      ? 'inline-flex items-center gap-0.5 p-0.5 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-sm'
      : 'inline-flex items-center gap-0.5 p-0.5 rounded-full bg-gray-100 dark:bg-navy-dark/60 border border-gray-200 dark:border-navy-light/40'

  return (
    <div
      className={containerClasses}
      role="radiogroup"
      aria-label="Color theme"
    >
      {OPTIONS.map((opt) => (
        <ToggleOption
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          isActive={theme === opt.value}
          onClick={() => setTheme(opt.value)}
          variant={variant}
          showLabelOnMobile={showLabelsOnMobile}
        />
      ))}
    </div>
  )
}

function ToggleOption({
  label,
  icon,
  isActive,
  onClick,
  variant,
  showLabelOnMobile,
}: {
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  variant: Variant
  showLabelOnMobile: boolean
}) {
  const activeStyles =
    variant === 'header'
      ? 'bg-white text-navy shadow-sm'
      : 'bg-white dark:bg-blue-light text-navy dark:text-white shadow-sm'
  const idleStyles =
    variant === 'header'
      ? 'text-white/70 hover:text-white'
      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={label}
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all duration-200',
        isActive ? activeStyles : idleStyles,
      ].join(' ')}
    >
      <span aria-hidden className="w-3.5 h-3.5 flex-shrink-0">
        {icon}
      </span>
      <span className={showLabelOnMobile ? '' : 'hidden sm:inline'}>
        {label}
      </span>
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function DisplayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  )
}
