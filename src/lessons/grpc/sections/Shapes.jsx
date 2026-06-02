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
          lede="Because the transport streams, an RPC doesn't have to be one-in-one-out. It can be a channel between two machines."
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
              and gRPC generates a different shape of call. Pick each and watch the message flow:
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <RpcTypesLab />
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 28 }}>
              Streaming raises the question every channel faces:{' '}
              <em>what if the receiver is slower than the sender?</em> Without an answer, a fast
              producer either drowns a slow consumer or blows up memory buffering. gRPC inherits
              HTTP/2's <strong>flow control</strong> — the receiver advertises a window, and the
              sender stops when it's full. Drag the consumer slower and watch the sender pause
              itself:
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
