/**
 * Tiny, dependency-free Markdown subset parser for AI recommendation text.
 *
 * It returns plain data (blocks + inline tokens) that React renders as
 * elements. Nothing is ever turned into an HTML string, so AI output can't
 * inject markup or scripts: "<script>" simply appears as literal text.
 *
 * Supported: #/##/### headings, a line that is only **bold** (treated as a
 * heading), - / * / + / • bullets, 1. numbered lists, blank-line separated
 * paragraphs, inline **bold**, *italic* / _italic_ and `code`.
 */

const BULLET = /^\s*(?:[-*+•])\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const BOLD_ONLY = /^\s*(?:\*\*|__)(.+?)(?:\*\*|__)\s*:?\s*$/;

export function parseInline(text) {
  const tokens = [];
  const re = /(\*\*|__)(.+?)\1|(`)([^`]+?)\3|(\*|_)([^*_\s][^*_]*?)\5/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', text: text.slice(last, m.index) });
    if (m[1]) tokens.push({ type: 'strong', text: m[2] });
    else if (m[3]) tokens.push({ type: 'code', text: m[4] });
    else tokens.push({ type: 'em', text: m[6] });
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push({ type: 'text', text: text.slice(last) });
  return tokens.length ? tokens : [{ type: 'text', text: '' }];
}

export function parseMarkdown(input) {
  if (typeof input !== 'string') return [];
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = [];
  let list = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'paragraph', inline: parseInline(para.join(' ').trim()) });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: 'heading', level: Math.min(heading[1].length, 3), inline: parseInline(heading[2]) });
      continue;
    }

    const boldOnly = line.match(BOLD_ONLY);
    if (boldOnly) {
      flushPara();
      flushList();
      blocks.push({ type: 'heading', level: 3, inline: parseInline(boldOnly[1]) });
      continue;
    }

    const bullet = line.match(BULLET);
    const numbered = !bullet && line.match(NUMBERED);
    if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { type: 'list', ordered, items: [] };
      }
      list.items.push(parseInline((bullet || numbered)[1].trim()));
      continue;
    }

    // Indented continuation of the previous list item
    if (list && /^\s{2,}\S/.test(raw)) {
      const lastItem = list.items[list.items.length - 1];
      lastItem.push({ type: 'text', text: ` ${line.trim()}` });
      continue;
    }

    flushList();
    para.push(line.trim());
  }

  flushPara();
  flushList();
  return blocks;
}

/** Score helpers - the backend value is displayed as-is (never rescaled here). */
export function formatWellnessScore(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
