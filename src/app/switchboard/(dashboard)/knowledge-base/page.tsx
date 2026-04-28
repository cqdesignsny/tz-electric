import type { Metadata } from 'next'
import Link from 'next/link'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Marked } from 'marked'
import KnowledgeBaseNav from '@/components/switchboard/KnowledgeBaseNav'

export const metadata: Metadata = {
  title: 'Knowledge Base',
}

export const dynamic = 'force-static'

type Section = {
  id: string
  number: string
  title: string
  html: string
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function KnowledgeBasePage() {
  const docPath = join(process.cwd(), 'docs', 'agent-training-answers.md')
  let raw = ''
  let readErr: string | null = null
  try {
    raw = readFileSync(docPath, 'utf-8')
  } catch (e) {
    readErr = e instanceof Error ? e.message : String(e)
  }

  // Strip out the leading frontmatter / preamble (everything before the first `## ` H2).
  const firstH2 = raw.indexOf('\n## ')
  const preamble = firstH2 >= 0 ? raw.slice(0, firstH2).trim() : raw.trim()
  const body = firstH2 >= 0 ? raw.slice(firstH2 + 1) : ''

  // Split into sections at every `## ` heading (top-level sections of the doc).
  const sections: Section[] = []
  const sectionRe = /^## (.+)$/gm
  const matches: { idx: number; title: string }[] = []
  let m: RegExpExecArray | null
  while ((m = sectionRe.exec(body)) !== null) {
    matches.push({ idx: m.index, title: m[1].trim() })
  }
  matches.forEach((match, i) => {
    const start = match.idx
    const end = i + 1 < matches.length ? matches[i + 1].idx : body.length
    const slice = body.slice(start, end).replace(/^## .+\n/, '').trim()
    const numberMatch = match.title.match(/^([\d.]+)\.?\s+(.+)$/)
    const number = numberMatch ? numberMatch[1] : ''
    const title = numberMatch ? numberMatch[2] : match.title
    const id = slugify(`${number ? number + '-' : ''}${title}`)
    const md = new Marked()
    sections.push({ id, number, title, html: md.parse(slice, { async: false }) as string })
  })

  const preambleHtml =
    preamble.length > 0 ? (new Marked()).parse(preamble, { async: false }) as string : ''

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-[1400px] mx-auto w-full">
      <Link
        href="/switchboard"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-4 transition-colors"
      >
        <span aria-hidden>←</span>
        <span>Dashboard</span>
      </Link>

      <header className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
          TZ Switchboard · Source of truth
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          Knowledge Base
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base leading-relaxed">
          Everything Tyler shared in the agent training questionnaire plus the
          v1 best-practice fills. This is what the SMS, voice, and web chat
          agents will load as their system prompt context. v1 is read-only.
          Phase 3 turns this into an in-app editor that commits changes back
          to the file via the GitHub API.
        </p>
      </header>

      {readErr && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load the answers doc</div>
          <code className="text-xs font-mono">{readErr}</code>
        </div>
      )}

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <KnowledgeBaseNav
          sections={sections.map((s) => ({ id: s.id, number: s.number, title: s.title }))}
        />

        <div className="min-w-0">
          {preambleHtml && (
            <div
              className="kb-prose mb-12"
              dangerouslySetInnerHTML={{ __html: preambleHtml }}
            />
          )}

          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 pb-12 mb-12 border-b border-gray-200 dark:border-navy-light/40 last:border-b-0"
            >
              <div className="flex items-baseline gap-3 mb-5 flex-wrap">
                {s.number && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md bg-blue/10 text-blue dark:bg-blue-light/20 dark:text-blue-light font-mono">
                    {s.number}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white">
                  {s.title}
                </h2>
                <a
                  href={`#${s.id}`}
                  className="ml-auto text-xs text-gray-400 dark:text-gray-500 hover:text-blue dark:hover:text-blue-light font-mono transition-colors"
                  aria-label="Anchor link"
                >
                  #
                </a>
              </div>
              <div
                className="kb-prose"
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
            </section>
          ))}
        </div>
      </div>

      <p className="mt-12 text-xs text-gray-400 dark:text-gray-500 max-w-3xl leading-relaxed">
        Want to change something? For now, edit{' '}
        <code className="font-mono">docs/agent-training-answers.md</code> in
        the repo and push. The next deploy will rebuild this page. Phase 3
        adds an in-app editor.
      </p>
    </div>
  )
}
