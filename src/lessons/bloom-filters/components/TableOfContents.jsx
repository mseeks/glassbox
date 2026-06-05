import { useScrollSpy, scrollToId } from '../../../shared/useScrollSpy.js';

const TOC_CHAPTERS = [
  { num: '01', title: 'The Question', anchor: 'ch-01' },
  { num: '02', title: 'The Construction', anchor: 'ch-02' },
  { num: '03', title: 'The Asymmetry', anchor: 'ch-03' },
  { num: '04', title: 'The Math', anchor: 'ch-04' },
  { num: '05', title: 'Saturation', anchor: 'ch-05' },
  { num: '06', title: 'The Limits', anchor: 'ch-06' },
  { num: '07', title: 'The Variants', anchor: 'ch-07' },
  { num: '08', title: 'The Cousins', anchor: 'ch-08' },
  { num: '09', title: 'In Production', anchor: 'ch-09' },
  { num: '10', title: 'When Not To', anchor: 'ch-10' },
  { num: '11', title: 'Coda', anchor: 'coda' },
];

const TOC_IDS = TOC_CHAPTERS.map((c) => c.anchor);

export function TableOfContents() {
  const active = useScrollSpy(TOC_IDS, { rootMargin: '-30% 0px -60% 0px', syncHash: true });

  return (
    <nav
      className="hidden xl:block fixed z-20"
      style={{ left: '2rem', top: '50%', transform: 'translateY(-50%)' }}
    >
      <div
        className="bf-ui bf-mark-muted mb-2"
        style={{
          fontSize: '0.65rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          paddingLeft: '0.85em',
        }}
      >
        Contents
      </div>
      {TOC_CHAPTERS.map((c) => (
        <a
          key={c.anchor}
          href={`#${c.anchor}`}
          className={`bf-toc-link${active === c.anchor ? ' active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            scrollToId(c.anchor);
          }}
        >
          <span className="bf-mono" style={{ marginRight: '0.65em', opacity: 0.6 }}>
            {c.num}
          </span>
          {c.title}
        </a>
      ))}
    </nav>
  );
}
