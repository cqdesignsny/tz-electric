'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import type { RenderedKbSection } from '@/app/switchboard/(dashboard)/knowledge-base/page'

type Props = {
  preambleHtml: string
  sections: RenderedKbSection[]
  canEdit: boolean
}

export default function KnowledgeBaseClient({ preambleHtml, sections, canEdit }: Props) {
  const router = useRouter()
  const [editingPath, setEditingPath] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const grouped = useMemo(() => {
    // Group sections by their H2 parent. The KB structure is shallow:
    // each H2 has zero-or-one _intro section followed by H3 children.
    type Group = { h2Slug: string; intro: RenderedKbSection | null; children: RenderedKbSection[] }
    const map = new Map<string, Group>()
    for (const s of sections) {
      const h2Slug = s.path.split('/')[0]
      const g = map.get(h2Slug) || { h2Slug, intro: null, children: [] }
      if (s.level === 2) g.intro = s
      else g.children.push(s)
      map.set(h2Slug, g)
    }
    return Array.from(map.values())
  }, [sections])

  function openEditor(section: RenderedKbSection) {
    setEditingPath(section.path)
    setEditValue(section.effectiveContent)
    setError(null)
  }

  function cancelEditor() {
    setEditingPath(null)
    setEditValue('')
  }

  function saveEditor(section: RenderedKbSection) {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/switchboard/knowledge-base/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionPath: section.path,
            headingLevel: section.level,
            headingText: section.heading,
            content: editValue,
            baseSnapshot: section.baseContent,
          }),
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error || `Save failed (${res.status})`)
        }
        cancelEditor()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })
  }

  function revertSection(section: RenderedKbSection) {
    if (!confirm(`Revert "${section.heading}" to the base content?`)) return
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/switchboard/knowledge-base/override', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionPath: section.path }),
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error || `Revert failed (${res.status})`)
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })
  }

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8">
      <SectionNav groups={grouped} />

      <div className="min-w-0">
        {preambleHtml && (
          <div
            className="kb-prose mb-12"
            dangerouslySetInnerHTML={{ __html: preambleHtml }}
          />
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
            {error}
          </div>
        )}

        {grouped.map((g) => (
          <div key={g.h2Slug} id={anchorFor(g.h2Slug)} className="scroll-mt-24 mb-10">
            {g.intro && <SectionBlock section={g.intro} canEdit={canEdit}
              isEditing={editingPath === g.intro.path}
              editValue={editValue}
              onEdit={() => openEditor(g.intro!)}
              onCancel={cancelEditor}
              onChange={setEditValue}
              onSave={() => saveEditor(g.intro!)}
              onRevert={() => revertSection(g.intro!)}
              isPending={isPending}
            />}
            {g.children.map((c) => (
              <SectionBlock
                key={c.path}
                section={c}
                canEdit={canEdit}
                isEditing={editingPath === c.path}
                editValue={editValue}
                onEdit={() => openEditor(c)}
                onCancel={cancelEditor}
                onChange={setEditValue}
                onSave={() => saveEditor(c)}
                onRevert={() => revertSection(c)}
                isPending={isPending}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionNav({
  groups,
}: {
  groups: Array<{ h2Slug: string; intro: RenderedKbSection | null; children: RenderedKbSection[] }>
}) {
  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto pr-2 text-sm">
        {groups.map((g) => {
          const heading = g.intro?.heading || g.children[0]?.heading || g.h2Slug
          return (
            <a
              key={g.h2Slug}
              href={`#${anchorFor(g.h2Slug)}`}
              className="block py-1.5 text-gray-600 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light"
            >
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mr-2">
                {g.h2Slug}
              </span>
              {heading.replace(/^\d+(\.\d+)*\.?\s+/, '')}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

function SectionBlock({
  section,
  canEdit,
  isEditing,
  editValue,
  onEdit,
  onCancel,
  onChange,
  onSave,
  onRevert,
  isPending,
}: {
  section: RenderedKbSection
  canEdit: boolean
  isEditing: boolean
  editValue: string
  onEdit: () => void
  onCancel: () => void
  onChange: (v: string) => void
  onSave: () => void
  onRevert: () => void
  isPending: boolean
}) {
  const headingTag = section.level === 2 ? 'h2' : 'h3'
  const HeadingTag = headingTag as 'h2' | 'h3'
  const overridden = !!section.override

  return (
    <section
      id={anchorFor(section.path)}
      className={[
        'scroll-mt-24 pb-8 mb-8 border-b border-gray-200 dark:border-navy-light/40 last:border-b-0',
        overridden ? 'pl-3 border-l-4 border-l-amber-300 dark:border-l-amber-700' : '',
      ].join(' ')}
    >
      <div className="flex items-baseline gap-3 mb-3 flex-wrap">
        <HeadingTag
          className={
            section.level === 2
              ? 'text-2xl md:text-3xl font-bold text-navy dark:text-white'
              : 'text-xl font-bold text-navy dark:text-white'
          }
        >
          {section.heading}
        </HeadingTag>
        <a
          href={`#${anchorFor(section.path)}`}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue dark:hover:text-blue-light font-mono"
          aria-label="Anchor link"
        >
          #
        </a>
        <div className="ml-auto flex items-center gap-2">
          {overridden && (
            <span
              className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300"
              title={`Edited by ${section.override?.edited_by_email} on ${new Date(section.override?.updated_at || '').toLocaleString()}`}
            >
              Edited by {section.override?.edited_by_email.split('@')[0]}
            </span>
          )}
          {canEdit && !isEditing && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="text-xs font-semibold rounded-full border border-gray-300 dark:border-navy-light/60 px-3 py-1 text-navy dark:text-white hover:border-blue hover:text-blue"
              >
                Edit
              </button>
              {overridden && (
                <button
                  type="button"
                  onClick={onRevert}
                  disabled={isPending}
                  className="text-xs font-semibold rounded-full border border-gray-300 dark:border-navy-light/60 px-3 py-1 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  Revert
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            rows={Math.min(24, Math.max(6, editValue.split('\n').length + 2))}
            className="w-full rounded-xl border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0A1128] px-3 py-3 text-sm text-navy dark:text-white font-mono leading-relaxed focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isPending}
              className="rounded-full bg-blue px-5 py-2 text-sm font-bold text-white hover:bg-blue-dark disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save override'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="rounded-full border border-gray-300 dark:border-navy-light/60 px-5 py-2 text-sm font-semibold text-navy dark:text-white hover:border-blue disabled:opacity-50"
            >
              Cancel
            </button>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              Markdown. Tyler-authored overrides always win on render and in agent prompts.
            </span>
          </div>
        </div>
      ) : (
        <div
          className="kb-prose"
          dangerouslySetInnerHTML={{ __html: section.effectiveHtml }}
        />
      )}
    </section>
  )
}

function anchorFor(path: string): string {
  return `kb-${path.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
}
