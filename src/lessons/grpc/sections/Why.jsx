import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Callout from '../components/Callout.jsx';
import ThreePillars from '../components/ThreePillars.jsx';

// § 01 — the dream of a function call that crosses the network, and why the
// obvious ways to do it keep failing.
export default function Why() {
  return (
    <section className="gx-block">
      <div className="gx-section">
        <SectionHead
          tag="§ 01 · the dream"
          title="Make the network disappear."
          lede="The oldest idea in distributed computing. And the reason the obvious way to build it keeps failing."
        />
        <div className="gx-prose">
          <Reveal base="gx-fade">
            <p className="gx-dropcap">
              A function call is a beautiful thing. You hand over arguments, you get back a value,
              the types line up, and you don't think about what happens in between.{' '}
              <strong>Remote Procedure Call</strong> wants that exact feeling for a function that
              lives on a different machine: write{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                account.Withdraw(100)
              </code>{' '}
              and let the framework quietly serialize the arguments, ship them across the network,
              run the code over there, and hand the result back.
            </p>
            <p>
              People have chased this for decades. CORBA and SOAP both tried and collapsed under
              ceremony: XML envelopes, brittle tooling, vendor wars. The industry fled to{' '}
              <strong>REST + JSON</strong>, which won on one unbeatable virtue: you can read it, and
              debug it with{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                curl
              </code>
              .
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <p>
              But for dense <em>service-to-service</em> traffic, where no human is reading the
              bytes, REST's virtues become taxes. JSON ships every field <em>name</em> as text on
              every message, then both sides parse strings into numbers. There's no enforced
              contract, so a client and server quietly drift until production finds the mismatch.
              And classic HTTP/1.1 gives you one in-flight request per connection, with no real
              streaming.
            </p>
            <p>
              gRPC (Google, 2015) is the bet that for internal APIs you should{' '}
              <strong>pay for a typed contract and a binary format</strong> and get back speed, code
              generation, streaming, and safety. It stands on three pillars:
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <ThreePillars />
          </Reveal>
          <Reveal base="gx-fade">
            <Callout kind="info">
              <b>Scope.</b> gRPC isn't here to replace your public REST API that browsers and third
              parties call. It's built for the mesh of internal services behind your edge. That is
              the place those three taxes hurt most.
            </Callout>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
