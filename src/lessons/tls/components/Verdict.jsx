import { Check, X } from 'lucide-react';

// A pass/fail verdict chip (aqua for ok, vermilion for not).
export default function Verdict({ ok, okText = 'VERIFIED', noText = 'REJECTED' }) {
  return (
    <span
      className="tls-chip"
      style={{
        borderColor: ok ? 'var(--aqua)' : 'var(--verm)',
        color: ok ? 'var(--aqua-bright)' : 'var(--verm-bright)',
        background: ok ? 'rgba(70,214,198,.1)' : 'rgba(240,100,77,.12)',
      }}
    >
      {ok ? <Check size={13} /> : <X size={13} />}
      {ok ? okText : noText}
    </span>
  );
}
