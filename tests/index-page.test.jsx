// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import IndexPage from '../src/index-page/IndexPage.jsx';
import { lessons } from '../src/lesson-catalog.js';
import { setPref } from '../src/shared/useTheme.js';

afterEach(cleanup);

describe('IndexPage', () => {
  it('renders a card for every lesson in the catalog', () => {
    render(<IndexPage onSelectLesson={() => {}} />);
    const cards = screen.getAllByRole('button', { name: /^Open / });
    expect(cards).toHaveLength(lessons.length);
    for (const lesson of lessons) {
      expect(screen.getByRole('button', { name: `Open ${lesson.title}` })).toBeInTheDocument();
    }
  });

  it('calls onSelectLesson with the lesson id when a card is clicked', () => {
    const onSelect = vi.fn();
    render(<IndexPage onSelectLesson={onSelect} />);
    screen.getByRole('button', { name: 'Open UDP' }).click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('udp');
  });

  it('tints each card with its lesson accent — the catalog accent in dark, a deepened variant in light', () => {
    const udp = lessons.find((l) => l.id === 'udp');

    // Dark mode (the loved reference): cards use the catalog accent verbatim.
    setPref('dark');
    const dark = render(<IndexPage onSelectLesson={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Open UDP' }).style.getPropertyValue('--card-accent'),
    ).toBe(udp.accent);
    dark.unmount();

    // Light mode: cards still get a concrete accent (a deepened variant tuned to
    // read on the cream index ground), so the tint wiring holds in both themes.
    setPref('light');
    render(<IndexPage onSelectLesson={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Open UDP' }).style.getPropertyValue('--card-accent'),
    ).toMatch(/^#[0-9a-f]{3,6}$/i);

    setPref('system');
  });
});
