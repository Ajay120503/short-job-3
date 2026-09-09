export function getDropdownPosition(anchor, size, viewport, gap = 6, margin = 8) {
  const left = viewport.left + margin;
  const top = viewport.top + margin;
  const right = viewport.left + viewport.width - margin;
  const bottom = viewport.top + viewport.height - margin;
  const width = Math.min(size.width, Math.max(0, right - left));
  const height = Math.min(size.height, Math.max(0, bottom - top));
  const candidates = [
    { side: 'bottom', x: anchor.right - width, y: anchor.bottom + gap, w: right - left, h: bottom - anchor.bottom - gap },
    { side: 'top', x: anchor.right - width, y: anchor.top - gap - height, w: right - left, h: anchor.top - gap - top },
    { side: 'right', x: anchor.right + gap, y: anchor.top, w: right - anchor.right - gap, h: bottom - top },
    { side: 'left', x: anchor.left - gap - width, y: anchor.top, w: anchor.left - gap - left, h: bottom - top },
  ];
  const fits = (candidate) => candidate.w >= width && candidate.h >= height;
  const visibleArea = (candidate) => Math.min(width, Math.max(0, candidate.w)) * Math.min(height, Math.max(0, candidate.h));
  const best = candidates.find(fits) || [...candidates].sort((a, b) => visibleArea(b) - visibleArea(a))[0];
  const finalWidth = Math.min(width, Math.max(0, best.w));
  const finalHeight = Math.min(height, Math.max(0, best.h));
  return {
    side: best.side,
    left: Math.max(left, Math.min(best.x, right - finalWidth)),
    top: Math.max(top, Math.min(best.y, bottom - finalHeight)),
    width: finalWidth,
    maxHeight: finalHeight,
  };
}
