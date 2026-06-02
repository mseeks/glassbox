import { Chapter } from '../components/Chapter.jsx';

export function Ch09InProduction() {
  return (
    <Chapter num="09" title="In Production" anchor="ch-09">
      <p>Where these things actually live.</p>
      <p>
        <strong>LSM trees</strong> — RocksDB, LevelDB, Cassandra, ScyllaDB — keep a Bloom or Ribbon
        filter per SSTable. When a key lookup arrives, the engine checks each SSTable's filter in
        order; if the filter says "definitely not," the SSTable is skipped <em>without disk I/O</em>
        . A 1% FPR filter saves about 99% of would-be wasted reads. This is the single biggest
        performance win Bloom filters provide in modern databases.
      </p>
      <p>
        <strong>BigTable</strong> is the paper that put Bloom filters on the map for
        distributed-systems engineers; the SSTable-with-filter pattern is now standard.
      </p>
      <p>
        <strong>CDNs</strong> — Akamai, Cloudflare, and others — use Bloom filters to ask "is this
        object cached anywhere in our network?" before issuing the more expensive lookup against a
        directory.
      </p>
      <p>
        <strong>Bitcoin SPV wallets</strong> historically used Bloom filters to ask full nodes for
        "transactions involving these addresses" without revealing exactly which addresses they
        cared about. A famous attack showed the BF parameters were too narrow — full nodes could
        infer addresses with high probability. Modern SPV (BIP 158) uses compact block filters with
        better privacy properties.
      </p>
      <p>
        <strong>Chrome Safe Browsing</strong> historically used Bloom filters for suspect URL
        checks; the team has since moved to more sophisticated, privacy-aware schemes.
      </p>
      <p>
        <strong>Postgres</strong> has Bloom indexes as a contrib module for fast multi-column
        equality filtering. <strong>Akamai and Cloudflare DDoS pipelines</strong> use them for rapid
        IP-set membership checks.
      </p>
    </Chapter>
  );
}
