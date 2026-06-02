import { Reveal } from '../../../shared/reveal.jsx';

// A numbered prose chapter that reveals on scroll. The `.chapter` base class
// holds the hidden state in CSS and gains `.in` when it scrolls into view —
// here via the shared <Reveal base="chapter"> wrapper (replacing the lesson's
// old local useReveal).
export default function Chapter({ n, title, children }) {
  return (
    <Reveal as="section" base="chapter">
      <div className="chead">
        <span className="cnum">{n}</span>
        <h2 className="ctitle">{title}</h2>
      </div>
      {children}
    </Reveal>
  );
}
