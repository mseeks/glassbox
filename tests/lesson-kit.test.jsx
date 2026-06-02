// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  Callout,
  Chip,
  SegmentedControl,
  Slider,
  Stat,
  StatGrid,
} from '../src/shared/lesson-kit/index.js';

afterEach(cleanup);

describe('lesson-kit · Callout', () => {
  it('renders a labelled accent aside with body content', () => {
    render(<Callout label="The one rule">A node never grows at the leaves.</Callout>);
    expect(screen.getByText('The one rule')).toHaveClass('lk-callout-label');
    expect(screen.getByText('A node never grows at the leaves.')).toHaveClass('lk-callout-body');
  });

  it('omits the label element when no label is given', () => {
    const { container } = render(<Callout>body only</Callout>);
    expect(container.querySelector('.lk-callout-label')).toBeNull();
    expect(container.querySelector('.lk-callout-body')).toHaveTextContent('body only');
  });
});

describe('lesson-kit · Slider', () => {
  it('gives the range an accessible name and a value readout, and reports numbers', () => {
    const onChange = vi.fn();
    render(
      <Slider label="Precision p" value={6} display="p=6" min={4} max={14} onChange={onChange} />,
    );
    const range = screen.getByRole('slider', { name: 'Precision p' });
    expect(range).toHaveValue('6');
    expect(screen.getByText('p=6')).toBeInTheDocument();
    fireEvent.change(range, { target: { value: '9' } });
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it('prefers an explicit ariaLabel over the visible label', () => {
    render(
      <Slider
        label="p"
        ariaLabel="Precision (registers)"
        value={4}
        min={4}
        max={10}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('slider', { name: 'Precision (registers)' })).toBeInTheDocument();
  });
});

describe('lesson-kit · SegmentedControl', () => {
  it('marks the active option pressed and reports the chosen value', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={['paint', 'numbers']}
        value="paint"
        onChange={onChange}
        ariaLabel="Mode"
      />,
    );
    expect(screen.getByRole('button', { name: 'paint' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'numbers' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    screen.getByRole('button', { name: 'numbers' }).click();
    expect(onChange).toHaveBeenCalledWith('numbers');
  });

  it('accepts {value,label} option objects', () => {
    render(
      <SegmentedControl
        options={[
          { value: 'a', label: 'Apply' },
          { value: 'b', label: 'Bypass' },
        ]}
        value="b"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Bypass' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('lesson-kit · Stat / StatGrid / Chip', () => {
  it('renders value + label cells and a column-count token', () => {
    const { container } = render(
      <StatGrid cols={2}>
        <Stat value="4" label="height" />
        <Stat value="128" label="keys" valueColor="var(--accent)" />
      </StatGrid>,
    );
    const grid = container.querySelector('.lk-statgrid');
    expect(grid.style.getPropertyValue('--lk-stat-cols')).toBe('2');
    expect(screen.getByText('height')).toHaveClass('lk-stat-label');
    expect(screen.getByText('4')).toHaveClass('lk-stat-value');
    expect(screen.getByText('128')).toHaveStyle({ color: 'var(--accent)' });
  });

  it('renders a chip with its content', () => {
    render(<Chip>pages read: 3</Chip>);
    expect(screen.getByText('pages read: 3')).toHaveClass('lk-chip');
  });
});
