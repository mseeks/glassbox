// Abstract pixel-art hero sprite used by the Cartridge and RememberHero
// labs. Not a real game's sprite — a stand-in silhouette ('.' empty, 'B'
// body, 'A' accent). Exported alongside SW/SH so labs can mirror or scale
// it consistently.
const HERO_SPRITE = [
  '....BBB.....',
  '....BBB....A',
  '...BBBB...A.',
  '...BBBB..A..',
  '..BBBBBBA...',
  '.B.BBBBA....',
  '...BBBB.....',
  '...BBBBB....',
  '..BB.BBB....',
  '..BB..BBB...',
  '.BB....BB...',
  '.B.....BBB..',
  'BB......BB..',
  'B........BB.',
  '.........BB.',
  '..........B.',
];
export const SW = HERO_SPRITE[0].length;
export const SH = HERO_SPRITE.length;

export default function Sprite({ mirror = false, hue = 'amber', px = 6 }) {
  const body = hue === 'steel' ? 'var(--steel)' : hue === 'rose' ? 'var(--rose)' : 'var(--amber)';
  const acc =
    hue === 'steel' ? 'var(--steel-dim)' : hue === 'rose' ? '#b8503a' : 'var(--amber-deep)';
  const cells = [];
  for (let y = 0; y < SH; y++)
    for (let x = 0; x < SW; x++) {
      const c = HERO_SPRITE[y][mirror ? SW - 1 - x : x];
      if (c === '.') continue;
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x * px}
          y={y * px}
          width={px}
          height={px}
          fill={c === 'A' ? acc : body}
          rx={px * 0.18}
        />,
      );
    }
  return (
    <svg
      viewBox={`0 0 ${SW * px} ${SH * px}`}
      width="100%"
      style={{
        display: 'block',
        maxWidth: SW * px,
        filter: `drop-shadow(0 0 6px ${hue === 'steel' ? 'rgba(115,188,207,.4)' : hue === 'rose' ? 'rgba(232,135,112,.4)' : 'rgba(246,181,69,.4)'})`,
      }}
    >
      {cells}
    </svg>
  );
}
