// The letterpress proof block — a figure with crop marks at each corner and an
// optional caption strip. `soft` swaps the recessed variant (no crop marks).
function Crop() {
  return (
    <>
      <span className="sst-crop tl" />
      <span className="sst-crop tr" />
      <span className="sst-crop bl" />
      <span className="sst-crop br" />
    </>
  );
}

export default function Plate({ children, cap, capRight, soft, style }) {
  return (
    <div className={soft ? 'sst-plate-soft' : 'sst-plate'} style={style}>
      {!soft && <Crop />}
      {children}
      {cap && (
        <div className="sst-cap">
          <span>{cap}</span>
          {capRight && <span>{capRight}</span>}
        </div>
      )}
    </div>
  );
}
