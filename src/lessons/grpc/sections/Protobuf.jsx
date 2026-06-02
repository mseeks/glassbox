import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Callout from '../components/Callout.jsx';
import WireEncoder from '../labs/WireEncoder.jsx';
import VarintLab from '../labs/VarintLab.jsx';
import EvolutionLab from '../labs/EvolutionLab.jsx';

// § 02 — Protocol Buffers to the byte: field numbers as permanent identity,
// varints, and the one rule of schema evolution.
export default function Protobuf() {
  return (
    <section className="gx-block" style={{ background: 'var(--bg2)' }}>
      <div className="gx-section">
        <SectionHead
          tag="§ 02 · the contract"
          title="Protocol Buffers, to the byte."
          lede="The whole format rests on one idea most people skim past: the field number is permanent identity, not position."
        />
        <div className="gx-prose">
          <Reveal base="gx-fade">
            <p>
              You describe your messages in a{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                .proto
              </code>{' '}
              file. Both client and server compile it ahead of time, so the schema lives{' '}
              <em>out of band</em>. Never on the wire.
            </p>
            <div className="gx-code">
              <span className="kw">syntax</span> = <span className="st">"proto3"</span>;{'\n'}
              <span className="kw">message</span> <span className="ty">Account</span> {'{'}
              {'\n'}
              {'  '}
              <span className="ty">string</span> <span className="fn">owner</span> ={' '}
              <span className="nu">1</span>;{'\n'}
              {'  '}
              <span className="ty">int64</span> <span className="fn">balance_cents</span> ={' '}
              <span className="nu">2</span>;{'\n'}
              {'}'}
            </div>
            <p>
              The trap is to read{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                = 1
              </code>{' '}
              as "the first field." It isn't an order. It's a permanent <strong>tag number</strong>.
              On the wire, each field is a key/value pair where the key packs the field number with
              a 3-bit <strong>wire type</strong> (
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                (field &lt;&lt; 3) | type
              </code>
              ) telling the decoder how to read what follows. No names, no braces, no commas. Edit
              the message below and watch the real bytes.
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <WireEncoder />
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 28 }}>
              Those small numbers are <strong>varints</strong>: the byte-thrift trick that makes the
              format compact. Seven bits of value per byte, with the top bit flagging "more to
              come." Small numbers cost few bytes. Big ones grow only as needed.
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <VarintLab />
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 28 }}>
              Now the payoff. Because the wire carries <em>numbers, not names</em>, schema evolution
              becomes tractable, as long as you respect one rule. Change the server's contract and
              see what an old client does:
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <EvolutionLab />
          </Reveal>
          <Reveal base="gx-fade">
            <Callout kind="warn">
              <b>The one rule.</b> Never reuse or repurpose a field number. To retire one, tombstone
              it:{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                reserved 2;
              </code>
              . Adding new fields is always safe; renaming is free; changing a field's type or
              number is how you get silent corruption across versions.
            </Callout>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
