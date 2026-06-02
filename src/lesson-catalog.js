import { lazy } from 'react';

// Lesson components are code-split per slug. A template-literal dynamic import
// lets Vite emit one chunk per lessons/<slug>/index.js without hand-maintaining
// a loader and a lazy() const per lesson. The thunk isn't called until render,
// so this module also stays importable in plain Node (e.g. the Playwright
// specs that read lesson metadata) — unlike import.meta.glob.
const lazyLesson = (id) => lazy(() => import(`./lessons/${id}/index.js`));

// Eighteen lessons, in nav/index order. Each entry is plain metadata keyed by
// `id` — which is also the lesson's folder under src/lessons/ — and the lazy
// Component is derived from that id below, so the id is the single source of
// truth. Each lesson carries its own typographic + chromatic identity; the
// family glue is the shared paper (#0a0a0f), parchment ink (#e8dec8 family),
// and JetBrains Mono for every numeric/credit/eyebrow.
const lessonMeta = [
  {
    id: 'concurrency-foundations',
    label: 'Concurrency',
    title: 'Concurrency Foundations',
    accent: '#9ab8e8',
    accentSoft: 'rgba(154, 184, 232, 0.14)',
    displayFont: "'Fraunces', Georgia, serif",
    eyebrow: 'FOUNDATIONS · I — VII',
    subtitle: 'From threads to memory models.',
    pitch:
      'Concurrent programs are not hard because there is more code. They are hard because more than one thing can observe the same state at the same time.',
    glyph: 'threads',
  },
  {
    id: 'acid-lab',
    label: 'ACID',
    title: 'The ACID Lab',
    accent: '#5eead4',
    accentSoft: 'rgba(94, 234, 212, 0.14)',
    displayFont: "'EB Garamond', Georgia, serif",
    eyebrow: 'A · C · I · D',
    subtitle: 'Four letters, four guarantees.',
    pitch:
      'The contract every database makes with the applications that trust it — as a coordinate system you can think inside of, not an acronym you memorize.',
    glyph: 'acid',
  },
  {
    id: 'cap-pacelc',
    label: 'CAP',
    title: 'CAP & PACELC',
    accent: '#f87171',
    accentSoft: 'rgba(248, 113, 113, 0.14)',
    displayFont: "'Spectral', Georgia, serif",
    eyebrow: 'BREWER · GILBERT & LYNCH · PACELC',
    subtitle: 'What distributed systems must give up, and when.',
    pitch:
      'Two theorems about every database, cache, coordination service, and file store: what happens when the network splits, and what happens when it merely slows down.',
    glyph: 'partition',
  },
  {
    id: 'swim',
    label: 'SWIM',
    title: 'SWIM',
    accent: '#fda4af',
    accentSoft: 'rgba(253, 164, 175, 0.14)',
    displayFont: "'Cormorant Garamond', Georgia, serif",
    eyebrow: 'DAS · GUPTA · MOTIVALA · 2002',
    subtitle: 'Who is still here?',
    pitch:
      'A protocol for asking that question across a thousand machines — without anyone polling, anyone in charge, or anyone left out.',
    glyph: 'cluster',
  },
  {
    id: 'udp',
    label: 'UDP',
    title: 'UDP',
    accent: '#ff8c42',
    accentSoft: 'rgba(255, 140, 66, 0.14)',
    displayFont: "'Bricolage Grotesque', system-ui, sans-serif",
    eyebrow: 'RFC 768 · 1980',
    subtitle: 'The protocol that tells the truth.',
    pitch:
      "The internet underneath everything is a postal service that loses mail. TCP hides that truth; UDP doesn't.",
    glyph: 'datagrams',
  },
  {
    id: 'bloom-filters',
    label: 'Bloom',
    title: 'Bloom Filters',
    accent: '#c4b5fd',
    accentSoft: 'rgba(196, 181, 253, 0.14)',
    displayFont: "'Playfair Display', Georgia, serif",
    eyebrow: 'BURTON H. BLOOM · 1970',
    subtitle: 'Have I seen this before?',
    pitch:
      'Ten bits to know if anything belongs. The data structure that traded certainty for memory and changed how big systems answer the oldest question in computing.',
    glyph: 'bits',
  },
  {
    id: 'bloom-clock',
    label: 'Bloom Clock',
    title: 'The Bloom Clock',
    accent: '#f5b942',
    accentSoft: 'rgba(245, 185, 66, 0.14)',
    displayFont: "'Instrument Serif', Georgia, serif",
    eyebrow: 'DISTRIBUTED CAUSALITY',
    subtitle: 'Did A happen before B?',
    pitch:
      'A constant-size structure for telling time across machines that may never agree on it — fixed bits, probabilistic answers, distributed causality.',
    glyph: 'bloom-clock',
  },
  {
    id: 'cuckoo-filter',
    label: 'Cuckoo',
    title: 'The Cuckoo Filter',
    accent: '#ff5c3a',
    accentSoft: 'rgba(255, 92, 58, 0.14)',
    displayFont: "'Fraunces', 'IBM Plex Serif', Georgia, serif",
    eyebrow: 'FAN ET AL. · 2014',
    subtitle: 'Is this one in the set?',
    pitch:
      'A small structure that answers membership with a handful of bits per entry — and, unusually for its kind, knows how to forget.',
    glyph: 'fingerprints',
  },
  {
    id: 'lsm-trees',
    label: 'LSM',
    title: 'LSM Trees',
    accent: '#e3582c',
    accentSoft: 'rgba(227, 88, 44, 0.14)',
    displayFont: "'Bitter', Georgia, serif",
    eyebrow: "O'NEIL ET AL. · 1996",
    subtitle: 'Time becomes depth.',
    pitch:
      'A storage engine that never erases and never overwrites — it only lays a newer layer on top. To read, you drill down and take the first thing you hit.',
    glyph: 'strata',
  },
  {
    id: 'memory',
    label: 'Memory',
    title: 'The Weight of Memory',
    accent: '#f6b545',
    accentSoft: 'rgba(246, 181, 69, 0.14)',
    displayFont: "'Instrument Serif', Georgia, serif",
    eyebrow: 'A HISTORY OF ALMOST NOTHING',
    subtitle: 'From one bit, by hand, to an ocean.',
    pitch:
      'It began as a wire threaded by hand through a ring of iron, one bit at a time. In a single lifetime it became an ocean nobody can picture.',
    glyph: 'core',
  },
  {
    id: 'merkle-trees',
    label: 'Merkle',
    title: 'Merkle Trees',
    accent: '#5bc0a3',
    accentSoft: 'rgba(91, 192, 163, 0.14)',
    displayFont: "'Libre Caslon Display', Georgia, serif",
    eyebrow: 'RALPH C. MERKLE · 1979',
    subtitle: 'One fingerprint for an entire dataset.',
    pitch:
      'One small fingerprint that vouches for an entire dataset — and a receipt, the size of a whisper, that proves any single piece belongs.',
    glyph: 'merkle',
  },
  {
    id: 'sha',
    label: 'SHA',
    title: 'The One-Way Machine',
    accent: '#e07a3c',
    accentSoft: 'rgba(224, 122, 60, 0.14)',
    displayFont: "'Zilla Slab', Georgia, serif",
    eyebrow: 'NIST · FIPS 180',
    subtitle: 'Easy to compute. Impossible to reverse.',
    pitch:
      'A function that swallows anything and stamps out a short, fixed fingerprint. Change one letter and the entire fingerprint shatters.',
    glyph: 'digest',
  },
  {
    id: 'trie',
    label: 'Trie',
    title: 'Trie',
    accent: '#46d3a8',
    accentSoft: 'rgba(70, 211, 168, 0.14)',
    displayFont: "'Fraunces', Georgia, serif",
    eyebrow: 'EDWARD FREDKIN · 1960',
    subtitle: 'The route is the word.',
    pitch:
      'A map of words drawn so the route is the word. Spell as you travel; words that begin alike share the same track and split only where they differ.',
    glyph: 'trie',
  },
  {
    id: 'grpc',
    label: 'gRPC',
    title: 'gRPC',
    accent: '#38ddcb',
    accentSoft: 'rgba(56, 221, 203, 0.14)',
    displayFont: "'Bricolage Grotesque', system-ui, sans-serif",
    eyebrow: 'GOOGLE · 2015',
    subtitle: 'Make the network disappear.',
    pitch:
      'Call a function that lives on another machine — and feel nothing. A typed contract and a binary wire keep the promise; the places it refuses to hide the network are the lesson.',
    glyph: 'grpc',
  },
  {
    id: 'b-trees',
    label: 'B-Tree',
    title: 'B-Trees',
    accent: '#4aa3c7',
    accentSoft: 'rgba(74, 163, 199, 0.14)',
    displayFont: "'Zilla Slab', Georgia, serif",
    eyebrow: 'BAYER & McCREIGHT · 1970',
    subtitle: 'Why a billion keys stay three levels deep.',
    pitch:
      'A century before databases, librarians built one out of oak and index cards — a tree that stays perfectly balanced through a billion filings by growing only at its root.',
    glyph: 'btree',
  },
  {
    id: 'hyperloglog',
    label: 'HLL',
    title: 'HyperLogLog',
    accent: '#e3a13c',
    accentSoft: 'rgba(227, 161, 60, 0.14)',
    displayFont: "'Big Shoulders Display', 'Arial Narrow', sans-serif",
    eyebrow: 'FLAJOLET · FUSY · GANDON · MEUNIER · 2007',
    subtitle: 'How many distinct, in twelve kilobytes?',
    pitch:
      'Count the distinct things in a torrent of billions using the memory of a single photograph — an instrument that infers a multitude from the rarest flicker it ever sees.',
    glyph: 'hyperloglog',
  },
  {
    id: 'vp-tree',
    label: 'VP-Tree',
    title: 'Vantage-Point Trees',
    accent: '#ffb454',
    accentSoft: 'rgba(255, 180, 84, 0.14)',
    displayFont: "'Big Shoulders Display', 'Arial Narrow', sans-serif",
    eyebrow: 'PETER YIANILOS · 1993',
    subtitle: 'Find the closest thing using only distance.',
    pitch:
      'Find the nearest of thousands without checking them all — file the world by distance, then let one geometric rule throw whole regions away unmeasured.',
    glyph: 'vptree',
  },
  {
    id: 'tls',
    label: 'TLS',
    title: 'TLS',
    accent: '#46d6c6',
    accentSoft: 'rgba(70, 214, 198, 0.14)',
    displayFont: "'Spectral', Georgia, serif",
    eyebrow: 'IETF · RFC 8446 · TLS 1.3',
    subtitle: 'A private room, built across a hostile wire.',
    pitch:
      'Two strangers who have never met, on a wire the whole world can read, build a room that is private, untampered, and provably to the right party.',
    glyph: 'tls',
  },
];

