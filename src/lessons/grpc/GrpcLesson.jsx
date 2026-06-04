import Hero from './sections/Hero.jsx';
import Why from './sections/Why.jsx';
import Protobuf from './sections/Protobuf.jsx';
import Http2 from './sections/Http2.jsx';
import Shapes from './sections/Shapes.jsx';
import Leaky from './sections/Leaky.jsx';
import Coda from './sections/Coda.jsx';
import './grpc.css';

/* ════════════════════════════════════════════════════════════════
   gRPC — "on the wire".
   Aesthetic: a protocol analyzer / signal scope on a dark instrument
   deck. A faint graticule, bytes that glow like signal traces, and one
   byte colour code throughout (amber tag · violet length · lime value ·
   cyan signal · coral sin · mint verified).

   Composition root. The pure wire-encoding + multiplexing math lives in
   ./engine (varintBytes / zigzag / encodeField / completionTimes …);
   reusable visuals (Eyebrow, SectionHead, Callout, ByteStrip, the three
   display panels) live in ./components; the six labs live in ./labs; the
   six sections plus Hero live in ./sections. This shell just wires them.
   ════════════════════════════════════════════════════════════════ */
export default function GrpcLesson() {
  return (
    <div className="gx">
      <div className="gx-noise" />
      <div className="gx-wrap">
        <Hero />
        <div className="gx-rule" />
        <Why />
        <Protobuf />
        <Http2 />
        <Shapes />
        <Leaky />
        <Coda />
        <footer
          style={{
            textAlign: 'center',
            padding: '30px 20px 50px',
            color: 'var(--ink-faint2-fn)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.12em',
          }}
        >
          GRPC · ON THE WIRE
        </footer>
      </div>
    </div>
  );
}
