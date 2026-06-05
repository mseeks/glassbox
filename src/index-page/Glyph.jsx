function Glyph({ kind, color }) {
  switch (kind) {
    case 'threads':
      // Two thread "ribbons" moving past each other — concurrency identity.
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <line
            x1="2"
            y1="12"
            x2="86"
            y2="12"
            stroke={color}
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <line
            x1="2"
            y1="26"
            x2="86"
            y2="26"
            stroke={color}
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          {[6, 22, 38, 54, 70].map((x) => (
            <circle key={`a-${x}`} cx={x} cy="12" r="2.4" fill={color} />
          ))}
          {[14, 30, 46, 62, 78].map((x) => (
            <circle key={`b-${x}`} cx={x} cy="26" r="2.4" fill={color} fillOpacity="0.6" />
          ))}
        </svg>
      );
    case 'acid': {
      // A · C · I · D — four pills, italicized.
      const letters = ['A', 'C', 'I', 'D'];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {letters.map((ch, i) => (
            <g key={ch} transform={`translate(${i * 22 + 2} 6)`}>
              <rect
                width="18"
                height="26"
                rx="2"
                fill="none"
                stroke={color}
                strokeOpacity="0.55"
                strokeWidth="0.9"
              />
              <text
                x="9"
                y="19"
                textAnchor="middle"
                fontFamily="Fraunces, serif"
                fontStyle="italic"
                fontWeight="400"
                fontSize="14"
                fill={color}
              >
                {ch}
              </text>
            </g>
          ))}
        </svg>
      );
    }
    case 'partition': {
      // Two data-center halves with a severed link — CAP/PACELC identity.
      const left = [
        { x: 18, y: 12 },
        { x: 10, y: 27 },
        { x: 28, y: 27 },
      ];
      const right = [
        { x: 70, y: 12 },
        { x: 60, y: 27 },
        { x: 80, y: 27 },
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {[left, right].flatMap((group, groupIndex) =>
            group.map((node, i) => {
              const next = group[(i + 1) % group.length];
              return (
                <line
                  key={`${groupIndex}-${i}`}
                  x1={node.x}
                  y1={node.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={color}
                  strokeOpacity="0.24"
                  strokeWidth="0.8"
                />
              );
            }),
          )}
          <line
            x1="34"
            y1="19"
            x2="54"
            y2="19"
            stroke={color}
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          <path d="M43 5 L38 18 L47 18 L42 33" fill="none" stroke={color} strokeWidth="1.4" />
          {[...left, ...right].map((node, i) => (
            <circle
              key={`p-${i}`}
              cx={node.x}
              cy={node.y}
              r="3"
              fill={color}
              fillOpacity={i < 3 ? 0.75 : 1}
            />
          ))}
        </svg>
      );
    }
    case 'cluster': {
      // 6-node ring with a probe line — SWIM identity.
      const cx = 44;
      const cy = 19;
      const r = 14;
      const nodes = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      });
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {nodes.map((p, i) => {
            const next = nodes[(i + 1) % nodes.length];
            return (
              <line
                key={`e-${i}`}
                x1={p.x}
                y1={p.y}
                x2={next.x}
                y2={next.y}
                stroke={color}
                strokeOpacity="0.22"
                strokeWidth="0.6"
              />
            );
          })}
          <line
            x1={nodes[0].x}
            y1={nodes[0].y}
            x2={nodes[3].x}
            y2={nodes[3].y}
            stroke={color}
            strokeWidth="1.1"
            strokeDasharray="2 2"
          />
          {nodes.map((p, i) => (
            <circle
              key={`n-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === 0 || i === 3 ? 3 : 2}
              fill={color}
              fillOpacity={i === 0 || i === 3 ? 1 : 0.55}
            />
          ))}
        </svg>
      );
    }
    case 'datagrams': {
      // UDP datagrams: some arrive, one drops, one duplicates.
      const packets = [
        { x: 7, y: 10, opacity: 1 },
        { x: 25, y: 22, opacity: 0.75 },
        { x: 43, y: 8, opacity: 0.35 },
        { x: 57, y: 24, opacity: 1 },
        { x: 70, y: 14, opacity: 0.6 },
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <line x1="4" y1="30" x2="84" y2="7" stroke={color} strokeOpacity="0.18" strokeWidth="1" />
          {packets.map((packet, i) => (
            <rect
              key={`d-${i}`}
              x={packet.x}
              y={packet.y}
              width="10"
              height="7"
              rx="1.5"
              fill={color}
              fillOpacity={packet.opacity}
            />
          ))}
          <path d="M42 23 l8 8 m0 -8 l-8 8" stroke={color} strokeWidth="1.2" strokeOpacity="0.7" />
        </svg>
      );
    }
    case 'bits': {
      // 4 rows × 12 cols bit grid — Bloom signature.
      const pattern = [
        [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1],
        [0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
        [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1],
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {pattern.flatMap((row, r) =>
            row.map((b, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 7 + 2}
                y={r * 8 + 3}
                width="5"
                height="5"
                rx="0.5"
                fill={b ? color : 'var(--idx-glyph-off)'}
                fillOpacity={b ? 0.85 : 1}
              />
            )),
          )}
        </svg>
      );
    }
    case 'bloom-clock': {
      // Counting Bloom Clock bars wrapped in a causal arrow.
      const bars = [9, 18, 12, 28, 16, 24, 7, 21];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <path
            d="M18 19 C18 8 31 5 43 11 C55 17 61 8 70 8"
            fill="none"
            stroke={color}
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <path
            d="M66 4 L72 8 L66 12"
            fill="none"
            stroke={color}
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          {bars.map((height, i) => (
            <rect
              key={`bc-${i}`}
              x={i * 8 + 13}
              y={32 - height}
              width="4"
              height={height}
              rx="1"
              fill={color}
              fillOpacity={i % 3 === 0 ? 1 : 0.55}
            />
          ))}
        </svg>
      );
    }
    case 'fingerprints': {
      // Cuckoo filter: fingerprints sit in buckets; one relocates to its
      // alternate slot — the eviction move that names the structure.
      const buckets = [8, 28, 48, 68];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <path
            d="M16 12 C28 2, 48 2, 60 12"
            fill="none"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <path
            d="M57 7 L61 12 L55 13"
            fill="none"
            stroke={color}
            strokeOpacity="0.75"
            strokeWidth="1"
          />
          {buckets.map((x, i) => (
            <g key={x}>
              <rect
                x={x}
                y="18"
                width="14"
                height="16"
                rx="2"
                fill="none"
                stroke={color}
                strokeOpacity="0.42"
                strokeWidth="0.9"
              />
              {i < 3 && (
                <>
                  <path
                    d={`M${x + 3} 24 q4 -3 8 0`}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity={i === 0 ? 1 : 0.6}
                  />
                  <path
                    d={`M${x + 3} 28 q4 -3 8 0`}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity={i === 0 ? 1 : 0.6}
                  />
                </>
              )}
            </g>
          ))}
        </svg>
      );
    }
    case 'strata': {
      // LSM tree: time becomes depth. Newest layer brightest on top; a borehole
      // (read) drills down and takes the first thing it hits.
      const layers = [
        { y: 5, w: 30, o: 1 },
        { y: 12, w: 44, o: 0.78 },
        { y: 19, w: 58, o: 0.58 },
        { y: 26, w: 72, o: 0.4 },
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {layers.map((l, i) => (
            <rect
              key={i}
              x="8"
              y={l.y}
              width={l.w}
              height="5"
              rx="1"
              fill={color}
              fillOpacity={l.o}
            />
          ))}
          <line
            x1="68"
            y1="2"
            x2="68"
            y2="35"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <path
            d="M65 31 L68 35 L71 31"
            fill="none"
            stroke={color}
            strokeOpacity="0.8"
            strokeWidth="1"
          />
        </svg>
      );
    }
    case 'core': {
      // Magnetic core memory: ferrite rings threaded on a woven wire grid,
      // a few flipped to 1 — the literal fabric of early memory.
      const cols = [16, 32, 48, 64];
      const rows = [13, 26];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {rows.map((y, r) => (
            <line
              key={`h-${r}`}
              x1="6"
              y1={y}
              x2="74"
              y2={y}
              stroke={color}
              strokeOpacity="0.22"
              strokeWidth="0.7"
            />
          ))}
          {cols.map((x, c) => (
            <line
              key={`v-${c}`}
              x1={x}
              y1="5"
              x2={x}
              y2="34"
              stroke={color}
              strokeOpacity="0.22"
              strokeWidth="0.7"
            />
          ))}
          {rows.flatMap((y, r) =>
            cols.map((x, c) => {
              const set = (r + c) % 3 === 0;
              return (
                <circle
                  key={`${r}-${c}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={set ? color : 'none'}
                  fillOpacity={set ? 0.8 : 1}
                  stroke={color}
                  strokeOpacity="0.7"
                  strokeWidth="1.1"
                />
              );
            }),
          )}
        </svg>
      );
    }
    case 'merkle': {
      // Merkle tree: four leaves hash pairwise up to a single sealed root.
      const root = { x: 44, y: 7 };
      const mid = [
        { x: 26, y: 20 },
        { x: 62, y: 20 },
      ];
      const leaves = [
        { x: 14, y: 33 },
        { x: 34, y: 33 },
        { x: 54, y: 33 },
        { x: 74, y: 33 },
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {mid.map((m, i) => (
            <line
              key={`rm-${i}`}
              x1={root.x}
              y1={root.y}
              x2={m.x}
              y2={m.y}
              stroke={color}
              strokeOpacity="0.4"
              strokeWidth="0.9"
            />
          ))}
          {leaves.map((l, i) => (
            <line
              key={`ml-${i}`}
              x1={mid[Math.floor(i / 2)].x}
              y1={mid[Math.floor(i / 2)].y}
              x2={l.x}
              y2={l.y}
              stroke={color}
              strokeOpacity="0.4"
              strokeWidth="0.9"
            />
          ))}
          {leaves.map((l, i) => (
            <rect
              key={`l-${i}`}
              x={l.x - 3}
              y={l.y - 3}
              width="6"
              height="6"
              rx="1"
              fill={color}
              fillOpacity="0.55"
            />
          ))}
          {mid.map((m, i) => (
            <circle key={`m-${i}`} cx={m.x} cy={m.y} r="3" fill={color} fillOpacity="0.75" />
          ))}
          <circle cx={root.x} cy={root.y} r="5" fill="none" stroke={color} strokeWidth="1.4" />
          <circle cx={root.x} cy={root.y} r="2" fill={color} />
        </svg>
      );
    }
    case 'digest': {
      // SHA: arbitrary-length input on the left, compressed by the machine into
      // a short fixed-length digest on the right.
      const inputs = [10, 24, 14, 28, 18];
      const digest = [60, 67, 74, 81];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {inputs.map((w, i) => (
            <line
              key={`in-${i}`}
              x1="3"
              y1={6 + i * 6.5}
              x2={3 + w}
              y2={6 + i * 6.5}
              stroke={color}
              strokeOpacity="0.4"
              strokeWidth="1.4"
            />
          ))}
          <rect
            x="38"
            y="9"
            width="12"
            height="20"
            rx="2"
            fill="none"
            stroke={color}
            strokeOpacity="0.8"
            strokeWidth="1.1"
          />
          <path
            d="M41 15 L47 19 L41 23"
            fill="none"
            stroke={color}
            strokeOpacity="0.9"
            strokeWidth="1"
          />
          {digest.map((x, i) => (
            <rect
              key={`d-${i}`}
              x={x}
              y="15"
              width="5"
              height="8"
              rx="1"
              fill={color}
              fillOpacity={i % 2 === 0 ? 0.9 : 0.55}
            />
          ))}
        </svg>
      );
    }
    case 'trie': {
      // Trie: a root branches into shared word-paths; filled nodes mark where a
      // word ends. The route is the word.
      const edges = [
        [8, 19, 26, 10],
        [8, 19, 26, 28],
        [26, 10, 48, 6],
        [26, 10, 48, 15],
        [26, 28, 48, 24],
        [26, 28, 48, 33],
        [48, 6, 68, 6],
        [48, 24, 68, 24],
      ];
      const nodes = [
        [26, 10],
        [26, 28],
        [48, 6],
        [48, 15],
        [48, 24],
        [48, 33],
      ];
      const terminals = [
        [68, 6],
        [68, 24],
        [48, 15],
        [48, 33],
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {edges.map(([x1, y1, x2, y2], i) => (
            <line
              key={`e-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeOpacity="0.42"
              strokeWidth="1"
            />
          ))}
          {nodes.map(([x, y], i) => (
            <circle key={`n-${i}`} cx={x} cy={y} r="2" fill={color} fillOpacity="0.55" />
          ))}
          {terminals.map(([x, y], i) => (
            <circle key={`t-${i}`} cx={x} cy={y} r="2.7" fill={color} />
          ))}
          <circle cx="8" cy="19" r="3" fill={color} />
        </svg>
      );
    }
    case 'btree': {
      // B-tree: a wide multi-key root page fanning out to child pages — the
      // card-catalog drawer split into ranges. The route is a handful of seeks.
      const root = { x: 26, y: 3, w: 36, h: 11 };
      const cells = 3;
      const children = [
        { x: 6, y: 26, w: 16, h: 9 },
        { x: 36, y: 26, w: 16, h: 9 },
        { x: 66, y: 26, w: 16, h: 9 },
      ];
      const ptrs = [root.x + 3, root.x + root.w / 2, root.x + root.w - 3];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {children.map((c, i) => {
            const cx = c.x + c.w / 2;
            const px = ptrs[i];
            return (
              <path
                key={`e-${i}`}
                d={`M ${px} ${root.y + root.h} C ${px} 21, ${cx} 21, ${cx} ${c.y}`}
                fill="none"
                stroke={color}
                strokeOpacity="0.4"
                strokeWidth="0.9"
              />
            );
          })}
          <rect
            x={root.x}
            y={root.y}
            width={root.w}
            height={root.h}
            rx="2"
            fill="none"
            stroke={color}
            strokeWidth="1.1"
            strokeOpacity="0.85"
          />
          {[1, 2].map((j) => (
            <line
              key={`d-${j}`}
              x1={root.x + (root.w / cells) * j}
              y1={root.y + 1.5}
              x2={root.x + (root.w / cells) * j}
              y2={root.y + root.h - 1.5}
              stroke={color}
              strokeOpacity="0.45"
              strokeWidth="0.8"
            />
          ))}
          {children.map((c, i) => (
            <rect
              key={`c-${i}`}
              x={c.x}
              y={c.y}
              width={c.w}
              height={c.h}
              rx="1.5"
              fill={color}
              fillOpacity={i === 1 ? 0.5 : 0.32}
              stroke={color}
              strokeOpacity="0.5"
              strokeWidth="0.8"
            />
          ))}
        </svg>
      );
    }
    case 'hyperloglog': {
      // HyperLogLog: a bank of registers, each holding the longest run of
      // leading zeros it has seen — one spikes highest, the rarest flicker.
      const heights = [5, 9, 6, 12, 7, 20, 8, 6, 11, 7, 9];
      const baseY = 33;
      const bw = 5;
      const step = 7;
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <line
            x1="4"
            y1={baseY}
            x2="84"
            y2={baseY}
            stroke={color}
            strokeOpacity="0.25"
            strokeWidth="0.8"
          />
          {heights.map((h, i) => (
            <rect
              key={i}
              x={5 + i * step}
              y={baseY - h}
              width={bw}
              height={h}
              rx="1"
              fill={color}
              fillOpacity={h >= 18 ? 1 : 0.5}
            />
          ))}
        </svg>
      );
    }
    case 'vptree': {
      // Vantage-point tree: a landmark at center, nested distance shells, and
      // the scattered contacts it files by range — a query hunts from the edge.
      const cx = 30;
      const cy = 19;
      const rings = [7, 13, 18];
      const dots = [
        [12, 9],
        [20, 28],
        [44, 8],
        [52, 28],
        [40, 31],
        [60, 6],
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {rings.map((r, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeOpacity={i === 1 ? 0.6 : 0.25}
              strokeWidth={i === 1 ? 1 : 0.7}
              strokeDasharray={i === 1 ? 'none' : '2 2'}
            />
          ))}
          {dots.map(([x, y], i) => (
            <circle
              key={`d-${i}`}
              cx={x}
              cy={y}
              r="1.6"
              fill={color}
              fillOpacity={x < cx + 18 ? 0.8 : 0.4}
            />
          ))}
          <circle cx={cx} cy={cy} r="2.2" fill={color} />
          <g stroke={color} strokeWidth="1" strokeOpacity="0.85">
            <line x1="64" y1="26" x2="72" y2="26" />
            <line x1="68" y1="22" x2="68" y2="30" />
          </g>
          <circle
            cx="68"
            cy="26"
            r="3"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />
        </svg>
      );
    }
    case 'tls': {
      // TLS: a sealed padlock spanning the wire — plaintext on the left, the
      // channel locked end to end on the right.
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <line
            x1="4"
            y1="19"
            x2="32"
            y2="19"
            stroke={color}
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <line
            x1="56"
            y1="19"
            x2="84"
            y2="19"
            stroke={color}
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <path
            d="M38 17 V13 a6 6 0 0 1 12 0 V17"
            fill="none"
            stroke={color}
            strokeOpacity="0.7"
            strokeWidth="1.4"
          />
          <rect
            x="34"
            y="17"
            width="20"
            height="15"
            rx="2.5"
            fill={color}
            fillOpacity="0.18"
            stroke={color}
            strokeWidth="1.3"
          />
          <circle cx="44" cy="23" r="2" fill={color} />
          <rect x="43.2" y="24.5" width="1.6" height="4" rx="0.6" fill={color} />
        </svg>
      );
    }
    case 'grpc': {
      // gRPC "on the wire": a row of byte tokens riding a signal line — the
      // tag/length/value strip that is the lesson's visual language. The first
      // cell is the tag, the second an outlined length prefix, the rest values.
      const cells = [
        { x: 4, fill: 0.9 },
        { x: 16, fill: 0 },
        { x: 28, fill: 0.5 },
        { x: 40, fill: 0.72 },
        { x: 52, fill: 0.42 },
        { x: 64, fill: 0.62 },
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <line
            x1="2"
            y1="19"
            x2="86"
            y2="19"
            stroke={color}
            strokeOpacity="0.22"
            strokeWidth="1"
          />
          {cells.map((c, i) => (
            <rect
              key={i}
              x={c.x}
              y="13"
              width="10"
              height="12"
              rx="2"
              fill={c.fill ? color : 'none'}
              fillOpacity={c.fill || 1}
              stroke={color}
              strokeOpacity={c.fill ? 0 : 0.7}
              strokeWidth="1"
            />
          ))}
          <path
            d="M78 14 l4 5 l-4 5"
            fill="none"
            stroke={color}
            strokeOpacity="0.8"
            strokeWidth="1.2"
          />
        </svg>
      );
    }
    case 'paxos': {
      // Quorum overlap — two majorities of five drawn as arcs that must share a
      // single node, the witness (filled), the hinge of Paxos's safety.
      const xs = [12, 28, 44, 60, 76];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <path
            d="M12 21 Q28 6 44 21"
            fill="none"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          <path
            d="M44 21 Q60 36 76 21"
            fill="none"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          {xs.map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy="21"
              r={i === 2 ? 3.6 : 3}
              fill={i === 2 ? color : 'none'}
              stroke={color}
              strokeOpacity={i === 2 ? 0 : 0.65}
              strokeWidth="1"
            />
          ))}
        </svg>
      );
    }
    case 'binary-trees': {
      // A drafting-table search descent: a small tree whose left branch is traced
      // at full strength (the path taken) while the right branch is thrown away.
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <line
            x1="44"
            y1="9"
            x2="26"
            y2="29"
            stroke={color}
            strokeOpacity="0.9"
            strokeWidth="1.6"
          />
          <line
            x1="44"
            y1="9"
            x2="62"
            y2="29"
            stroke={color}
            strokeOpacity="0.28"
            strokeWidth="1"
          />
          {[
            { x: 44, y: 9, on: false },
            { x: 26, y: 29, on: true },
            { x: 62, y: 29, on: false },
          ].map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r="4"
              fill={n.on ? color : 'none'}
              stroke={color}
              strokeOpacity={n.on ? 0 : 0.6}
              strokeWidth="1.1"
            />
          ))}
        </svg>
      );
    }
    case 'sstables': {
      // A letterpress forme: a sparse index column, stacked sorted-key rows, a
      // descending scan line, and a sealed footer stamp — the immutable page.
      const ys = [9, 17, 25, 33];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {ys.map((y) => (
            <circle key={`i-${y}`} cx="7" cy={y} r="1.6" fill={color} fillOpacity="0.85" />
          ))}
          {ys.map((y, i) => (
            <line
              key={`r-${y}`}
              x1="15"
              y1={y}
              x2={[52, 60, 44, 56][i]}
              y2={y}
              stroke={color}
              strokeOpacity="0.4"
              strokeWidth="1.4"
            />
          ))}
          <line x1="16" y1="5" x2="56" y2="37" stroke={color} strokeOpacity="0.7" strokeWidth="1" />
          <rect
            x="66"
            y="11"
            width="16"
            height="16"
            rx="2"
            fill="none"
            stroke={color}
            strokeOpacity="0.75"
            strokeWidth="1.1"
          />
          <path
            d="M70 19 l3 3 l6 -7"
            fill="none"
            stroke={color}
            strokeOpacity="0.85"
            strokeWidth="1.2"
          />
        </svg>
      );
    }
    case 'saga-thread': {
      // The saga thread: four step-nodes on a forward line, the first three
      // committed (filled), with a dashed compensation arc bending back to undo.
      const xs = [11, 30, 49, 68];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          <line
            x1="11"
            y1="26"
            x2="68"
            y2="26"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1.2"
          />
          <path
            d="M68 26 C68 6 11 6 11 26"
            fill="none"
            stroke={color}
            strokeOpacity="0.6"
            strokeWidth="1.1"
            strokeDasharray="3 2.5"
          />
          <path
            d="M15 22 l-4 4 l4 4"
            fill="none"
            stroke={color}
            strokeOpacity="0.7"
            strokeWidth="1.1"
          />
          {xs.map((x, i) => (
            <rect
              key={x}
              x={x - 3.5}
              y="22.5"
              width="7"
              height="7"
              rx="1.5"
              fill={i < 3 ? color : 'none'}
              fillOpacity={i < 3 ? 0.85 : 1}
              stroke={color}
              strokeOpacity={i < 3 ? 0 : 0.7}
              strokeWidth="1.1"
            />
          ))}
        </svg>
      );
    }
    case 'torrents-constellation': {
      // A swarm as a constellation: one warm hub joined by thin signal threads to
      // a scatter of peer-stars, two of the threads drawn as dashed live transfers.
      const peers = [
        { x: 12, y: 9, dash: false },
        { x: 24, y: 31, dash: true },
        { x: 66, y: 8, dash: false },
        { x: 78, y: 27, dash: true },
        { x: 58, y: 33, dash: false },
        { x: 30, y: 6, dash: false },
      ];
      return (
        <svg className="idx-card-glyph" viewBox="0 0 88 38" aria-hidden="true">
          {peers.map((p, i) => (
            <line
              key={`t-${i}`}
              x1="44"
              y1="19"
              x2={p.x}
              y2={p.y}
              stroke={color}
              strokeOpacity="0.3"
              strokeWidth="0.8"
              strokeDasharray={p.dash ? '2 2' : undefined}
            />
          ))}
          {peers.map((p, i) => (
            <circle key={`p-${i}`} cx={p.x} cy={p.y} r="2" fill={color} fillOpacity="0.7" />
          ))}
          <circle cx="44" cy="19" r="3.4" fill={color} />
        </svg>
      );
    }
    default:
      return null;
  }
}

export default Glyph;
