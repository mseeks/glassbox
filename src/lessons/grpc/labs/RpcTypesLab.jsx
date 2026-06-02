import { useEffect, useState } from 'react';

// The four call shapes gRPC generates depending on which side is marked
// `stream` in the .proto. Pick one and watch the message flow.
const RPC_TYPES = {
  unary: {
    name: 'Unary',
    proto: 'rpc Withdraw(Req) returns (Res)',
    seq: ['req', 'res'],
    desc: 'One request, one response. The plain function call: 95% of real RPCs.',
    use: 'GetUser, Withdraw, anything request/reply.',
  },
  server: {
    name: 'Server streaming',
    proto: 'rpc Tail(Req) returns (stream Res)',
    seq: ['req', 'res', 'res', 'res'],
    desc: 'One request opens a tap. The server then pushes back many responses, one after another, until it has nothing left to send.',
    use: 'Live feeds, tailing logs, large result sets, progress updates.',
  },
  client: {
    name: 'Client streaming',
    proto: 'rpc Upload(stream Req) returns (Res)',
    seq: ['req', 'req', 'req', 'res'],
    desc: 'The mirror image. The client streams many messages up, and the server waits, collecting them all before it replies just once at the end.',
    use: 'Chunked uploads, batching, aggregating telemetry.',
  },
  bidi: {
    name: 'Bidirectional',
    proto: 'rpc Chat(stream Req) returns (stream Res)',
    seq: ['req', 'res', 'req', 'res', 'req'],
    desc: 'Both sides stream independently over one connection. Full duplex.',
    use: 'Chat, multiplayer state, interactive sessions.',
  },
};

export default function RpcTypesLab() {
  const [type, setType] = useState('unary');
  const [run, setRun] = useState(0);
  const t = RPC_TYPES[type];
  useEffect(() => {
    setRun((r) => r + 1);
  }, [type]);

  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />
        the four call shapes
      </div>
      <div className="gx-seg" style={{ marginBottom: 18 }}>
        {Object.keys(RPC_TYPES).map((k) => (
          <button key={k} className={`gx-btn ${type === k ? 'on' : ''}`} onClick={() => setType(k)}>
            {RPC_TYPES[k].name}
          </button>
        ))}
      </div>

      <div className="rpc-stage">
        <div className="rpc-life">
          <span>CLIENT</span>
          <div className="rpc-bar cy" />
        </div>
        <div className="rpc-mid" key={run}>
          {t.seq.map((dir, i) => (
            <div
              key={i}
              className={`rpc-msg ${dir}`}
              style={{ animationDelay: `${i * 480 + 200}ms` }}
            >
              <span className="rpc-arrow">{dir === 'req' ? '→' : '←'}</span>
              <span className="rpc-tag">{dir === 'req' ? 'Req' : 'Res'}</span>
            </div>
          ))}
        </div>
        <div className="rpc-life">
          <span>SERVER</span>
          <div className="rpc-bar am" />
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button className="gx-btn" onClick={() => setRun((r) => r + 1)}>
          ▶ replay
        </button>
      </div>

      <div className="gx-code" style={{ marginTop: 18 }}>
        <span className="cm">// in the .proto</span>
        {'\n'}
        {t.proto.split(/(\bstream\b|\brpc\b)/).map((seg, i) =>
          seg === 'stream' ? (
            <span key={i} className="ty">
              stream
            </span>
          ) : seg === 'rpc' ? (
            <span key={i} className="kw">
              rpc
            </span>
          ) : (
            <span key={i}>{seg}</span>
          ),
        )}
      </div>
      <p style={{ fontSize: 14.5, color: '#b9cad3', margin: '16px 0 6px' }}>
        <b style={{ color: 'var(--ink-bright)' }}>{t.desc}</b>
      </p>
      <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', margin: 0 }}>Reach for it: {t.use}</p>
    </div>
  );
}
