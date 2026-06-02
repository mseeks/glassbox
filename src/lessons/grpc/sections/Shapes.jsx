import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import RpcTypesLab from '../labs/RpcTypesLab.jsx';
import FlowControlLab from '../labs/FlowControlLab.jsx';

// § 04 — the four call shapes streaming unlocks, and the backpressure that keeps
// a fast producer from drowning a slow consumer.
export default function Shapes() {
  return (
    <section className="gx-block" style={{ background: 'var(--bg2)' }}>
      <div className="gx-section">
        <SectionHead
          tag="§ 04 · the shapes"
          title="Four ways to call."
          lede="Because the transport itself can stream, an RPC no longer has to be one-in-one-out. It can be a channel between two machines."
        />
        <div className="gx-prose">
          <Reveal base="gx-fade">
            <p>
              Mark either side of a method{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                stream
              </code>{' '}
              in the{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                .proto
              </code>{' '}
              and gRPC generates a different shape of call. Pick each one below and watch how the
              messages move.
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <RpcTypesLab />
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 28 }}>
              Streaming raises the question every channel faces:{' '}
              <em>what if the receiver is slower than the sender?</em> Without an answer, a fast
              producer either drowns a slow consumer or quietly blows up memory by buffering work
              that never drains, and either way the stream eventually falls over. The protocol has a
              built-in answer. <strong>Flow control</strong>. Inherited straight from HTTP/2, the
              receiver advertises a window, and the sender stops the moment that window is full.
              Drag the consumer slower and watch the sender pause itself:
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <FlowControlLab />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
