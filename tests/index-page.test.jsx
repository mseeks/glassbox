// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import IndexPage from '../src/index-page/IndexPage.jsx';
import { lessons } from '../src/lesson-catalog.js';

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

  it('tints each card with its lesson accent', () => {
    render(<IndexPage onSelectLesson={() => {}} />);
    const udp = lessons.find((l) => l.id === 'udp');
    const card = screen.getByRole('button', { name: 'Open UDP' });
    expect(card.style.getPropertyValue('--card-accent')).toBe(udp.accent);
  });
});
