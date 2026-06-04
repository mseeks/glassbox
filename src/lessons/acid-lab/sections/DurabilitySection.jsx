import { forwardRef } from 'react';
import { SectionDivider } from '../components/SectionDivider.jsx';
import { renderProseMarkdown } from '../components/helpers.js';

export const DurabilitySection = forwardRef(function DurabilitySection(_props, ref) {
  return (
    <>
      <div ref={ref} style={{ scrollMarginTop: 16, marginTop: 32 }}>
        <SectionDivider
          letter="D"
          kicker="The persistence axis"
          name="Durability"
          accent="var(--iso-amber)"
          intro="Atomicity tells you the WAL becomes truth at commit time. Durability tells you *where the WAL lives*, and which kinds of failures it can outlive. fsync, replication, group commit: the layered defense behind the word *committed*."
        />
      </div>
      <DurabilityBody />
    </>
  );
});

function DurabilityBody() {
  return (
    <div
      style={{
        maxWidth: 880,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div className="iso-card" style={{ padding: '24px 28px', borderRadius: 12 }}>
        <div
          className="iso-ui"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(var(--iso-ink-rgb), 0.72)',
            marginBottom: 6,
          }}
        >
          The persistence stack
        </div>
        <h3
          className="iso-display"
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--ink)',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          What "committed" really means
        </h3>

        <div className="iso-rule-short" style={{ margin: '20px 0' }} />

        <p
          className="iso-body"
          style={{
            fontSize: 16,
            lineHeight: 1.65,
            color: 'rgba(var(--iso-ink-rgb), 0.85)',
            margin: '0 0 22px',
          }}
          dangerouslySetInnerHTML={{
            __html: renderProseMarkdown(
              'Durability is the promise that **once a commit is acknowledged, it cannot be lost**. Ever. Atomicity tells you the WAL becomes the source of truth at commit time. Durability is about *where the WAL actually lives*, and which kinds of failures can wipe it.',
            ),
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Layer
            label="Application memory"
            sublabel="volatile"
            description="The application calls COMMIT. Until the database confirms, it knows nothing."
            survives="–"
            color="rgba(var(--iso-ink-rgb), 0.7)"
          />
          <Arrow label="commit request" />
          <Layer
            label="Database buffer (memory)"
            sublabel="volatile"
            description="WAL entries are written to the DB's in-memory buffer. Fast, but a power outage erases everything here."
            survives="✗ lost on crash"
            survivesColor="var(--iso-coral)"
            color="var(--iso-amber)"
          />
          <Arrow
            label={
              <>
                <strong style={{ color: 'var(--iso-amber)' }}>fsync()</strong> &nbsp;&ndash; the
                buffer is forced to disk
              </>
            }
          />
          <Layer
            label="Local disk (WAL + data)"
            sublabel="durable on this machine"
            description="After fsync returns, the WAL entry is on physical storage. It will outlive a process crash, OS crash, or power outage on this machine."
            survives="✓ survives crash · ✗ lost if disk dies"
            survivesColor="var(--iso-green)"
            color="var(--iso-violet)"
          />
          <Arrow
            label={
              <>
                <strong style={{ color: 'var(--iso-teal)' }}>replicate</strong> &nbsp;&ndash; send
                the entry to other nodes
              </>
            }
          />
          <Layer
            label="Replicas (N other nodes)"
            sublabel="durable across machines"
            description="Each replica stores its own copy. As long as a quorum survives, the commit survives. This is what lets databases promise durability through node failure, datacenter outages, even regional disasters."
            survives="✓ survives node loss"
            survivesColor="var(--iso-green)"
            color="var(--iso-teal)"
          />
        </div>

        <div
          style={{
            marginTop: 22,
            padding: '14px 16px',
            borderRadius: 8,
            background: 'rgba(var(--iso-ink-rgb), 0.04)',
            border: '1px solid rgba(var(--iso-ink-rgb), 0.08)',
          }}
        >
          <div
            className="iso-ui"
            style={{
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(var(--iso-ink-rgb), 0.72)',
              marginBottom: 8,
            }}
          >
            The big design knob
          </div>
          <p
            className="iso-body"
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'rgba(var(--iso-ink-rgb), 0.78)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{
              __html: renderProseMarkdown(
                "**Synchronous replication** waits for replicas to acknowledge before reporting commit success. Stronger durability, higher latency. **Asynchronous replication** acknowledges as soon as the local WAL is fsync'd; replicas catch up later. Faster, but a node failure can lose the most recent commits. Most production systems compromise: *quorum* writes (acknowledge after a majority of replicas have it) for the right balance.",
              ),
            }}
          />
        </div>

        <div
          style={{
            marginTop: 14,
            padding: '14px 16px',
            borderRadius: 8,
            background: 'rgba(var(--iso-ink-rgb), 0.04)',
            border: '1px solid rgba(var(--iso-ink-rgb), 0.08)',
          }}
        >
          <div
            className="iso-ui"
            style={{
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(var(--iso-ink-rgb), 0.72)',
              marginBottom: 8,
            }}
          >
            The optimization that pays everywhere
          </div>
          <p
            className="iso-body"
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'rgba(var(--iso-ink-rgb), 0.78)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{
              __html: renderProseMarkdown(
                "**Group commit** batches many transactions' WAL entries into a single fsync. fsync is expensive, because it forces the OS to actually write to physical storage, so amortizing one fsync across many commits is a huge throughput win. The transactions still have individual COMMIT markers; they're just all flushed together.",
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Layer({ label, sublabel, description, survives, survivesColor, color }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 8,
        background: 'var(--iso-inset)',
        border: `1px solid ${color}33`,
        borderLeftWidth: 3,
        borderLeftColor: color,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            className="iso-display"
            style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}
          >
            {label}
          </span>
          <span
            className="iso-ui"
            style={{
              fontSize: 10,
              color: color,
              marginLeft: 8,
              letterSpacing: '0.06em',
            }}
          >
            {sublabel}
          </span>
        </div>
        <span
          className="iso-mono"
          style={{ fontSize: 11, color: survivesColor || color, fontWeight: 500 }}
        >
          {survives}
        </span>
      </div>
      <div
        className="iso-body"
        style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(var(--iso-ink-rgb), 0.7)' }}
      >
        {description}
      </div>
    </div>
  );
}

function Arrow({ label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '4px 0',
      }}
    >
      <span className="iso-ui" style={{ fontSize: 11, color: 'rgba(var(--iso-ink-rgb), 0.72)' }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: 'rgba(var(--iso-ink-rgb), 0.78)' }}>↓</span>
    </div>
  );
}
