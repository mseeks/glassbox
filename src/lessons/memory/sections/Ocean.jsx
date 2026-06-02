import Head from '../components/Head.jsx';
import ApolloSpeck from '../labs/ApolloSpeck.jsx';

// §04 — An ocean nobody can picture. The abundance we swim in.
export default function Ocean() {
  return (
    <section id="ocean">
      <div className="wrap">
        <Head num="04" kicker="The abundance we swim in" title="An ocean nobody can picture." />
        <div className="rev">
          <p className="lead" style={{ marginBottom: 24 }}>
            We have so much memory now that the human mind has no honest image for it. The only way
            to feel the gap is to fall into it. Below, your phone's memory is the whole sea; the
            computer that reached the Moon is a single drop.
          </p>
        </div>
        <div className="rev">
          <ApolloSpeck />
        </div>
      </div>
    </section>
  );
}
