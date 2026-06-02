import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Callout from '../components/Callout.jsx';
import MultiplexScope from '../labs/MultiplexScope.jsx';
import CallAnatomy from '../components/CallAnatomy.jsx';

// § 03 — why gRPC had to ride HTTP/2: multiplexed streams kill head-of-line
// blocking, and a call maps onto frames + trailers.
export default function Http2() {
  return (
    <section className="gx-block">
      <div className="gx-section">
        <SectionHead
          tag="§ 03 · the transport"
          title="Why it had to be HTTP/2."
          lede="A fast format is wasted on a transport that can only do one thing at a time."
        />
        <div className="gx-prose">
          <Reveal base="gx-fade">
            <p className="gx-dropcap">
              HTTP/1.1 has a structural ceiling: a connection carries one request/response at a
              time. A slow response blocks everything queued behind it on that connection:{' '}
              <em>head-of-line blocking</em>. Browsers paper over it by opening several connections,
              but for a service making thousands of calls a second, that's a lot of sockets and
              still no real streaming.
            </p>
            <p>
              HTTP/2 breaks every message into <strong>frames</strong> stamped with a{' '}
              <strong>stream id</strong>, then interleaves frames from many concurrent streams over
              a single connection. No queue. Toggle the two transports and play it:
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <MultiplexScope />
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 28 }}>
              gRPC then maps a call onto this directly. The method name is just a path; the request
              and response messages travel as length-prefixed payloads in{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                DATA
              </code>{' '}
              frames; and the final status arrives in <strong>trailers</strong>. That is a second
              header block sent after the body, which is what lets a server stream results before it
              knows the outcome.
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <CallAnatomy />
          </Reveal>
          <Reveal base="gx-fade">
            <Callout kind="info">
              <b>The catch worth knowing.</b> HTTP/2 cures head-of-line blocking{' '}
              <em>in the application</em>, yet the streams still ride one TCP connection, so a
              single lost packet can still stall every one of them at the TCP layer. HTTP/3 fixes
              that. It moves gRPC onto QUIC (over UDP) to close that last gap.
            </Callout>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
