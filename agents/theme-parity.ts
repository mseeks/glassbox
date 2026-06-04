/**
 * Theme-parity loop — Many Hands Engineering, light/dark dual-mode coverage.
 *
 * A READ-ONLY mapper of whether each lesson ships BOTH a light and a dark
 * version of its unique design. The collection is dual-mode: the shell sets a
 * `data-theme` attribute on <html> (see src/shared/useTheme.js / tokens.css), and
 * each lesson keeps its bespoke palette as its NATIVE mode while shipping the
 * complementary mode as a `[data-theme='…'] .<root>{}` override block in its own
 * <slug>.css. This loop maps the lessons whose complementary mode is MISSING or
 * INCOMPLETE — the exact gap a new lesson (or a freshly-touched palette) leaves.
 *
 * It is the theming sibling of `style-isolation` (and shares its discipline): the
 * harness parses each CSS file with a brace-aware walker and reports per-file
 * facts — native mode, how many `[data-theme]` override rules exist per mode, a
 * literal-color coverage proxy, and any override selector that LEAKS globally
 * (the same `:root`/`*`/bare-element hazard, now also `[data-theme='light']`
 * with nothing scoped after it). The agent Reads each and emits a strict
 * three-bucket map. Visual parity is not something `vitest`/`eslint`/`vite build`
 * can assert, so — like content-accuracy — it only ever MAPS; the human crafts
 * the complementary skin.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 *
 * Usage: tsx theme-parity.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/lessons/   src/lessons/tls/tls.css   src/lessons/swim/
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".claude",
  "coverage",
  "dist",
  "test-results",
  "playwright-report",
]);

const SCAN_EXT = /\.css$/;

// The shell layer is the family-glue global by design (it OWNS the data-theme
// switch). It is never a per-lesson parity gap. lesson-kit.css is the shared,
// token-driven UI kit — it flips through each lesson's redefined tokens, so it
// has no [data-theme] block of its own and is not a gap either.
const SHELL_FILES = new Set([
  "src/shared/tokens.css",
  "src/shared/utilities.css",
  "src/shared/nav.css",
  "src/shared/lesson-kit/lesson-kit.css",
]);

function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx theme-parity.ts <scope>",
      "  e.g.: src/lessons/   src/lessons/tls/tls.css   src/lessons/swim/",
      "",
      "(Scoping each run keeps the map actionable.)",
    ]);
    process.exit(1);
  }
  if (!existsSync(resolve(APP_ROOT, scope))) {
    report([`RESULT: CANNOT RUN — scope path '${scope}' does not exist relative to the repo root.`]);
    process.exit(1);
  }
  return scope;
}

function gatherSources(scope: string): string[] {
  const scopeAbs = resolve(APP_ROOT, scope);
  const st = statSync(scopeAbs);
  if (st.isFile()) {
    return SCAN_EXT.test(scopeAbs) ? [scopeAbs] : [];
  }
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
      } else if (SCAN_EXT.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(scopeAbs);
  files.sort();
  return files;
}

// ── Comment-strip that preserves line numbers (same as style-isolation) ─────
function stripComments(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    if (css[i] === "/" && css[i + 1] === "*") {
      i += 2;
      while (i < css.length && !(css[i] === "*" && css[i + 1] === "/")) {
        out += css[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  ";
      i += 2;
    } else {
      out += css[i];
      i++;
    }
  }
  return out;
}

// ── Color helpers ───────────────────────────────────────────────────────────
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
const THEME_ATTR = /\[\s*data-theme\s*[~|^$*]?=\s*['"]?(light|dark)['"]?\s*\]/gi;

/** Parse a hex / rgb() background literal into 0–1 relative luminance, or null. */
function luminanceOf(value: string): number | null {
  const hex = value.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
  let r: number, g: number, b: number;
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  } else {
    const rgb = value.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
    if (!rgb) return null;
    r = +rgb[1];
    g = +rgb[2];
    b = +rgb[3];
  }
  // Perceptual-ish luminance, good enough to call a ground dark vs light.
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Luminance of a CSS value, following one or two levels of `var(--x[, fallback])`
 * through the lesson's own token definitions. Lesson roots commonly set
 * `background: var(--bg)` with `--bg` a literal defined just above, so a literal-only
 * reader would miss the ground; this resolves it. Returns null if unresolvable.
 */
