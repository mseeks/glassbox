// The hero/header: kicker, oversized title, a one-line promise, and a spec row
// of the structure's defining numbers.
export default function Masthead() {
  return (
    <header className="mast">
      <div className="kicker">Probabilistic data structures</div>
      <h1>
        Hyper<span className="lo">loglog</span>
      </h1>
      <p className="sub">
        Count the <em>distinct</em> things in a torrent of billions, using only one
        photograph&rsquo;s worth of memory. One instrument. It infers a multitude from the rarest
        flicker it ever sees.
      </p>
      <div className="specrow">
        <span>
          ERROR <b>≈ 1.04/√m</b>
        </span>
        <span>
          MEMORY <b>~12 KB</b> for billions
        </span>
        <span>
          MERGEABLE <b>by max</b>
        </span>
        <span>
          FLAJOLET · FUSY · GANDON · MEUNIER <b>2007</b>
        </span>
      </div>
    </header>
  );
}
