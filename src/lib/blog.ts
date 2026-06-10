// ============================================
// TZ ELECTRIC INC - BLOG LOADER
// ============================================
//
// Blog posts are authored as markdown files in `src/content/blog/*.md`,
// each with a small frontmatter block. This loader reads them at build
// time (the blog pages are statically generated), parses the frontmatter,
// and renders the markdown body to HTML with `marked`.
//
// To publish a new post: drop a new `<slug>.md` file into src/content/blog
// following the frontmatter shape below, add its hero image to
// /public/images/blog/<slug>.webp, and redeploy. Nothing else to wire up.
//
//   ---
//   title: "Post Title"
//   description: "One-line meta description for SEO + cards."
//   category: "Mini Splits"          // Mini Splits | Generators | Electrical Safety | ...
//   date: "2026-06-02"               // YYYY-MM-DD, used for ordering + display
//   heroImage: "/images/blog/<slug>.webp"
//   sourceImage: "https://..."       // optional: original source URL (provenance)
//   author: "TZ Electric"
//   ---
//
//   ## First section heading
//   Body markdown...

import fs from 'fs'
import path from 'path'
import { Marked } from 'marked'

export interface BlogPost {
  slug: string
  title: string
  description: string
  category: string
  date: string // ISO YYYY-MM-DD
  heroImage: string
  sourceImage?: string
  author: string
  content: string // raw markdown body
  readingTimeMinutes: number
}

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog')

const marked = new Marked({ gfm: true, breaks: false })

// Parse a simple `key: "value"` frontmatter block. We author every file, so
// the format is controlled: keys are single words, values are single-line and
// double-quoted (an inner quote is escaped as \"). Unquoted values are allowed
// as a fallback.
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }

  const [, frontmatter, body] = match
  const data: Record<string, string> = {}

  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const colon = trimmed.indexOf(':')
    if (colon === -1) continue
    const key = trimmed.slice(0, colon).trim()
    let value = trimmed.slice(colon + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"')
    }
    data[key] = value
  }

  return { data, body: body.trim() }
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

// Read + parse every post once per build. Cached at module scope.
let cachedPosts: BlogPost[] | null = null

function loadPosts(): BlogPost[] {
  if (cachedPosts) return cachedPosts

  let files: string[] = []
  try {
    files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
  } catch {
    // Directory missing (e.g., before any content is added) — no posts yet.
    cachedPosts = []
    return cachedPosts
  }

  const posts: BlogPost[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
    const { data, body } = parseFrontmatter(raw)
    const slug = file.replace(/\.md$/, '')

    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      category: data.category || 'News',
      date: data.date || '1970-01-01',
      heroImage: data.heroImage || `/images/blog/${slug}.webp`,
      sourceImage: data.sourceImage || undefined,
      author: data.author || 'TZ Electric',
      content: body,
      readingTimeMinutes: estimateReadingTime(body),
    }
  })

  // Newest first.
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  cachedPosts = posts
  return posts
}

export function getAllPosts(): BlogPost[] {
  return loadPosts()
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return loadPosts().find((p) => p.slug === slug)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(loadPosts().map((p) => p.category)))
}

// Related posts: same category first, then most recent, excluding self.
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const all = loadPosts()
  const current = all.find((p) => p.slug === slug)
  if (!current) return all.slice(0, limit)

  const sameCategory = all.filter((p) => p.slug !== slug && p.category === current.category)
  const others = all.filter((p) => p.slug !== slug && p.category !== current.category)
  return [...sameCategory, ...others].slice(0, limit)
}

export async function renderMarkdown(markdown: string): Promise<string> {
  return marked.parse(markdown)
}

export function formatPostDate(date: string): string {
  // Parse as a local date (avoid TZ shifting a YYYY-MM-DD back a day).
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return date
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
