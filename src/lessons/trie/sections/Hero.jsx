import { useEffect, useMemo, useState } from 'react';
import { buildTrie, layoutTrie } from '../engine/index.js';
import TrieMap from '../components/TrieMap.jsx';
import MapLegend from '../components/MapLegend.jsx';
import { WORDS, tracePath } from '../components/helpers.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

// Hero — auto-tracing through a cycle of words. The rider steps letter by
// letter; the spelling appears underneath. Click a chip to take manual
// control.
export default function Hero() {
  const root = useMemo(() => buildTrie(WORDS), []);
  const data = useMemo(() => layoutTrie(root), [root]);
  const CYCLE = useMemo(
    () => ['cart', 'care', 'cat', 'dodge', 'dog', 'dot', 'card', 'do', 'car'],
    [],
  );
  const [auto, setAuto] = useState(true);
  const [word, setWord] = useState(CYCLE[0]);
  const [step, setStep] = useState(0);
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();

  // step the rider along the current word, letter by letter
  useEffect(() => {
    const len = tracePath(root, word).ids.length;
    if (reduced) {
      setStep(len);
      return;
    } // reduced motion: jump to the fully-traced word
    setStep(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setStep(i);
      if (i >= len) clearInterval(iv);
    }, 250);
    return () => clearInterval(iv);
  }, [word, root, reduced]);

  // once a trace finishes, hold, then roll to the next word (auto mode only).
  // pause the ambient cycling while scrolled off-screen — the current word
  // stays drawn and cycling resumes when it returns to view.
  useEffect(() => {
    if (!auto || reduced || !inView) return; // reduced motion / off-screen: hold on the current word, no ambient cycling
    const len = tracePath(root, word).ids.length;
    const t = setTimeout(
      () => {
        const n = (CYCLE.indexOf(word) + 1) % CYCLE.length;
        setWord(CYCLE[n]);
      },
      len * 250 + 1250,
    );
    return () => clearTimeout(t);
  }, [word, auto, root, CYCLE, reduced, inView]);

  const trace = useMemo(() => tracePath(root, word), [root, word]);
  const shown = trace.ids.slice(0, Math.max(1, step));
  const pathSet = new Set(shown);
  const riderNode = data.nodes.find((n) => n.id === shown[shown.length - 1]);
  const rider = riderNode ? { x: riderNode.px, y: riderNode.py } : { x: null, y: null };
  const done = step >= trace.ids.length;
  const spelled = Math.max(0, Math.min(word.length, step - 1));
  const pick = (w) => {
    setAuto(false);
    setWord(w);
  };

  return (
    <header ref={vpRef} style={{ paddingTop: 'clamp(36px,7vw,70px)' }}>
      <div className="kicker hero-rise" style={{ marginBottom: 14 }}>
        Data structures · a field atlas
      </div>
      <h1
        className="disp hero-rise"
        style={{
          fontSize: 'clamp(58px,17vw,150px)',
          margin: '0 0 6px',
          lineHeight: 0.92,
          animationDelay: '.05s',
        }}
      >
        Trie
      </h1>
      <p
        className="lead hero-rise"
        style={{ maxWidth: 640, marginTop: 10, animationDelay: '.12s' }}
      >
        A map of words, drawn so that the <em>route is the word</em>. Spell as you travel. Words
        that begin alike share the same track and split apart only at the point where they finally
        differ. Pronounced "try," from re<strong>trie</strong>val.
      </p>
      <div className="card hero-panel hero-rise" style={{ marginTop: 24, animationDelay: '.2s' }}>
        <div className="hero-bar">
          <div className="hero-spell mono" aria-live="polite">
            <span className="on">{word.slice(0, spelled)}</span>
            {!done && <span className="caret">|</span>}
            <span className="rem">{word.slice(spelled)}</span>
          </div>
          <button className={`trace-toggle ${auto ? 'on' : ''}`} onClick={() => setAuto((a) => !a)}>
            <span className="ic">{auto ? '❚❚' : '▶'}</span>
            {auto ? 'auto-tracing' : 'paused'}
          </button>
        </div>
        <div className="chips" style={{ margin: '2px 0 12px' }}>
          {CYCLE.map((w) => (
            <button key={w} className={`chip ${word === w ? 'on' : ''}`} onClick={() => pick(w)}>
              {w}
            </button>
          ))}
        </div>
        <MapLegend />
        <TrieMap data={data} pathSet={pathSet} dimOthers showWords="active" riderProgress={rider} />
      </div>
    </header>
  );
}
