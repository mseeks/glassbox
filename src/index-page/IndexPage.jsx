import { lessons } from '../lesson-catalog.js';
import Glyph from './Glyph.jsx';
import './index-page.css';

function IndexPage({ onSelectLesson }) {
  return (
    <main className="idx-root">
      <div className="idx-content">
        <p className="idx-eyebrow">Interactive Lessons · 2026</p>
        <h1 className="idx-h1">
          Eighteen lessons.
          <br />
          <em>One idea.</em>
        </h1>
        <p className="idx-lede">
          Hard topics get clearer when you can poke them. Each lesson stands on its own — its own
          paper, its own questions — but they keep each other company.
        </p>

        <div className="idx-rule" />

        <p className="idx-section-label">The collection · pick one</p>

        <div className="idx-grid">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className="idx-card"
              style={{
                '--card-accent': lesson.accent,
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
                <Glyph kind={lesson.glyph} color={lesson.accent} />
              </div>
            </button>
          ))}
        </div>

        <p className="idx-footer">A small library of interactive systems lessons</p>
      </div>
    </main>
  );
}

export default IndexPage;
