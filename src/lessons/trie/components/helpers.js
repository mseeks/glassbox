// Shared data + tracing helpers used by the Hero and every lab. The trie
// engine itself (buildTrie / buildRadix / layoutTrie / layoutRadix) lives in
// ../engine; the helpers here are local to the lesson's interactive flows.

// The nine words the entire lesson visualises. One small dictionary,
// chosen so every prefix is interesting.
export const WORDS = ['car', 'card', 'care', 'cart', 'cat', 'do', 'dog', 'dodge', 'dot'];

// Trace a query through a built trie, character by character. Returns:
// - ids: node ids that exist along the query (so the rider can stop early)
// - full: whether the whole query routed (no missing edge)
// - end: whether the final landed node is a word-terminator
// - breakChar: which character ran the track out, if any
// - node: the final landed node (if full), otherwise null
export function tracePath(root, query) {
  const ids = ['·root'];
  let n = root;
  let full = true;
  let breakChar = null;
  for (let i = 0; i < query.length; i++) {
    const c = query[i];
    if (n.children[c]) {
      n = n.children[c];
      ids.push(query.slice(0, i + 1));
    } else {
      full = false;
      breakChar = c;
      break;
    }
  }
  return { ids, full, end: full && !!n.end, breakChar, node: full ? n : null };
}

// Collect every node id whose prefix starts with `prefix` (excluding root) —
// the "everything downstream of here" set used by the prefix / autocomplete
// lab.
export function subtreeIds(nodes, prefix) {
  if (!prefix) return new Set();
  return new Set(nodes.filter((n) => !n.isRoot && n.prefix.startsWith(prefix)).map((n) => n.id));
}

// Every word stored under `prefix`, sorted alphabetically. Used by the
// autocomplete lab to spell out the completions found in the subtree.
export function completionsOf(root, prefix) {
  let n = root;
  for (const c of prefix) {
    n = n.children[c];
    if (!n) return [];
  }
  const out = [];
  const dfs = (x) => {
    if (x.end) out.push(x.prefix);
    for (const c of Object.keys(x.children).sort()) dfs(x.children[c]);
  };
  dfs(n);
  return out.sort();
}
