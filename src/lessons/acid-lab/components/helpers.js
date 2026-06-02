// Light markdown rendering (just **bold** and *italic*)
export function renderProseMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e8dec8;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:rgba(232,222,200,0.85)">$1</em>');
}

export function hexToRgb(hex) {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return '255,255,255';
  return `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`;
}
