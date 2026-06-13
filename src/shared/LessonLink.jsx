import { useContext } from 'react';
import { getLessonById } from '../lesson-catalog.js';
import { NavContext } from './NavContext.js';

// A cross-lesson link — the connective tissue of the collection. It renders a
// real, crawlable `?lesson=<id>` anchor and, when a NavContext is present,
// soft-navigates (SPA, no reload) on a plain click. Modifier and middle clicks
// fall through to the browser so open-in-new-tab keeps working. The link text
// stays in the surrounding ink (AA-safe in both themes); only the underline is
// tinted with the active lesson's accent (via --lesson-link-color), so the
// affordance never rides on color alone. The single shared cross-lesson
// primitive; the `constellation` loop scans for prose that should use it.
export default function LessonLink({ to, children, className }) {
  const navigate = useContext(NavContext);
  const target = getLessonById(to);
  const label = children ?? target?.title ?? to;

  // Unknown target: fail soft to plain text so a stale link can never dead-end
  // the SPA on a lesson id that no longer exists.
  if (!target) return <span className={className}>{label}</span>;

  const onClick = (event) => {
    if (!navigate) return; // no provider — let the href do a full navigation
    // Honor the browser's own affordances (new tab, new window, download).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };

  return (
    <a
      href={`?lesson=${to}`}
      className={className ? `lesson-link ${className}` : 'lesson-link'}
      data-lesson-link={to}
      onClick={onClick}
    >
      {label}
    </a>
  );
}
