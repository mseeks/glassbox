// Section wrapper — an anchored <section> with the centred shell column. Every
// chapter renders inside one of these so the scroll-spy can observe it by id.
export default function Section({ id, children }) {
  return (
    <section className="sst-section" id={id}>
      <div className="sst-shell">{children}</div>
    </section>
  );
}
