// A single instrument readout: a small caps label, a large tabular value, and
// an optional unit line. `tone` picks the value colour (cy/iv/br/mg).
export default function Readout({ label, value, unit, tone = 'cy' }) {
  return (
    <div className="read">
      <div className="rl">{label}</div>
      <div className={`rv ${tone}`}>{value}</div>
      {unit ? <div className="ru">{unit}</div> : null}
    </div>
  );
}
