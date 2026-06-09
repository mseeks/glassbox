// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import LessonLink from '../src/shared/LessonLink.jsx';
import { NavContext } from '../src/shared/NavContext.js';

afterEach(cleanup);

describe('LessonLink', () => {
  it('renders a crawlable ?lesson= anchor, defaulting its text to the lesson title', () => {
    render(<LessonLink to="hyperloglog" />);
    const link = screen.getByRole('link', { name: 'HyperLogLog' });
    expect(link).toHaveAttribute('href', '?lesson=hyperloglog');
    expect(link).toHaveAttribute('data-lesson-link', 'hyperloglog');
  });

  it('soft-navigates through the NavContext on a plain click', () => {
    const navigate = vi.fn();
    render(
      <NavContext.Provider value={navigate}>
        <LessonLink to="paxos">Paxos</LessonLink>
      </NavContext.Provider>,
    );
    screen.getByRole('link', { name: 'Paxos' }).click();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('paxos');
  });

  it('falls back to plain text (no link) for an unknown lesson id', () => {
    render(<LessonLink to="not-a-lesson">orphan</LessonLink>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('orphan')).toBeInTheDocument();
  });
});
