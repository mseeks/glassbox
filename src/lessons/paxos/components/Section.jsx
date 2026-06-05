// Section wrapper — an anchored <section> carrying the giant ghost Roman
// numeral and the chapter's reveal-on-scroll blocks as children.
export default function Section({ id, roman, children }) {
  return (
    <section className="pax-section" id={id}>
      <div className="pax-numeral" aria-hidden="true">
        {roman}
      </div>
      {children}
    </section>
  );
}
