import { P } from '../components/P.jsx';
import { PageBlock } from '../components/PageBlock.jsx';
import { Rule } from '../components/Rule.jsx';
import { SectionHead } from '../components/SectionHead.jsx';

export function SectionNine() {
  const variants = [
    {
      year: '2014',
      name: 'Semi-sorted cuckoo',
      who: 'Fan, Andersen, Kaminsky & Mitzenmacher',
      body: 'A refinement in the founding paper itself. Within each bucket, sort the fingerprints and store deltas; the saved bits buy about a half-bit per entry. The same idea, in tighter accounting.',
    },
    {
      year: '2018',
      name: 'Morton filter',
      who: 'Breslow & Jayasena',
      body: 'Track bucket occupancy explicitly to skip empty cache lines. Lookups grow faster than they should otherwise; load factors climb higher.',
    },
    {
      year: '2017',
      name: 'Adaptive cuckoo',
      who: 'Mitzenmacher, Pontarelli & Reviriego',
      body: 'When a false positive is discovered (the application asked the truth-store), rotate the offending fingerprint so future queries miss it. The error rate, in practice, drops below the theoretical bound.',
    },
    {
      year: '2019',
      name: 'Vacuum filter',
      who: 'Wang et al.',
      body: 'A different residence rule that admits higher loads — over ninety-five percent — and supports dynamic resizing without rebuilding from scratch.',
    },
  ];

  const uses = [
    {
      where: 'Log-structured KV stores',
      what: 'RocksDB and similar engines place a small filter in front of each SST file; lookups skip files the filter denies, sparing disk reads.',
    },
    {
      where: 'In-memory caches',
      what: 'MemC3 (NSDI 2013, a Memcached variant from the same lab) used cuckoo hashing for its index and a cuckoo filter for negative caching.',
    },
    {
      where: 'Software-defined networks',
      what: 'Flow tables consult filters before falling through to the slow path; cuckoo filters let entries leave when flows die.',
    },
    {
      where: 'Deduplication & backup',
      what: "Backup systems use the filter to decide whether to read a chunk's full hash from disk; deletion lets the structure track an evolving corpus.",
    },
  ];

  return (
    <section className="cf-section">
      <SectionHead num="09" eyebrow="The family and its uses" title="Lineage &" italic="practice" />

      <PageBlock>
        <P size="lead">
          The cuckoo filter as described — fingerprints, four-slot buckets, XOR pact, kick budget —
          was published by Fan, Andersen, Kaminsky and Mitzenmacher in 2014. The decade since has
          added refinements, mostly in trade-offs already in the structure.
        </P>
      </PageBlock>

      <div className="cf-page" style={{ marginTop: 32 }}>
        <div className="cf-block-wide">
          <div className="cf-eyebrow" style={{ marginBottom: 18 }}>
            Variants
          </div>
          <div className="cf-cols cf-cols-2">
            {variants.map((v) => (
              <div
                key={v.name}
                style={{
                  padding: '20px 22px',
                  border: '1px solid var(--line)',
                  background: 'var(--bg-1)',
                }}
              >
                <div
                  className="cf-variant-head"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Fraunces',
                      fontSize: 22,
                      fontWeight: 400,
                      letterSpacing: '-0.012em',
                    }}
                  >
                    {v.name}
                  </div>
                  <div
                    className="cf-mono"
                    style={{ fontSize: 11, color: 'var(--cuc)', letterSpacing: '0.12em' }}
                  >
                    {v.year}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'IBM Plex Serif',
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: 'var(--text-mute)',
                    marginBottom: 12,
                  }}
                >
                  {v.who}
                </div>
                <div className="cf-body" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
                  {v.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cf-page" style={{ marginTop: 56 }}>
        <div className="cf-block-wide">
          <div className="cf-eyebrow" style={{ marginBottom: 18 }}>
            Where it earns its keep
          </div>
          <div style={{ borderTop: '1px solid var(--cuc)' }}>
            {uses.map((u) => (
              <div
                key={u.where}
                className="cf-cols cf-cols-uses"
                style={{
                  padding: '22px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Fraunces',
                    fontStyle: 'italic',
                    fontSize: 21,
                    fontWeight: 400,
                    color: 'var(--text)',
                    letterSpacing: '-0.012em',
                  }}
                >
                  {u.where}
                </div>
                <div className="cf-body" style={{ fontSize: 15, lineHeight: 1.55 }}>
                  {u.what}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Rule />
    </section>
  );
}
