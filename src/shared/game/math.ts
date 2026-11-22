export type Vec2 = {
  x: number;
  y: number;
};

export const TAU = Math.PI * 2;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const distance = (
  ax: number,
  ay: number,
  bx: number,
  by: number
): number => Math.hypot(bx - ax, by - ay);

export const normalizeAngle = (angle: number): number => {
  const wrapped = angle % TAU;
  return wrapped < 0 ? wrapped + TAU : wrapped;
};

export const angleDelta = (from: number, to: number): number => {
  let delta = normalizeAngle(to) - normalizeAngle(from);
  if (delta > Math.PI) {
    delta -= TAU;
  } else if (delta < -Math.PI) {
    delta += TAU;
  }
  return delta;
};

export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * clamp(amount, 0, 1);

export const approach = (value: number, target: number, step: number): number => {
  if (value < target) {
    return Math.min(target, value + step);
  }
  return Math.max(target, value - step);
};
