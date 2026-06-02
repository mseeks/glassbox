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
          'The cluster is large or dynamic, and membership churns faster than you ever want to manage a slot per node.',
          'Every byte counts. Gossip messages, replicated writes, tight network protocols: the per-event payload budget is small.',
          'You only need to trigger conflict resolution when concurrency shows up, and a little over-serialization is acceptable.',
          'You want a fixed memory budget for causality. Size it once. Forget it.',
          "You're already comfortable with probabilistic structures and can tune m and k against your event rate.",
        ]}
      />
      <UseCard
        tone="bad"
        items={[
          'N is small and stable. A vector clock costs nothing here and pays you back in full exactness.',
          'Event rate is high and you have no aging strategy in place, which means FPR will silently saturate to 1.',
          'Application logic needs to enumerate or audit causal dependencies, not just compare them.',
          'A false-positive ordering would be correctness-critical, not merely a performance penalty.',
          'You need total ordering. Bloom clocks give partial order only.',
        ]}
      />
    </div>
  </Section>
);
