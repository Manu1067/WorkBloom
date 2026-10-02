import { parseMarkdown } from '../../utils/safeMarkdown';

function Inline({ tokens }) {
  return tokens.map((t, i) => {
    if (t.type === 'strong') return <strong key={i}>{t.text}</strong>;
    if (t.type === 'em') return <em key={i}>{t.text}</em>;
    if (t.type === 'code') {
      return (
        <code key={i} style={{ background: 'hsl(var(--paper-warm))', padding: '1px 5px', borderRadius: 4, fontSize: '0.92em' }}>
          {t.text}
        </code>
      );
    }
    return <span key={i}>{t.text}</span>;
  });
}

/**
 * Renders the AI recommendation text as readable headings, paragraphs and
 * bullet lists. Content is exactly what the workflow returned; only its
 * presentation changes. Built from React elements - no dangerouslySetInnerHTML.
 */
export function AiRecommendation({ text }) {
  const blocks = parseMarkdown(text);
  if (blocks.length === 0) return null;

  return (
    <div className="ai-recommendation" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'hsl(var(--ink))', overflowWrap: 'anywhere' }}>
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          return (
            <h3
              key={i}
              style={{
                margin: i === 0 ? '0 0 6px' : '18px 0 6px',
                fontSize: b.level === 1 ? 18 : 15.5,
                color: 'hsl(var(--sage-dark))',
                fontWeight: 700,
              }}
            >
              <Inline tokens={b.inline} />
            </h3>
          );
        }
        if (b.type === 'list') {
          const Tag = b.ordered ? 'ol' : 'ul';
          return (
            <Tag key={i} style={{ margin: '4px 0 10px', paddingLeft: 22 }}>
              {b.items.map((item, j) => (
                <li key={j} style={{ margin: '4px 0' }}>
                  <Inline tokens={item} />
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={i} style={{ margin: '0 0 10px' }}>
            <Inline tokens={b.inline} />
          </p>
        );
      })}
    </div>
  );
}

export default AiRecommendation;
