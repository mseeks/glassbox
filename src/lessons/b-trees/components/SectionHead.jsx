import { Reveal } from '../../../shared/reveal.jsx';

// Section header — Roman numeral + monospace kicker eyebrow + chapter title,
// revealed on scroll.
export default function SectionHead({ roman, kicker, title }) {
  return (
    <Reveal base="bt-rev" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span className="bt-roman">{roman}</span>
        <span className="bt-kicker">{kicker}</span>
      </div>
      <h2 className="bt-h2">{title}</h2>
    </Reveal>
  );
}
