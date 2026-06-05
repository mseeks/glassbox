import { SectionHeader } from '../components/Section.jsx';
import { LabFrame } from '../components/widgets.jsx';
import DhtLab from '../labs/DhtLab.jsx';

// §05 — the distributed hash table: a directory with no center. Kademlia's four
// strokes, and the logarithmic "getting warmer" lookup.
export default function Dht() {
  return (
    <section id="dht" className="tor-section">
      <div className="tor-wrap">
        <SectionHeader
          n="05"
          kicker="Distributed hash table"
          title="A directory with no {}"
          em="center"
        />
        <div className="tor-prose tor-rv">
          <p>
            So the protocol distributed the introductions themselves. Here's the puzzle: you have a
            key — the infohash — and you want its value, the peer list. But you refuse to keep that
            map on any central server, so you scatter it across millions of nodes. Which raises two
            questions at once. Which node holds the entry for a given key? And how do you reach that
            node with no directory to consult?
          </p>
          <p>
            The answer is a <strong>distributed hash table</strong>, in the Kademlia design, and it
            comes in four strokes. Nodes and keys share one address space — every node picks a
            random ID from the same space as the infohashes. A key's peer list lives on the nodes
            whose IDs sit <em>closest</em> to it. Distance is measured by combining two IDs with
            exclusive-or, which really just counts how many leading bits they share. And every node
            keeps a routing table dense with nearby nodes and sparse far away.
          </p>
        </div>
        <div className="tor-pull tor-rv">
          Every hop clears at least one more shared bit — so it{' '}
          <span className="tor-t">roughly halves</span> the distance that's left.
        </div>
        <div className="tor-prose tor-rv">
          <p>
            That's why a lookup among millions finishes in around twenty hops: the same logarithmic
            shape that keeps a balanced tree shallow. It's a phone book with no publisher, played as
            a game of <em>getting warmer</em>. Run one and watch the shared prefix grow:
          </p>
        </div>
      </div>
      <div className="tor-wrap-wide">
        <LabFrame label="A lookup, getting warmer" sub="Kademlia · 512 nodes">
          <DhtLab />
        </LabFrame>
      </div>
    </section>
  );
}
