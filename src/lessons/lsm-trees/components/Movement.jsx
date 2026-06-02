import Shell from './Shell.jsx';

// One chapter (Roman-numeralled movement) of the field manual. `dark`
// alternates background paper so consecutive chapters separate visually.
export default function Movement({ children, id, dark, style }) {
  return (
    <section
      id={id}
      style={{
        padding: '84px 0',
        background: dark ? 'var(--paper-2)' : 'transparent',
        borderTop: dark ? '1px solid var(--rule)' : 'none',
        borderBottom: dark ? '1px solid var(--rule)' : 'none',
        ...(style || {}),
      }}
    >
      <Shell>{children}</Shell>
    </section>
  );
}
