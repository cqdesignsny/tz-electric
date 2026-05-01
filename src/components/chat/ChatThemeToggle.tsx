'use client'

import { useChatTheme, type ChatTheme } from './ChatThemeProvider'

/**
 * Light / Dark labeled segmented toggle for the /claire chat page.
 * Both labels are always visible so it's obvious what the control does;
 * the active option is filled in. Click either segment to switch.
 */
export default function ChatThemeToggle() {
  const { theme, setTheme } = useChatTheme()
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-white p-0.5 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <Segment
        label="Light"
        value="light"
        active={theme === 'light'}
        onClick={() => setTheme('light')}
        icon={<SunIcon />}
      />
      <Segment
        label="Dark"
        value="dark"
        active={theme === 'dark'}
        onClick={() => setTheme('dark')}
        icon={<MoonIcon />}
      />
    </div>
  )
}

function Segment({
  label,
  value,
  active,
  onClick,
  icon,
}: {
  label: string
  value: ChatTheme
  active: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      onClick={onClick}
      data-theme-value={value}
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'bg-navy text-white shadow-sm dark:bg-blue-light dark:text-navy'
          : 'text-gray-500 hover:text-navy dark:text-gray-400 dark:hover:text-white',
      ].join(' ')}
    >
      <span aria-hidden className="w-3.5 h-3.5">
        {icon}
      </span>
      {label}
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
