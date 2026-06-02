import SectionHead from './SectionHead.jsx';

// Section frame — a chapter band that pairs a SectionHead with its prose + lab.
export default function Section({ roman, kicker, title, children }) {
  return (
    <section className="bt-section bt-wrap">
      <SectionHead roman={roman} kicker={kicker} title={title} />
      {children}
    </section>
  );
}
