/* ─────────────────────────────────────────────────────────────────────────
   UTILITY: section header with number, label, ornament.
   ───────────────────────────────────────────────────────────────────────── */
export function SectionLabel({ num, label }) {
  return (
    <div className="section-label">
      <span className="num">§ {num}</span>
      <span>{label}</span>
      <span className="rule" />
    </div>
  );
}
