import { Check, X as XIcon } from 'lucide-react';
import { ChapterTitle, Prose, Section } from '../components/atoms.jsx';

const UseCard = ({ tone, items }) => {
  const isGood = tone === 'good';
  const color = isGood ? '#6ee7b7' : '#fb7185';
  return (
    <div
      style={{
        padding: 28,
        background: `${color}06`,
        border: `1px solid ${color}33`,
        borderRadius: 4,
        borderTop: `2px solid ${color}`,
      }}
    >
      <div className="bc-eyebrow" style={{ color, marginBottom: 16 }}>
        {isGood ? 'REACH FOR ONE WHEN' : "DON'T REACH FOR ONE WHEN"}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ marginTop: 6 }}>
              {isGood ? <Check size={15} color={color} /> : <XIcon size={15} color={color} />}
            </div>
            <div style={{ fontSize: 16, color: '#c8bfa5', lineHeight: 1.55 }}>{it}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ChapterEleven = () => (
  <Section id="ch11">
    <ChapterTitle
      number="XI"
      eyebrow="IN PRACTICE"
      title="When to reach for one"
      sub="And when something else fits better."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          A Bloom clock is a precision tool, not a default. Its sweet spot is a specific set of
          workload properties; outside that spot, simpler structures beat it. Two checklists.
        </p>
      </Prose>
    </div>

    <div className="bc-grid-2" style={{ marginTop: 48 }}>
      <UseCard
        tone="good"
        items={[
          'Cluster is large or dynamic, and membership changes faster than you want to manage per-node slots.',
          'Per-event payload budget is tight — gossip messages, replicated writes, network protocols where every byte counts.',
          'The downstream use is "trigger conflict resolution when concurrency is detected" — over-serialization is acceptable.',
          'You want a constant memory budget for causality tracking that you can size once and forget.',
          "You're already comfortable with probabilistic structures and can tune m and k against your event rate.",
        ]}
      />
      <UseCard
        tone="bad"
        items={[
          'N is small and stable — a vector clock costs nothing and pays you back in exactness.',
          'Event rate is high without any aging strategy — FPR will silently saturate to 1.',
          'Application logic needs to enumerate or audit causal dependencies, not just compare them.',
          'The cost of a false-positive ordering is correctness-critical and not merely a performance penalty.',
          'You need total ordering across nodes — Bloom clocks give partial order only.',
        ]}
      />
    </div>
  </Section>
);
