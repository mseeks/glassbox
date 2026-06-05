import { useMemo, useState } from 'react';
import { prefixEncode, blen, PREFIX_KEYS, PREFIX_R } from '../engine/index.js';
import Section from '../components/Section.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Plate from '../components/Plate.jsx';
import Seg from '../components/Seg.jsx';

// §V — shared prefixes + restart points. Store only what changed from the key
// before, planting a full key every few entries so you can still jump in.
export default function CompressLab() {
  const [coded, setCoded] = useState(true);
  const enc = useMemo(() => prefixEncode(PREFIX_KEYS, PREFIX_R), []);
  const pct = Math.round((1 - enc.bytesPacked / enc.bytesRaw) * 100);
  const packedW = Math.round((enc.bytesPacked / enc.bytesRaw) * 100);

  return (
    <Section id="compress">
      <SectionHeading
        roman="V"
        kicker="compression"
        title="Sorted keys repeat themselves"
        dek="Neighbouring keys share long prefixes. Store only what changed from the key before — and plant a full key now and then so you can still jump in."
      />
      <div className="sst-g2">
        <div className="sst-prose">
          <p>
            Within a block, keep the length of the prefix a key shares with its predecessor, then
            only the new <strong>suffix</strong>. You lose random access inside the block, so every
            few entries you store a full <span className="ox">restart point</span> and binary-search
            those.
          </p>
          <p>
            That shared-prefix instinct is the <strong>trie</strong>, one layer down. And because a
            block is a self-contained chunk that never changes, you compress the whole block once at
            write time — with something like Snappy or Zstandard — and decompress exactly one block
            per read. Immutability is what keeps that clean.
          </p>
        </div>

        <Plate
          cap="prefix coding · 6 keys, restart every 3"
          capRight={coded ? `−${pct}% bytes` : 'full keys'}
        >
          <div className="sst-lab-controls" style={{ marginBottom: 12 }}>
            <Seg
              ariaLabel="encoding"
              value={coded ? 'coded' : 'full'}
              onChange={(v) => setCoded(v === 'coded')}
              options={[
                { value: 'full', label: 'Full keys' },
                { value: 'coded', label: 'Prefix-coded' },
              ]}
            />
          </div>

          <div className="sst-pfx">
            {enc.entries.map((e, idx) => {
              const key = PREFIX_KEYS[idx];
              const shared = key.slice(0, e.shared);
              const suffix = e.suffix;
              if (!coded) {
                return (
                  <div key={idx} className="sst-pfx-row">
                    <span className="sst-pfx-badge idle">full</span>
                    <span className="sst-mono">{key}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className="sst-pfx-row">
                  {e.restart ? (
                    <span className="sst-pfx-badge restart">◆ restart</span>
                  ) : (
                    <span className="sst-pfx-badge share">+{e.shared}</span>
                  )}
                  <span className="sst-mono">
                    {!e.restart && shared && <span className="sst-pfx-faded">{shared}</span>}
                    <span style={{ color: 'var(--ink)' }}>{suffix}</span>
                  </span>
                  {!e.restart && <span className="sst-pfx-store">stores {blen(suffix)}B</span>}
                </div>
              );
            })}
          </div>

          <div className="sst-bars">
            <div className="sst-barline">
              <span className="sst-tiny">raw</span>
              <span className="sst-bar">
                <span className="sst-barfill raw" style={{ width: '100%' }} />
              </span>
              <span className="sst-mono sst-barnum">{enc.bytesRaw}B</span>
            </div>
            <div className="sst-barline">
              <span className="sst-tiny" style={{ color: 'var(--sage)' }}>
                packed
              </span>
              <span className="sst-bar">
                <span
                  className="sst-barfill packed"
                  style={{ width: `${coded ? packedW : 100}%` }}
                />
              </span>
              <span className="sst-mono sst-barnum">{coded ? enc.bytesPacked : enc.bytesRaw}B</span>
            </div>
          </div>
        </Plate>
      </div>
    </Section>
  );
}
