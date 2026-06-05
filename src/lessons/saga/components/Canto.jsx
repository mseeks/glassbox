// Canto wrapper — an anchored <section> whose head (numeral · kicker, title,
// optional lede) reveals on scroll, followed by the chapter's body. The head
// carries the lesson's reveal class; the root observer in the composition root
// adds `sg-in` on first intersection, and the shell's global reduced-motion CSS
// removes the transition, so under reduced motion the head just appears.
export default function Canto({ n, kicker, title, lede, id, children }) {
  return (
    <section className="sg-canto" id={id}>
      <div className="sg-wrap">
        <div className="sg-rv">
          <div className="sg-canto-head">
            <div className="sg-numeral">
              {n} · {kicker}
            </div>
            <h2 className="sg-title">{title}</h2>
            {lede && <p className="sg-lede">{lede}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
