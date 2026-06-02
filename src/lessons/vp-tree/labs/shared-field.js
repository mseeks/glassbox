import { makeField, buildTree } from '../engine/index.js';

// One shared "ocean" used by the build + search labs (continuity). These are
// the SAME instances across both labs so a contact filed in the build lab maps
// to the same point in the search lab.
export const FIELD = makeField(20240903, 22);
export const TREE = buildTree(FIELD, 11, 1);
