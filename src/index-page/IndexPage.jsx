import { lessons } from '../lesson-catalog.js';
import { useTheme } from '../shared/useTheme.js';
import Glyph from './Glyph.jsx';
import GlassCube from './GlassCube.jsx';
import './index-page.css';

// Daytime stars. Each lesson's accent is a pastel tuned to glow on the dark sky;
// on champagne paper those pastels vanish (every one fails WCAG AA on cream).
// Keyed by lesson id, these are the same OKLCH hues re-plated for daylight —
// lower lightness, richer chroma — so each glyph reads as a vivid daytime star
// on the cream and the per-card rim/top-bar keeps its identity. The dark sky is
// the loved reference and uses the catalog accents untouched. Members with the
// same source hue (the teal trio acid/grpc/tls, the gold cluster) are staggered
// in magnitude so the constellation stays as distinguishable as paper allows.
const DAYTIME_ACCENTS = {
  'concurrency-foundations': '#5578b0',
  'acid-lab': '#008778',
  'cap-pacelc': '#dd233a',
  swim: '#bc5969',
  udp: '#c15a00',
  'bloom-filters': '#806bbf',
  'bloom-clock': '#886100',
  'cuckoo-filter': '#d62d00',
  'lsm-trees': '#bb3700',
  memory: '#9a6a00',
  'merkle-trees': '#007b62',
  sha: '#b35100',
  trie: '#008767',
  grpc: '#007e72',
  'b-trees': '#007da2',
  hyperloglog: '#a36c00',
  'vp-tree': '#a76900',
  tls: '#00807a',
};

function IndexPage({ onSelectLesson }) {
  const { theme } = useTheme();
  const accentFor = (lesson) =>
    theme === 'light' ? (DAYTIME_ACCENTS[lesson.id] ?? lesson.accent) : lesson.accent;

  return (
    <main className="idx-root">
      <div className="idx-content">
        <div className="idx-hero">
          <div className="idx-hero-copy">
            <h1 className="idx-h1">Glassbox</h1>
            <p className="idx-tagline">hard topics, made clear</p>
          </div>
          <div className="idx-hero-stage">
            <GlassCube />
          </div>
        </div>

        <p className="idx-section-label">The collection · pick one</p>

        <div className="idx-grid">
          {lessons.map((lesson) => {
            const accent = accentFor(lesson);
            return (
              <button
                key={lesson.id}
                type="button"
                className="idx-card"
                style={{
                  '--card-accent': accent,
                  fontFamily: lesson.displayFont,
                }}
                onClick={() => onSelectLesson(lesson.id)}
                aria-label={`Open ${lesson.title}`}
              >
                <p className="idx-card-eyebrow">{lesson.eyebrow}</p>
                <h2 className="idx-card-title" style={{ fontFamily: lesson.displayFont }}>
                  {lesson.title}
                </h2>
                <p className="idx-card-subtitle">{lesson.subtitle}</p>
                <p className="idx-card-pitch">{lesson.pitch}</p>
                <div className="idx-card-foot">
                  <span className="idx-card-cta">Open →</span>
                  <Glyph kind={lesson.glyph} color={accent} />
                </div>
              </button>
            );
          })}
        </div>

        <p className="idx-footer">Glassbox</p>
      </div>
    </main>
  );
}

export default IndexPage;
