import { describe, expect, it } from 'vitest';
import {
  defaultPageId,
  getLessonById,
  getPageIdFromSearch,
  indexPage,
  isPageId,
  lessons,
  pages,
} from '../src/lesson-catalog.js';

const lessonModules = import.meta.glob('../src/lessons/*/index.js');

describe('lesson catalog', () => {
  it('keeps the index page followed by the eighteen lessons', () => {
    expect(defaultPageId).toBe('index');
    expect(indexPage).toMatchObject({
      id: 'index',
      label: 'Index',
      title: 'Interactive Lessons',
    });
    expect(lessons).toHaveLength(18);
    expect(pages.map((page) => page.id)).toEqual([
      'index',
      'concurrency-foundations',
      'acid-lab',
      'cap-pacelc',
      'swim',
      'udp',
      'bloom-filters',
      'bloom-clock',
      'cuckoo-filter',
      'lsm-trees',
      'memory',
      'merkle-trees',
      'sha',
      'trie',
      'grpc',
      'b-trees',
      'hyperloglog',
      'vp-tree',
      'tls',
    ]);
  });

  it('defines complete card metadata for every lesson', () => {
    const ids = new Set();
    const labels = new Set();

    for (const lesson of lessons) {
      expect(ids.has(lesson.id), `${lesson.id} id is duplicated`).toBe(false);
      expect(labels.has(lesson.label), `${lesson.label} label is duplicated`).toBe(false);

      ids.add(lesson.id);
      labels.add(lesson.label);

      expect(lesson).toMatchObject({
        id: expect.any(String),
        label: expect.any(String),
        title: expect.any(String),
        accent: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        accentSoft: expect.stringContaining('rgba('),
        displayFont: expect.any(String),
        eyebrow: expect.any(String),
        subtitle: expect.any(String),
        pitch: expect.any(String),
        glyph: expect.any(String),
      });
      expect(lesson.Component, `${lesson.id} missing lazy component`).toBeTruthy();
    }
  });

  it('resolves page ids from lesson query parameters', () => {
    expect(getPageIdFromSearch('?lesson=udp')).toBe('udp');
    expect(getPageIdFromSearch('?lesson=bloom-clock')).toBe('bloom-clock');
    expect(getPageIdFromSearch(new URLSearchParams({ lesson: 'cap-pacelc' }))).toBe('cap-pacelc');
    expect(getPageIdFromSearch('?lesson=missing')).toBe(defaultPageId);
    expect(getPageIdFromSearch('')).toBe(defaultPageId);
    // legacy ids alias to the slug-aligned canonical ids
    expect(getPageIdFromSearch('?lesson=isolation')).toBe('acid-lab');
    expect(getPageIdFromSearch('?lesson=concurrency')).toBe('concurrency-foundations');
    // prototype-chain names must not masquerade as aliases or page ids
    expect(getPageIdFromSearch('?lesson=constructor')).toBe(defaultPageId);
    expect(getPageIdFromSearch('?lesson=__proto__')).toBe(defaultPageId);
    expect(getPageIdFromSearch('?lesson=toString')).toBe(defaultPageId);
  });

  it('looks up known lessons and rejects unknown page ids', () => {
    expect(getLessonById('udp')).toMatchObject({ title: 'UDP' });
    expect(getLessonById('index')).toBeUndefined();
    expect(isPageId('index')).toBe(true);
    expect(isPageId('bloom-clock')).toBe(true);
    expect(isPageId('missing')).toBe(false);
  });

  it('has a default-exporting lesson module for every lesson id', async () => {
    for (const lesson of lessons) {
      const modulePath = `../src/lessons/${lesson.id}/index.js`;
      const loadModule = lessonModules[modulePath];

      expect(loadModule, `${lesson.id} is missing ${modulePath}`).toEqual(expect.any(Function));

      const module = await loadModule();
      expect(module.default, `${lesson.id} is missing a default export`).toEqual(
        expect.any(Function),
      );
    }
  });
});
