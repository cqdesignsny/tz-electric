'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

/**
 * Theme system for the public-facing /claire chat page. Independent of the
 * TZ Switchboard theme so a public visitor's preference doesn't leak into
 * the staff dashboard, and vice versa.
 *
 * Two explicit states (light / dark) plus an implicit system fallback on
 * first visit. Once the user clicks the toggle we persist their choice so
 * it sticks across visits.
 */

export type ChatTheme = 'light' | 'dark'

const STORAGE_KEY = 'tz-claire-theme'

type ChatThemeContextValue = {
  theme: ChatTheme
  setTheme: (next: ChatTheme) => void
  toggle: () => void
}

const ChatThemeContext = createContext<ChatThemeContextValue | null>(null)

export function useChatTheme(): ChatThemeContextValue {
  const ctx = useContext(ChatThemeContext)
  if (!ctx) {
    throw new Error('useChatTheme must be used inside ChatThemeProvider')
  }
  return ctx
}

function readInitialTheme(): ChatTheme {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ChatThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] = useState<ChatTheme>('light')

  // Load actual initial theme post-mount. SSR always renders 'light' to
  // avoid hydration mismatch; the inline init script (chatThemeInitScript)
  // sets data-theme on documentElement before paint so visually we never
  // flash.
  useEffect(() => {
    setThemeState(readInitialTheme())
  }, [])

  // Mirror the resolved theme onto documentElement so descendant CSS
  // variants (Tailwind dark:, our @custom-variant) apply globally to the
  // page without remount.
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
    return () => {
      // When the chat unmounts (route change away), strip the attribute so
      // we don't pollute the rest of the public site.
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  // React to system changes only when the user has not explicitly picked.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    if (stored === 'light' || stored === 'dark') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setThemeState(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: ChatTheme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore quota errors
    }
  }, [])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: ChatTheme = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return (
    <ChatThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ChatThemeContext.Provider>
  )
}

/**
 * Inline script that runs before React hydrates. Reads the saved
 * preference (or falls back to system) and sets data-theme on
 * documentElement so the first paint is correct.
 */
export const chatThemeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
