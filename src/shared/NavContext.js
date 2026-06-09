import { createContext } from 'react';

// Lets a <LessonLink> anywhere inside a lesson navigate to a sibling lesson
// without prop-drilling the App's page selector through every section. The
// value is App's `selectPage(id)`. It is null outside a provider, in which case
// <LessonLink> falls back to a plain anchor so crawlers, no-JS, and tests still
// resolve the `?lesson=` href.
export const NavContext = createContext(null);
