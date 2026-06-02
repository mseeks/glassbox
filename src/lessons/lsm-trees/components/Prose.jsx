// Prose container — optional dropcap on the first paragraph.
export default function Prose({ children, dropcap, style }) {
  return (
    <div className={`prose ${dropcap ? 'dropcap' : ''}`} style={style}>
      {children}
    </div>
  );
}
