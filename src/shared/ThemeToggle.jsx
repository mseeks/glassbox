import { Monitor, Moon, Sun } from 'lucide-react';
import { prefLabel } from './theme.js';
import { useTheme } from './useTheme.js';

// One icon per preference. 'system' shows a monitor; the explicit picks show
// the sun/moon they force.
const ICON = { system: Monitor, light: Sun, dark: Moon };

// Icon-only by design: a fixed footprint that drops into the sticky nav's
// corner in both the desktop pill bar and the mobile compact bar. The cycle
// (System → Light → Dark) is announced via the accessible name + title.
export default function ThemeToggle() {
  const { pref, theme, cyclePref } = useTheme();
  const Icon = ICON[pref];
  const label = prefLabel(pref);
  const following = pref === 'system' ? ` (following system: ${theme})` : '';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cyclePref}
      aria-label={`Theme: ${label}${following}. Activate to switch theme.`}
      title={`Theme: ${label}${following} — click to cycle System / Light / Dark`}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
