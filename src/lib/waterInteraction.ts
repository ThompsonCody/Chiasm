export const RIPPLE_LIMIT = 8;
const RIPPLE_LIFETIME = 2.8;

// Shared with GLSL: a horizontal plane receding toward a horizon above the viewport.
export const WATER_HORIZON = 1.22;
export const WATER_DEPTH = 3.5;

export function waterSurfacePoint(x: number, y: number, width: number, height: number) {
  const depth = WATER_HORIZON - 1 + y / height;
  return { x: (x / width - .5) * (width / height) / depth, y: WATER_DEPTH / depth };
}

type Ripple = { x: number; y: number; born: number; energy: number };

/** Bounded surface impulses for the existing water pass; no overlay or particles. */
export function createWaterInteraction() {
  const ripples: Ripple[] = [];
  const uniforms = new Float32Array(RIPPLE_LIMIT * 4);
  let previous: { x: number; y: number; time: number } | undefined;
  let speed = 0, travel = 0, lastImpulse = -Infinity;
  function resetPointer() { previous = undefined; speed = 0; travel = 0; lastImpulse = -Infinity; }
  return {
    // Input time uses the pointer event clock, independent of the 30fps water clock.
    add(x: number, y: number, time: number, width: number, height: number, splash = false, inputTime = time) {
      if (width <= 0 || height <= 0) return false;
      const elapsed = previous ? inputTime - previous.time : 0;
      const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : 0;
      if (!previous || elapsed > .25 || elapsed < 0) {
        speed = 0; travel = 0;
      } else if (elapsed > 0) {
        // Exponential smoothing uses elapsed time, so mouse polling rate doesn't
        // change the feel. A viewport-relative speed gives touch the same range.
        const velocity = Math.min(distance / elapsed, Math.min(width, height) * 6);
        speed += (velocity - speed) * (1 - Math.exp(-elapsed / .07));
        travel += distance;
      }
      const first = !previous;
      previous = { x, y, time: inputTime };
      if (!splash && !first && (inputTime - lastImpulse < .045 || travel < 4)) return false;
      const energy = splash ? 1 : .15 + .85 * (1 - Math.exp(-speed / (Math.min(width, height) * .9)));
      lastImpulse = inputTime; travel = 0;
      ripples.push({ ...waterSurfacePoint(x, y, width, height), born: time, energy });
      if (ripples.length > RIPPLE_LIMIT) ripples.shift();
      return true;
    },
    sample(time: number) {
      while (ripples.length && time - ripples[0].born > RIPPLE_LIFETIME) ripples.shift();
      uniforms.fill(0);
      ripples.forEach((ripple, i) => uniforms.set([ripple.x, ripple.y, ripple.born, ripple.energy], i * 4));
      return uniforms;
    },
    resetPointer,
    clear() { ripples.length = 0; resetPointer(); },
  };
}
