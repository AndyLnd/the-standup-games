export interface Vec {
  x: number;
  y: number;
}

export const vLength = (v: Vec): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const vSub = (v1: Vec, v2: Vec): Vec => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y,
});
export const vAdd = (v1: Vec, v2: Vec): Vec => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y,
});
export const vMul = (v: Vec, m: number): Vec => ({
  x: v.x * m,
  y: v.y * m,
});