export const lessons = lessonMeta.map((lesson) => ({
  ...lesson,
  Component: lazyLesson(lesson.id),
}));

export const indexPage = {
  id: 'index',
  label: 'Index',
  title: 'Interactive Lessons',
};

export const pages = [indexPage, ...lessons];

export const defaultPageId = indexPage.id;

const pageIds = new Set(pages.map((page) => page.id));

export const getLessonById = (lessonId) => lessons.find((lesson) => lesson.id === lessonId);

export const isPageId = (pageId) => pageIds.has(pageId);

// Legacy ?lesson= ids kept resolving after the id↔slug alignment, so old
// bookmarks (?lesson=isolation, ?lesson=concurrency) still open the right
// lesson. Look up own keys only, so prototype-chain names (constructor,
// __proto__, toString) can't masquerade as aliases.
const legacyPageIdAliases = {
  concurrency: 'concurrency-foundations',
  isolation: 'acid-lab',
};

export function getPageIdFromSearch(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  const requested = params.get('lesson');
  const lessonId =
    requested && Object.hasOwn(legacyPageIdAliases, requested)
      ? legacyPageIdAliases[requested]
      : requested;

  return isPageId(lessonId) ? lessonId : defaultPageId;
}

export function getPageIdFromUrl() {
  if (typeof window === 'undefined') return defaultPageId;

  return getPageIdFromSearch(window.location.search);
}
