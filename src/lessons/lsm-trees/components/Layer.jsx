// The visual language of the whole piece: one geological stratum, drawn as
// a horizontal band. Stratum index `idx` chooses both the background fill
// (via STRATA) and the text contrast (light text from idx ≥ 2). The
// component handles tombstones, freshly-laid layers, dim/found highlights.

// Strata 0–1 use dark text; 2+ use light text. Cross-cutting helper.
export const STRATA = [
  'var(--s1)',
  'var(--s2)',
  'var(--s3)',
  'var(--s4)',
  'var(--s5)',
  'var(--s6)',
];
export const lightText = (i) => i >= 2;

export default function Layer({ label, sub, fill, h = 38, tomb, fresh, dim, found, idx = 0 }) {
  const useLight = tomb ? true : lightText(idx);
  return (
    <div
      style={{
        position: 'relative',
        height: h,
        background: tomb ? 'var(--char)' : fill,
        borderTop: '1px solid var(--lsm-cell-line-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        opacity: dim ? 0.3 : 1,
        boxShadow: found
          ? 'inset 0 0 0 2px var(--writ), inset 0 0 28px var(--glow-writ-soft)'
          : tomb
            ? 'inset 0 0 0 1px var(--lsm-sheen)'
            : 'none',
        transition: 'opacity 0.35s, box-shadow 0.3s',
        overflow: 'hidden',
        animation: fresh ? 'drop 0.55s ease-out' : 'none',
      }}
    >
      {tomb && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(45deg, transparent 0 5px, var(--lsm-sheen) 5px 6px)',
          }}
        />
      )}
      <span
        className="m"
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          position: 'relative',
          color: tomb
            ? 'rgba(242,232,211,0.62)'
            : useLight
              ? 'var(--lsm-strata-lt)'
              : 'var(--lsm-strata-dk)',
        }}
      >
        {label}
      </span>
      {sub != null && (
        <span
          className="m"
          style={{
            fontSize: 10.5,
            position: 'relative',
            color: tomb
              ? 'rgba(242,232,211,0.4)'
              : useLight
                ? 'var(--lsm-strata-lt-faint)'
                : 'var(--lsm-strata-dk-faint)',
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
