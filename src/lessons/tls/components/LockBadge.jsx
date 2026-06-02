import { Lock, Unlock, ShieldAlert } from 'lucide-react';

// A square padlock badge. state = 'sealed' | 'broken' | 'open'. `animate`
// triggers the CSS click-shut pop. Pure CSS animation — no JS gating needed.
export default function LockBadge({ state, size = 22, animate }) {
  const Icon = state === 'sealed' ? Lock : state === 'broken' ? ShieldAlert : Unlock;
  return (
    <div className={`tls-lockbadge ${state} ${animate ? 'tls-clickshut' : ''}`}>
      <Icon size={size} strokeWidth={1.8} />
    </div>
  );
}
