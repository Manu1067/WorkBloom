import { useState } from 'react';

/**
 * Dependency-free, responsive charts for the Analytics page.
 *
 * Everything drawn is derived from the numbers passed in (real API
 * aggregates). Percentages are computed from those counts; nothing is
 * estimated, smoothed or invented, and no chart implies a time trend.
 */

// Forest green, coral, sage, gold and earthy neutrals from the WorkBloom palette
export const CHART_COLORS = [
  'hsl(152 34% 28%)',
  'hsl(14 62% 66%)',
  'hsl(143 22% 56%)',
  'hsl(38 70% 58%)',
  'hsl(200 28% 50%)',
  'hsl(28 30% 48%)',
  'hsl(160 20% 72%)',
  'hsl(350 40% 62%)',
];

const fmt = (n) => Number(n).toLocaleString();

/** Normalises {label: count} into [{label, value}] with valid numbers only. */
export function toSeries(obj, { sort = true } = {}) {
  if (!obj || typeof obj !== 'object') return [];
  const rows = Object.entries(obj)
    .map(([label, value]) => ({ label, value: Number(value) }))
    .filter((r) => Number.isFinite(r.value) && r.value >= 0);
  return sort ? rows.sort((a, b) => b.value - a.value) : rows;
}

export function ChartEmpty({ message = 'No data recorded yet.' }) {
  return (
    <div style={{ padding: '26px 12px', textAlign: 'center', fontSize: 13, color: 'hsl(var(--muted))' }}>
      {message}
    </div>
  );
}

/**
 * Horizontal bar chart. Bars share one scale (the largest value) so lengths
 * are directly comparable. Each row is keyboard-focusable and has a tooltip.
 */
export function BarChart({ data, unit = '', colorOffset = 0, ariaLabel }) {
  const rows = (data || []).filter((r) => r && Number.isFinite(r.value));
  const max = Math.max(0, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  const [active, setActive] = useState(null);

  if (rows.length === 0 || max === 0) return <ChartEmpty />;

  const describe = (r) => {
    const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
    return `${r.label}: ${fmt(r.value)}${unit ? ` ${unit}` : ''}${rows.length > 1 ? ` (${pct}% of shown total)` : ''}`;
  };

  return (
    <div role="group" aria-label={ariaLabel} style={{ display: 'grid', gap: 10 }}>
      {rows.map((r, i) => (
        <div
          key={r.label}
          tabIndex={0}
          title={describe(r)}
          onMouseEnter={() => setActive(r.label)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(r.label)}
          onBlur={() => setActive(null)}
          style={{ outline: 'none' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, gap: 8 }}>
            <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{r.label}</span>
            <strong style={{ color: 'hsl(var(--ink))' }}>{fmt(r.value)}</strong>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'hsl(var(--line) / 0.6)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(r.value / max) * 100}%`,
                minWidth: r.value > 0 ? 4 : 0,
                height: '100%',
                borderRadius: 5,
                background: CHART_COLORS[(i + colorOffset) % CHART_COLORS.length],
                opacity: active && active !== r.label ? 0.5 : 1,
                transition: 'width .4s ease, opacity .15s',
              }}
            />
          </div>
        </div>
      ))}
      <div aria-live="polite" style={{ fontSize: 11, color: 'hsl(var(--muted))', minHeight: 14 }}>
        {active ? describe(rows.find((x) => x.label === active)) : ''}
      </div>
    </div>
  );
}

/** Donut chart with legend; slices are proportional to the given counts. */
export function DonutChart({ data, centerLabel = 'total', ariaLabel }) {
  const rows = (data || []).filter((r) => r && Number.isFinite(r.value) && r.value > 0);
  const total = rows.reduce((s, r) => s + r.value, 0);
  const [active, setActive] = useState(null);

  if (rows.length === 0 || total === 0) return <ChartEmpty />;

  const R = 15.915; // circumference = 100, so dash lengths are percentages
  let offset = 25; // start at 12 o'clock

  return (
    <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg viewBox="0 0 42 42" role="img" aria-label={ariaLabel} style={{ width: 'min(200px, 60vw)', height: 'auto', flex: 'none' }}>
        <circle cx="21" cy="21" r={R} fill="none" stroke="hsl(var(--line) / 0.6)" strokeWidth="6" />
        {rows.map((r, i) => {
          const pct = (r.value / total) * 100;
          const slice = (
            <circle
              key={r.label}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={active === r.label ? 7 : 6}
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={offset}
              opacity={active && active !== r.label ? 0.45 : 1}
              onMouseEnter={() => setActive(r.label)}
              onMouseLeave={() => setActive(null)}
            >
              <title>{`${r.label}: ${fmt(r.value)} (${Math.round(pct)}%)`}</title>
            </circle>
          );
          offset -= pct;
          return slice;
        })}
        <text x="21" y="21.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="hsl(var(--ink))">{fmt(total)}</text>
        <text x="21" y="26.5" textAnchor="middle" fontSize="2.8" fill="hsl(var(--muted))">{centerLabel}</text>
      </svg>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6, fontSize: 13, minWidth: 160 }}>
        {rows.map((r, i) => (
          <li
            key={r.label}
            tabIndex={0}
            onMouseEnter={() => setActive(r.label)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(r.label)}
            onBlur={() => setActive(null)}
            title={`${r.label}: ${fmt(r.value)} (${Math.round((r.value / total) * 100)}%)`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, outline: 'none' }}
          >
            <span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: 3, background: CHART_COLORS[i % CHART_COLORS.length], flex: 'none' }} />
            <span style={{ flex: 1 }}>{r.label}</span>
            <strong>{fmt(r.value)}</strong>
            <span style={{ color: 'hsl(var(--muted))', fontSize: 11, width: 36, textAlign: 'right' }}>
              {Math.round((r.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartCard({ title, caption, children }) {
  return (
    <section className="card card-pad" style={{ background: 'hsl(var(--paper))' }}>
      <h3 style={{ margin: '0 0 2px', fontSize: 16 }}>{title}</h3>
      {caption && <p style={{ margin: '0 0 14px', fontSize: 12, color: 'hsl(var(--muted))' }}>{caption}</p>}
      {children}
    </section>
  );
}