function resolveLuminance(value: string, tokenDefs: Map<string, string>, depth: number): number | null {
  const direct = luminanceOf(value);
  if (direct !== null) return direct;
  if (depth >= 3) return null;
  const v = value.match(/var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,\s*([^)]+))?\)/);
  if (!v) return null;
  const resolved = tokenDefs.get(v[1]);
  if (resolved !== undefined) return resolveLuminance(resolved, tokenDefs, depth + 1);
  if (v[2]) return resolveLuminance(v[2].trim(), tokenDefs, depth + 1); // the fallback
  return null;
}

// ── The walker: per-rule prelude + body + line ──────────────────────────────
interface Rule {
  prelude: string;
  body: string;
  line: number;
}

function scanRules(text: string): Rule[] {
  const css = stripComments(text);
  const rules: Rule[] = [];
  let depth = 0;
  let buf = "";
  let line = 1;
  let bufStartLine = 1;
  let bufStarted = false;
  let keyframesDepth = -1;
  let blockStartIdx = -1;
  let pendingPrelude = "";
  let pendingLine = 1;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "\n") line++;
    if (ch === "{") {
      const prelude = buf.trim();
      const isAtRule = prelude.startsWith("@");
      const insideKeyframes = keyframesDepth !== -1 && depth > keyframesDepth;
      if (isAtRule) {
        if (/^@keyframes\b/i.test(prelude) && keyframesDepth === -1) keyframesDepth = depth;
      } else if (!insideKeyframes && prelude) {
        // A normal rule opening — remember where its body starts so we can slice it.
        pendingPrelude = prelude;
        pendingLine = bufStartLine;
        blockStartIdx = i + 1;
      }
      depth++;
      buf = "";
      bufStarted = false;
    } else if (ch === "}") {
      if (blockStartIdx !== -1 && pendingPrelude) {
        rules.push({ prelude: pendingPrelude, body: css.slice(blockStartIdx, i), line: pendingLine });
        blockStartIdx = -1;
        pendingPrelude = "";
      }
      depth--;
      if (keyframesDepth !== -1 && depth <= keyframesDepth) keyframesDepth = -1;
      buf = "";
      bufStarted = false;
    } else if (ch === ";" && depth === 0) {
      buf = "";
      bufStarted = false;
    } else {
      if (!bufStarted && !/\s/.test(ch)) {
        bufStarted = true;
        bufStartLine = line;
      }
      buf += ch;
    }
  }
  return rules;
}

// A comma-part is "scoped" if it contains a class (.) or id (#). Reused for the
// leak check on the REMAINDER of a [data-theme] selector after the attr is removed.
function hasClassOrId(part: string): boolean {
  return part.includes(".") || part.includes("#");
}

function countColorDecls(body: string): number {
  // Count declarations whose VALUE carries a literal color. var(--token) refs
  // don't count — they flow from a (possibly redefined) token, not a hardcoded
  // value, so they're already theme-reactive.
  let n = 0;
  for (const decl of body.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const value = decl.slice(idx + 1);
    if (COLOR_LITERAL.test(value)) n++;
  }
  return n;
}

interface FileReport {
  file: string; // relative
  isShell: boolean;
  rootSelector: string | null;
  nativeMode: "light" | "dark" | "unknown";
  themeLightRules: number;
  themeDarkRules: number;
  baseColorDecls: number;
  themeColorDecls: number;
  complementMode: "light" | "dark" | "unknown";
  complementPresent: boolean;
  leaks: { selector: string; line: number }[];
}

