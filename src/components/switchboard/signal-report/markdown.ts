// Minimal markdown renderer. Handles only what Signal briefs and recommendations
// produce: headers, paragraphs, bold, italic, inline code, unordered lists,
// ordered lists. Anything richer (tables, blockquotes, fenced code blocks)
// renders as plain text. When we want full fidelity later, swap to react-markdown.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // inline code first so we don't double-escape inside
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-gray-100 dark:bg-white/10 px-1 py-0.5 font-mono text-[0.9em]">$1</code>');
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic (single * not adjacent to a word char on both sides of opening)
  out = out.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>");
  return out;
}

export function renderMarkdown(md: string): string {
  if (!md) return "";
  const lines = md.split(/\r?\n/);
  const out: string[] = [];

  let para: string[] = [];
  let inUl = false;
  let inOl = false;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" ").trim())}</p>`);
      para = [];
    }
  };
  const flushUl = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
  };
  const flushOl = () => {
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };
  const flushAll = () => {
    flushPara();
    flushUl();
    flushOl();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushAll();
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushAll();
      // Bump everything down one level: brief # becomes <h3>, ## becomes <h4>, etc.
      const level = Math.min(6, h[1].length + 2);
      out.push(`<h${level} class="font-semibold tracking-tight mt-4 first:mt-0">${inline(h[2])}</h${level}>`);
      continue;
    }
    const ul = /^[-*]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      flushOl();
      if (!inUl) {
        out.push('<ul class="list-disc pl-6 space-y-1.5">');
        inUl = true;
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    const ol = /^(\d+)\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      flushUl();
      if (!inOl) {
        out.push('<ol class="list-decimal pl-6 space-y-1.5">');
        inOl = true;
      }
      out.push(`<li>${inline(ol[2])}</li>`);
      continue;
    }
    flushUl();
    flushOl();
    para.push(line);
  }
  flushAll();

  return out.join("\n");
}
