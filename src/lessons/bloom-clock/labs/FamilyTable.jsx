import React from 'react';

export const FamilyTable = () => {
  const rows = [
    {
      name: 'Lamport scalar',
      year: '1978',
      space: 'O(1)',
      semantics: 'Total order',
      detects: <span style={{ color: 'var(--bc-rose)' }}>No</span>,
      dynamic: <span style={{ color: 'var(--bc-rose)' }}>–</span>,
      exact: <span style={{ color: 'var(--bc-emerald)' }}>Yes</span>,
      note: 'Cannot tell concurrency from order. Useful only when total order is enough.',
    },
    {
      name: 'Vector clock',
      year: '1988',
      space: 'O(N)',
      semantics: 'Partial order',
      detects: <span style={{ color: 'var(--bc-emerald)' }}>Exact</span>,
      dynamic: <span style={{ color: 'var(--bc-rose)' }}>Hard</span>,
      exact: <span style={{ color: 'var(--bc-emerald)' }}>Yes</span>,
      note: 'The exactness gold standard. Pay one slot per node.',
    },
    {
      name: 'Version vector',
      year: '1983',
      space: 'O(R)',
      semantics: 'Replica lineage',
      detects: <span style={{ color: 'var(--bc-emerald)' }}>Exact</span>,
      dynamic: <span style={{ color: 'var(--bc-rose)' }}>Hard</span>,
      exact: <span style={{ color: 'var(--bc-emerald)' }}>Yes</span>,
      note: 'Replica-state variant. Used in Dynamo lineage, Riak, etc.',
    },
    {
      name: 'Interval tree clock',
      year: '2008',
      space: 'O(log N)*',
      semantics: 'Partial order',
      detects: <span style={{ color: 'var(--bc-emerald)' }}>Exact</span>,
      dynamic: <span style={{ color: 'var(--bc-emerald)' }}>Self-managing</span>,
      exact: <span style={{ color: 'var(--bc-emerald)' }}>Yes</span>,
      note: 'IDs are tree intervals that fork on join, merge on leave. Complex.',
    },
    {
      name: 'Hybrid logical clock',
      year: '2014',
      space: 'O(1)',
      semantics: 'Total order',
      detects: <span style={{ color: 'var(--bc-rose)' }}>No</span>,
      dynamic: <span style={{ color: 'var(--bc-emerald)' }}>Trivial</span>,
      exact: <span style={{ color: 'var(--bc-emerald)' }}>Yes*</span>,
      note: 'Wall clock + tiny counter. Used in CockroachDB, MongoDB. NTP-dependent.',
    },
    {
      name: 'Bloom clock',
      year: '2019',
      space: 'O(m)',
      semantics: 'Partial order',
      detects: <span style={{ color: 'var(--bc-emerald)' }}>Exact</span>,
      dynamic: <span style={{ color: 'var(--bc-emerald)' }}>Trivial</span>,
      exact: <span style={{ color: 'var(--bc-rose)' }}>Probabilistic</span>,
      note: 'The asymmetric trade. Constant size regardless of N.',
      highlight: true,
    },
  ];

  return (
    <div
      style={{
        border: '1px solid var(--bc-rule-strong)',
        borderRadius: 4,
        overflow: 'hidden',
        background: 'var(--bc-inset-4)',
      }}
    >
      <div
        className="bc-family-header"
        style={{
          background: 'var(--bc-head-bg)',
          borderBottom: '1px solid var(--bc-rule)',
        }}
      >
        {['CLOCK', 'YEAR', 'SPACE', 'SEMANTICS', 'CONCURRENCY', 'DYNAMIC N', 'EXACT'].map((h) => (
          <div
            key={h}
            className="bc-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: '0.13em',
              color: 'var(--bc-ink-muted)',
              fontWeight: 600,
            }}
          >
            {h}
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <React.Fragment key={r.name}>
          <div
            className="bc-family-row"
            style={{
              borderBottom: i < rows.length - 1 ? '1px dotted var(--bc-rule-faint)' : 'none',
              background: r.highlight ? 'var(--bc-gold-wash)' : 'transparent',
            }}
          >
            <div
              data-cell="clock"
              data-fullrow
              className="bc-italic"
              style={{ fontSize: 19, color: r.highlight ? 'var(--bc-gold)' : 'var(--bc-ink)' }}
            >
              {r.name}
            </div>
            <div
              data-cell="year"
              className="bc-mono"
              style={{ fontSize: 12, color: 'var(--bc-ink-muted)' }}
            >
              {r.year}
            </div>
            <div
              data-cell="space"
              className="bc-mono"
              style={{ fontSize: 12, color: r.highlight ? 'var(--bc-gold)' : 'var(--bc-ink-dim)' }}
            >
              {r.space}
            </div>
            <div data-cell="semantics" style={{ fontSize: 14, color: 'var(--bc-ink-dim)' }}>
              {r.semantics}
            </div>
            <div data-cell="concurrency" style={{ fontSize: 13 }}>
              {r.detects}
            </div>
            <div data-cell="dynamic N" style={{ fontSize: 13 }}>
              {r.dynamic}
            </div>
            <div data-cell="exact" style={{ fontSize: 13 }}>
              {r.exact}
            </div>
          </div>
          <div
            className="bc-family-note"
            style={{
              borderBottom: i < rows.length - 1 ? '1px solid var(--bc-rule-faint)' : 'none',
              background: r.highlight ? 'var(--bc-gold-wash)' : 'transparent',
            }}
          >
            <div
              className="bc-italic"
              style={{ fontSize: 14, color: 'var(--bc-ink-muted)', fontStyle: 'italic' }}
            >
              {r.note}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