function analyze(file: string): FileReport {
  const fileRel = relative(APP_ROOT, file);
  const isShell = SHELL_FILES.has(fileRel);
  const rules = scanRules(readFileSync(file, "utf8"));

  let rootSelector: string | null = null;
  let nativeMode: FileReport["nativeMode"] = "unknown";
  let themeLightRules = 0;
  let themeDarkRules = 0;
  let baseColorDecls = 0;
  let themeColorDecls = 0;
  const leaks: FileReport["leaks"] = [];
  // Custom-property literals from non-theme rules, for resolving a var() ground.
  const tokenDefs = new Map<string, string>();
  // Non-theme rules that set BOTH background and color — native-ground candidates.
  const rootCandidates: { prelude: string; bg: string }[] = [];

  for (const rule of rules) {
    const themeModes = new Set<string>();
    let m: RegExpExecArray | null;
    THEME_ATTR.lastIndex = 0;
    while ((m = THEME_ATTR.exec(rule.prelude)) !== null) themeModes.add(m[1].toLowerCase());
    const isThemeRule = themeModes.size > 0;
    const colorDecls = countColorDecls(rule.body);

    if (isThemeRule) {
      if (themeModes.has("light")) themeLightRules++;
      if (themeModes.has("dark")) themeDarkRules++;
      themeColorDecls += colorDecls;
      // Leak check (lesson files only — the shell's :root[data-theme]{} IS the
      // global switch, by design). Strip the [data-theme] tokens; if a comma-part
      // has no class/id left, the override matches globally and leaks into the
      // shell + every other lesson. Mirrors style-isolation, on the theme remainder.
      if (!isShell) {
        for (const part of rule.prelude.split(",")) {
          if (!THEME_ATTR.test(part)) continue;
          THEME_ATTR.lastIndex = 0;
          const remainder = part.replace(THEME_ATTR, " ").trim();
          if (!hasClassOrId(remainder)) {
            leaks.push({ selector: rule.prelude.replace(/\s+/g, " ").slice(0, 120), line: rule.line });
            break;
          }
        }
      }
    } else {
      baseColorDecls += colorDecls;
      for (const decl of rule.body.split(";")) {
        const cm = decl.match(/^\s*(--[a-zA-Z0-9-]+)\s*:\s*(.+)$/);
        if (cm && !tokenDefs.has(cm[1])) tokenDefs.set(cm[1], cm[2].trim());
      }
      if (/(^|[\s;{])background(-color)?\s*:/.test(rule.body) && /(^|[\s;])color\s*:/.test(rule.body)) {
        const bgMatch = rule.body.match(/background(?:-color)?\s*:\s*([^;]+)/);
        if (bgMatch) {
          rootCandidates.push({ prelude: rule.prelude.replace(/\s+/g, " ").slice(0, 80), bg: bgMatch[1].trim() });
        }
      }
    }
  }

  // Native ground: first candidate whose background luminance resolves (through
  // the token map for a var() ground). Informational — the agent confirms by Read.
  for (const cand of rootCandidates) {
    const lum = resolveLuminance(cand.bg, tokenDefs, 0);
    if (lum !== null) {
      rootSelector = cand.prelude;
      nativeMode = lum < 0.4 ? "dark" : "light";
      break;
    }
  }

  const complementMode: FileReport["complementMode"] =
    nativeMode === "dark" ? "light" : nativeMode === "light" ? "dark" : "unknown";
  // A lesson HAS its complement once it ships ANY data-theme-keyed rules: the
  // unkeyed rules paint one mode and the [data-theme] block paints the other.
  // (Which mode the block targets is informational — requiring a *specific* mode
  // here produced false "missing" flags whenever the native-ground guess was off.)
  // The truly-missing case this catches is a lesson with no [data-theme] block.
  const complementPresent = themeLightRules + themeDarkRules > 0;

  return {
    file: fileRel,
    isShell,
    rootSelector,
    nativeMode,
    themeLightRules,
    themeDarkRules,
    baseColorDecls,
    themeColorDecls,
    complementMode,
    complementPresent,
    leaks,
  };
}

function statusOf(r: FileReport): "missing" | "thin" | "present" {
  if (!r.complementPresent) return "missing";
  // Coverage proxy: a complement that redefines far fewer literal colors than the
  // native mode carries is probably partial. Threshold is intentionally loose —
  // the agent makes the real call by Reading.
  if (r.baseColorDecls >= 6 && r.themeColorDecls < r.baseColorDecls * 0.35) return "thin";
  return "present";
}

function formatForAgent(reports: FileReport[]): string {
  const lessons = reports.filter((r) => !r.isShell);
  const shell = reports.filter((r) => r.isShell);

  const line = (r: FileReport) => {
    const st = statusOf(r).toUpperCase();
    const leakNote = r.leaks.length ? ` · ⚠ ${r.leaks.length} possibly-global override selector(s)` : "";
    return `  - ${r.file} · native:${r.nativeMode} → needs:${r.complementMode} · light-rules:${r.themeLightRules} dark-rules:${r.themeDarkRules} · color-literals base:${r.baseColorDecls}/theme:${r.themeColorDecls} · HARNESS:${st}${leakNote}`;
  };

  const leakLines = reports
    .flatMap((r) => r.leaks.map((l) => `  - ${r.file}:${l.line} · \`${l.selector}\``))
    .join("\n");

  return `CSS files in scope (${reports.length}; ${lessons.length} lesson/page, ${shell.length} shell):

LESSON / PAGE files — does each ship BOTH modes?
${lessons.map(line).join("\n") || "  (none)"}

SHELL files (the global data-theme layer — owning both modes here is BY DESIGN, never a gap):
${shell.map(line).join("\n") || "  (none)"}

${leakLines ? `Possibly-global override selectors (a [data-theme] rule with nothing scoped after the attribute — verify each; in a LESSON file this leaks into the shell + every other lesson):\n${leakLines}\n` : "Possibly-global override selectors: NONE detected.\n"}
The HARNESS status is a heuristic from a literal-color count + root-luminance guess — NOT a verdict. For each lesson file, Read it and confirm: (a) is the complementary mode actually present and (b) does every color-bearing declaration in the native mode have a counterpart in the override (directly, or via a redefined custom property it cascades from — a token redefined on the root covers everything that uses it). Classify each into ONE of the three buckets. A bucket (1) finding requires a quoted selector/declaration from your Read.`;
}

function systemPrompt(scope: string): string {
  return `You are the theme-parity mapper for the Glassbox repository (React 19 + Vite — a collection of self-contained lessons, each lazily loaded and each shipping its OWN <slug>.css scoped under a lesson root class: .tls-root, .hll, .bt-root, .lesson-root, .idx-root, .cap-root, .udp-root, .mw, .sha-root, .mk-root, .vp-root, …). The whole collection is DUAL-MODE: the shell sets a \`data-theme="light"|"dark"\` attribute on <html> before first paint (the switch lives in src/shared/useTheme.js + ThemeToggle.jsx; the shell's family-glue light/dark tokens are in src/shared/tokens.css). Each lesson keeps its bespoke palette as its NATIVE mode and ships the COMPLEMENTARY mode as a \`[data-theme='…'] .<root>{}\` override block in its own <slug>.css. The harness has parsed \`${scope}\` and reported, per file, the native mode, the count of \`[data-theme]\` override rules per mode, a literal-color coverage proxy, and any override selector that may match globally. Your job: turn that into a curated map of which lessons are MISSING or have an INCOMPLETE complementary version of their design.

Your only tools are Read / Grep / Glob — you can investigate but CANNOT edit any file. The human crafts the complementary skin you map.

WHY THIS MATTERS: a lesson with no (or a half-finished) \`[data-theme]\` block looks broken in the other mode — dark text on a dark ground, an un-recolored hardcoded gradient glowing through a light page, an accent that vanishes. Parity means BOTH modes are intentional and complete. The two light-native lessons (b-trees, merkle-trees) need a DARK complement; every dark-native lesson needs a LIGHT complement.

For EACH lesson file, classify into EXACTLY ONE of three buckets:

(1) MISSING or INCOMPLETE complementary variant — ADD / EXTEND IT. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT native-mode declaration(s) with NO counterpart in the override (a hardcoded \`background: linear-gradient(...)\` in \`.x::before\`, a \`color: #…\`, a \`box-shadow\`, a CSS-set \`fill\`/\`stroke\`), in backticks, with file:line and the lesson. Or, if the whole \`[data-theme]\` block is absent, say so and name the native mode + the complement it needs. Cite or omit.
    (b) WHY it is a gap — it is a color-bearing declaration in the native mode that neither the override block re-states NOR inherits from a custom property the override redefines.
    (c) ACTION — the literal next step: "add \`[data-theme='light'] .<root>{ … }\` redefining --ink/--panel/--bg…" / "override \`[data-theme='light'] .x::before{ background: … }\` for the hardcoded gradient".

(2) COMPLETE — VERIFIED PARITY. The lesson ships both modes and every color-bearing native declaration has a counterpart (directly, or via a redefined token it cascades from — a token redefined on the root covers all its \`var()\` users). State briefly what you checked (e.g. "all 14 palette tokens redefined under [data-theme='light'] .swim-root; the two ::before/::after gradients are overridden").

(3) JUDGMENT-HEAVY (your call). A color deliberately the SAME in both modes (a semantic danger red / attacker vermilion meant to stay constant; an accent that reads on both grounds by design; a decorative element that works either way), OR heavy reliance on inline-styled colors in the lesson's JSX that CSS overrides can't reach (Grep the lesson dir — note it as a softer concern, since the fix is in JSX, not CSS). Name the trade-off.

SCOPE / LEAK AWARENESS:
- Every \`[data-theme]\` override MUST stay under the lesson root (\`[data-theme='light'] .tls-root …\`). A \`[data-theme='light']\` with nothing scoped after it — or \`[data-theme='light'] body/*\` — sets tokens/styles GLOBALLY on <html> and leaks into the shell and every other lazily-loaded lesson (the same hazard \`style-isolation\` guards). If the harness flagged one in a LESSON file, treat it as a bucket (1) defect: "scope the override under the lesson root". Quote it.
- The SHELL files (src/shared/tokens.css, utilities.css, nav.css) OWN the global data-theme layer — their \`:root[data-theme='light']{}\` and global rules are BY DESIGN. Never flag them as gaps or leaks; they are bucket (2).
- @import / @keyframes / @font-face are not themed rules. Keyframes that use \`var(--token)\` already flip via the redefined token.

WHEN THE HARNESS REPORTS every lesson PRESENT (clean scan): sample 2-3 files to confirm both blocks really exist and the override redefines the palette, then output the default clean map. A bucket (1) finding requires a quoted declaration from your Read — do not confabulate.

Output a structured map with exactly these three sections in this order:

## Missing / incomplete complementary mode — add or extend (review & act)

(per item — file:line · WHAT (quoted) · WHY · ACTION)

## Complete — verified parity

(list — lesson · what you checked)

## Judgment-heavy (your call)

(list — finding · the trade-off)

End with a final summary line: "<X> missing/incomplete · <Y> complete · <Z> judgment". Nothing after.`;
}

async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Theme-parity loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:               ${scope}`,
      `CSS files in scope:  0`,
      "",
      "RESULT: PASS — no scannable CSS files in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Parsing ${files.length} CSS file(s) for light/dark coverage ──`);
  const reports = files.map(analyze);
  const lessons = reports.filter((r) => !r.isShell);
  const missing = lessons.filter((r) => statusOf(r) === "missing").length;
  const thin = lessons.filter((r) => statusOf(r) === "thin").length;
  const leaks = reports.reduce((n, r) => n + r.leaks.length, 0);
  console.log(`   Lesson/page files: ${lessons.length} · harness MISSING: ${missing} · THIN: ${thin} · possibly-global overrides: ${leaks}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(reports),
    // opus: deciding whether a token redefinition truly covers a declaration —
    // and separating a deliberate theme-invariant color from a real gap — is the
    // kind of judgment that does not survive sonnet's pattern-matching priors.
    model: "opus",
  });

  report([
    `Scope:                 ${scope}`,
    `CSS files in scope:    ${files.length} (${lessons.length} lesson/page)`,
    `Harness MISSING / THIN: ${missing} / ${thin}`,
    `Possibly-global overrides: ${leaks}`,
    `Agent run:             ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Missing/incomplete section and craft the complementary modes you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
