export function Rule({ glyph = '╱  ╱  ╱' }) {
  return (
    <div className="cf-rule">
      <hr />
      <span className="cf-rule-glyph">{glyph}</span>
      <hr />
    </div>
  );
}
