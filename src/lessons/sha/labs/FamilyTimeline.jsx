import { Skull, X, ShieldCheck } from 'lucide-react';
import Figure from '../components/Figure.jsx';

const FAMILY = [
  {
    y: '1993',
    name: 'SHA-0',
    tone: 'var(--bone-faint)',
    status: 'withdrawn',
    note: "NIST's first attempt. Pulled within a year over a flaw they declined to name.",
  },
  {
    y: '1995',
    name: 'SHA-1',
    tone: 'var(--cerise)',
    status: 'broken',
    note: '160-bit output. Theoretically cracked in 2005; a real collision ("SHAttered") produced in 2017. Dead for security.',
  },
  {
    y: '2001',
    name: 'SHA-2',
    tone: 'var(--copper)',
    status: 'trusted',
    note: 'A family: 224 / 256 / 384 / 512 and two truncated variants. Built on the assembly-line design. Still the workhorse.',
  },
  {
    y: '2015',
    name: 'SHA-3',
    tone: 'var(--jade)',
    status: 'trusted',
    note: 'A wholly different design (Keccak), chosen by open competition. Not a replacement, but an insurance policy with new powers.',
  },
];

export default function FamilyTimeline() {
  return (
    <Figure
      label="Fig. 2 · Lineage"
      title="Four standards, two completely different machines"
      foot={
        <>
          The crucial thing: <span className="kw">SHA-2</span> and <span className="kg">SHA-3</span>{' '}
          are not two versions of one idea. They share a name and a standards body. Internally they
          are strangers — and that is deliberate.
        </>
      }
    >
      <div style={{ display: 'grid', gap: 0 }}>
        {FAMILY.map((f, i) => (
          <div
            key={f.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '54px 1fr',
              gap: 14,
              position: 'relative',
              paddingBottom: i < FAMILY.length - 1 ? 18 : 0,
            }}
          >
            <div style={{ textAlign: 'right', position: 'relative' }}>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  color: 'var(--bone-faint)',
                  fontWeight: 600,
                }}
              >
                {f.y}
              </span>
            </div>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              {/* spine + node */}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: f.tone,
                  boxShadow: `0 0 0 3px var(--void), 0 0 10px ${f.tone}`,
                }}
              />
              {i < FAMILY.length - 1 && (
                <span
                  style={{
                    position: 'absolute',
                    left: 4,
                    top: 14,
                    bottom: -18,
                    width: 1,
                    background: 'linear-gradient(var(--line-bright),var(--line))',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--slab)',
                    fontWeight: 700,
                    fontSize: 19,
                    color: f.tone,
                  }}
                >
                  {f.name}
                </span>
                <span
                  className="chip"
                  style={{
                    color: f.tone,
                    borderColor: f.tone + '66',
                    ...(f.status === 'broken' ? {} : {}),
                  }}
                >
                  {f.status === 'broken' ? (
                    <Skull size={11} />
                  ) : f.status === 'withdrawn' ? (
                    <X size={11} />
                  ) : (
                    <ShieldCheck size={11} />
                  )}
                  {f.status}
                </span>
              </div>
              <div
                style={{ fontSize: 14.5, color: 'var(--bone-dim)', marginTop: 5, lineHeight: 1.55 }}
              >
                {f.note}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Figure>
  );
}
