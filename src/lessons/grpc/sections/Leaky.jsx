import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Callout from '../components/Callout.jsx';
import StatusGrid from '../components/StatusGrid.jsx';

// § 05 — the deliberate leak: deadlines, cancellation, and typed status codes.
// gRPC keeps the shape of a call but refuses to hide that it can fail.
export default function Leaky() {
  return (
    <section className="gx-block">
      <div className="gx-section">
        <SectionHead
          tag="§ 05 · the leak"
          title="It is not a local call."
          lede="The dream is to forget the network. The discipline is remembering exactly where it bleeds through."
        />
        <div className="gx-prose">
          <Reveal base="gx-fade">
            <p className="gx-dropcap">
              A local call can't time out, can't half-arrive, can't fail because a switch died. A
              remote one can do all three. Every robust gRPC service treats these not as edge cases
              but as the normal weather:
            </p>
            <p>
              <strong>Deadlines, not timeouts.</strong> The client sets an absolute deadline and
              gRPC <em>propagates</em> it across every downstream hop. If the budget is 200ms and
              180 are already spent, the next service starts knowing it has 20ms left. The whole
              tree gives up together instead of piling up doomed work.
            </p>
            <p>
              <strong>Cancellation flows.</strong> If the caller hangs up, the cancellation signal
              travels down the call tree so servers stop wasting effort on a result nobody will
              read. In Go this is just the{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                context.Context
              </code>{' '}
              you thread through every handler.
            </p>
            <p>
              <strong>Errors are a typed status, not an exception.</strong> Every call ends with one
              of ~17 codes. The code tells you whether retrying is sane:
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <StatusGrid />
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 26 }}>
              Here is the whole story in one call site. The generated stub makes{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                Withdraw
              </code>{' '}
              look like an ordinary Go method. Yet the deadline, the cancellation, and the typed
              status are all right there in the open:
            </p>
            <div className="gx-code">
              <span className="cm">// looks local — but every failure mode is in your hands</span>
              {'\n'}
              ctx, cancel <span className="pu">:=</span> context.
              <span className="fn">WithTimeout</span>
              (ctx, <span className="nu">200</span>
              <span className="pu">*</span>time.Millisecond){'\n'}
              <span className="kw">defer</span> <span className="fn">cancel</span>(){'\n\n'}
              res, err <span className="pu">:=</span> client.<span className="fn">Withdraw</span>
              (ctx, <span className="pu">&</span>
              <span className="ty">bankpb</span>.Req{'{'}Cents: <span className="nu">100</span>
              {'}'}){'\n'}
              <span className="kw">if</span> err <span className="pu">!=</span>{' '}
              <span className="kw">nil</span> {'{'}
              {'\n'}
              {'    '}
              <span className="kw">switch</span> status.<span className="fn">Code</span>(err) {'{'}
              {'\n'}
              {'    '}
              <span className="kw">case</span> codes.Unavailable:{'      '}
              <span className="cm">// transient — retry IF idempotent</span>
              {'\n'}
              {'        '}
              <span className="kw">return</span> <span className="fn">retryWithBackoff</span>(ctx)
              {'\n'}
              {'    '}
              <span className="kw">case</span> codes.DeadlineExceeded:{' '}
              <span className="cm">// budget spent; may have run</span>
              {'\n'}
              {'        '}
              <span className="kw">return</span> err{'\n'}
              {'    '}
              {'}'}
              {'\n'}
              {'}'}
              {'\n'}
              log.<span className="fn">Printf</span>(<span className="st">"new balance: %d"</span>,
              res.Balance)
            </div>
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 26 }}>
              <strong>Retries demand idempotency.</strong>{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                UNAVAILABLE
              </code>{' '}
              looks retryable. But if the first attempt actually ran before the connection dropped,
              a blind retry on{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                Withdraw
              </code>{' '}
              debits twice. Safe retries need operations that can run more than once with the same
              effect, usually via an idempotency key. The network's unreliability is not abstracted
              away; it is handed to you to design around.
            </p>
            <Callout kind="info">
              <b>The honest framing.</b> gRPC keeps the <em>shape</em> of a function call, with
              typed arguments, a typed return, and a clean call site, yet it deliberately does{' '}
              <b>not</b> hide that the call can be slow, cancelled, or fail. The leak is the
              feature. It forces you to handle the network instead of pretending it isn't there.
            </Callout>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
