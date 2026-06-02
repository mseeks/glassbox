import SectionHeader from './SectionHeader.jsx';

// Section wrapper — an anchored <section> with the standard header and the
// chapter's prose + lab passed as children.
export default function Section({ id, tag, title, lede, children }) {
  return (
    <section id={id} className="tls-section" style={{ scrollMarginTop: 64 }}>
      <div className="tls-wrap">
        <SectionHeader tag={tag} title={title} lede={lede} />
        {children}
      </div>
    </section>
  );
}
