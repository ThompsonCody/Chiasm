/** Reflect only the illuminated span of an arc, using its actual CSS reveal. */
export function arcReflection(
  bounds: { left: number; width: number; top: number; bottom: number },
  viewport: { width: number; height: number },
  reveal = 1,
) {
  if (viewport.width <= 0 || viewport.height <= 0) return [0, 0, 0, 0];
  const progress = Math.max(0, Math.min(1, reveal));
  const width = bounds.width * progress;
  const visible = bounds.bottom > 0 && bounds.top < viewport.height;
  return [
    (bounds.left + width / 2) / viewport.width,
    1 - bounds.bottom / viewport.height,
    width / viewport.width,
    visible ? Math.min(1, progress * 10) : 0,
  ];
}
