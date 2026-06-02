// A value + label readout cell, and a grid to lay several out. The value uses
// the lesson's display face (--lk-display); the label is family-glue mono.
export function Stat({ value, label, valueColor, className = '' }) {
  return (
    <div className={`lk-stat ${className}`.trim()}>
      <div className="lk-stat-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className="lk-stat-label">{label}</div>
    </div>
  );
}

export function StatGrid({ children, cols, className = '', style }) {
  return (
    <div
      className={`lk-statgrid ${className}`.trim()}
      style={cols ? { '--lk-stat-cols': cols, ...style } : style}
    >
      {children}
    </div>
  );
}
