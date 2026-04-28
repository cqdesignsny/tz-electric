'use client'

import { useEffect, useState } from 'react'

type SectionRef = {
  id: string
  number: string
  title: string
}

export default function KnowledgeBaseNav({ sections }: { sections: SectionRef[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -55% 0px', threshold: [0, 1] },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav className="lg:sticky lg:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
      <div className="text-[10px] uppercase tracking-wider font-bold text-blue dark:text-blue-light/80 mb-3">
        Sections
      </div>
      <ul className="space-y-0.5">
        {sections.map((s) => {
          const active = s.id === activeId
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={[
                  'flex items-baseline gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                  active
                    ? 'bg-blue/10 dark:bg-blue-light/15 text-blue dark:text-blue-light font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-light/30 hover:text-navy dark:hover:text-white',
                ].join(' ')}
              >
                {s.number && (
                  <span className="text-[10px] font-mono opacity-60 flex-shrink-0">
                    {s.number}
                  </span>
                )}
                <span className="leading-snug">{s.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
