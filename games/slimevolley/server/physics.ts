// Physics utilities for SlimeVolley
// Ported from /Users/andy/Workspace/slimevolley/src/physics.js

export interface Vec {
  x: number;
  y: number;
}

export interface PhysicsObject {
  p: Vec;
  v: Vec;
  r: number;
}

export interface Wall {
  x: number;
  y: number;
  x2: number;
  y2: number;
}

// Vector utilities
export const vLength = (v: Vec): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const vSub = (v1: Vec, v2: Vec): Vec => ({ x: v1.x - v2.x, y: v1.y - v2.y });
export const vAdd = (v1: Vec, v2: Vec): Vec => ({ x: v1.x + v2.x, y: v1.y + v2.y });
export const vMul = (v: Vec, m: number): Vec => ({ x: v.x * m, y: v.y * m });
export const vClone = (v: Vec): Vec => ({ x: v.x, y: v.y });

// Ball-Slime collision detection
export const doBallSlimeCollide = (ball: PhysicsObject, slime: PhysicsObject): boolean => {
  // Ball must be above slime (slime is a half-circle)
  if (ball.p.y >= slime.p.y) {
    return false;
  }
  const maxDist = ball.r + slime.r;
  const dist = vLength(vSub(ball.p, slime.p));
  return dist <= maxDist;
};

// Elastic collision resolution
// Based on https://blogs.msdn.microsoft.com/faber/2013/01/09/elastic-collisions-of-balls/
export function resolveBallCollision(
  ball: PhysicsObject,
  slime: PhysicsObject
): { p: Vec; v: Vec } {
  const collisionAngle = Math.atan2(slime.p.y - ball.p.y, slime.p.x - ball.p.x);
  const speedBall = vLength(ball.v);
  const speedSlime = vLength(slime.v);

  const directionBall = Math.atan2(ball.v.y, ball.v.x);
  const directionSlime = Math.atan2(slime.v.y, slime.v.x);

  const newXSpeedBall = speedBall * Math.cos(directionBall - collisionAngle);
  const newYSpeedBall = speedBall * Math.sin(directionBall - collisionAngle);
  const newXSpeedSlime = speedSlime * Math.cos(directionSlime - collisionAngle);

  // Elastic collision - ball gets slime's momentum component
  const finalXSpeedBall = 2 * newXSpeedSlime - newXSpeedBall;
  const finalYSpeedBall = newYSpeedBall;

  const cosAngle = Math.cos(collisionAngle);
  const sinAngle = Math.sin(collisionAngle);

  const newV: Vec = {
    x: cosAngle * finalXSpeedBall - sinAngle * finalYSpeedBall,
    y: sinAngle * finalXSpeedBall + cosAngle * finalYSpeedBall,
  };

  // Minimum translation distance to prevent overlap
  const posDiff = vSub(ball.p, slime.p);
  const d = vLength(posDiff);
  const mtd = vMul(posDiff, (ball.r + slime.r - d) / d);
  const newP = vAdd(ball.p, mtd);

  return { p: newP, v: newV };
}

export enum Direction {
  None = 0,
  Up = 1,
  Right = 2,
  Down = 3,
  Left = 4,
}

// Wall collision detection
export const checkWallCollision = (obj: PhysicsObject, wall: Wall): Direction => {
  const goesLeft = obj.v.x < 0;
  const goesUp = obj.v.y < 0;
  const left = wall.x2 - obj.p.x + obj.r;
  const right = obj.p.x + obj.r - wall.x;
  const top = wall.y2 - obj.p.y + obj.r;
  const bottom = obj.p.y + obj.r - wall.y;

  if (left > 0 && right > 0 && top > 0 && bottom > 0) {
    const x = goesLeft ? left : right;
    const y = goesUp ? top : bottom;
    if (x < y) {
      return goesLeft ? Direction.Left : Direction.Right;
    } else {
      return goesUp ? Direction.Up : Direction.Down;
    }
  }
  return Direction.None;
};

// Game constants
export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 600;
export const FLOOR_Y = 580;

export const NET = {
  x: 397,
  y: 510,
  x2: 403,
  y2: 580,
  width: 6,
  height: 70,
};

// Base timestep (60 FPS = 16.67ms)
export const BASE_DT = 1000 / 60;

// Physics constants normalized to BASE_DT (per-frame at 60 FPS)
// These are the "per frame" values that get scaled by dt/BASE_DT
export const BALL_RADIUS = 20;
export const BALL_GRAVITY = 0.5;
export const BALL_DAMPENING = 0.95;
export const BALL_MAX_SPEED = 16;

export const SLIME_RADIUS = 50;
export const SLIME_GRAVITY = 0.7;
export const SLIME_SPEED = 6;
export const SLIME_JUMP = -13.4;

export const MAX_SCORE = 5;
export const ROUND_RESET_DELAY = 800;

// Starting positions
export const LEFT_SLIME_START = { x: 200, y: FLOOR_Y };
export const RIGHT_SLIME_START = { x: 600, y: FLOOR_Y };
export const BALL_START_LEFT = { x: 200, y: 200 };
export const BALL_START_RIGHT = { x: 600, y: 200 };

// Interpolation factor for smoothing server corrections (0-1, higher = faster snap)
export const INTERPOLATION_FACTOR = 0.3;

// =============================================================================
// SHARED PHYSICS FUNCTIONS (used by both server and client)
// =============================================================================

export interface PlayerState {
  p: Vec;
  v: Vec;
  r: number;
  side: "left" | "right";
}

export interface BallState {
  p: Vec;
  v: Vec;
  r: number;
}

/**
 * Update player physics for one frame
 * @param player - Player state to update (mutated in place)
 * @param moveDirection - -1, 0, or 1 for movement
 * @param wantsToJump - Whether player wants to jump this frame
 * @param dt - Delta time in milliseconds
 * @returns Whether the player jumped this frame
 */
export function updatePlayerPhysics(
  player: PlayerState,
  moveDirection: number,
  wantsToJump: boolean,
  dt: number
): boolean {
  const scale = dt / BASE_DT;
  let didJump = false;

  // Apply horizontal movement (instant, not scaled by dt)
  player.v.x = moveDirection * SLIME_SPEED;

  // Check if on floor
  const isFloored = player.p.y >= FLOOR_Y;

  // Apply jump if on floor and wants to jump
  if (isFloored && wantsToJump) {
    player.v.y = SLIME_JUMP;
    didJump = true;
  }

  // Apply gravity if in air (scaled by dt)
  if (!isFloored) {
    player.v.y += SLIME_GRAVITY * scale;
  }

  // Update position (scaled by dt)
  player.p.x += player.v.x * scale;
  player.p.y += player.v.y * scale;

  // Clamp horizontal position to bounds
  const minX = player.side === "left" ? player.r : NET.x2 + player.r;
  const maxX = player.side === "left" ? NET.x - player.r : ARENA_WIDTH - player.r;
  if (player.p.x < minX) {
    player.p.x = minX;
  } else if (player.p.x > maxX) {
    player.p.x = maxX;
  }

  // Clamp to floor
  if (player.p.y > FLOOR_Y) {
    player.p.y = FLOOR_Y;
    player.v.y = 0;
  }

  return didJump;
}

/**
 * Update ball physics for one frame
 * @param ball - Ball state to update (mutated in place)
 * @param slimes - Array of slime physics objects for collision
 * @param dt - Delta time in milliseconds
 * @returns true if ball hit the floor (goal scored)
 */
export function updateBallPhysics(
  ball: BallState,
  slimes: PhysicsObject[],
  dt: number
): boolean {
  const scale = dt / BASE_DT;

  // Apply gravity (scaled by dt)
  ball.v.y += BALL_GRAVITY * scale;

  // Update position (scaled by dt)
  ball.p.x += ball.v.x * scale;
  ball.p.y += ball.v.y * scale;

  let didCollide = false;

  // Check slime collisions
  for (const slime of slimes) {
    if (doBallSlimeCollide({ p: ball.p, v: ball.v, r: ball.r }, slime)) {
      const result = resolveBallCollision({ p: ball.p, v: ball.v, r: ball.r }, slime);
      ball.p.x = result.p.x;
      ball.p.y = result.p.y;
      ball.v.x = result.v.x;
      ball.v.y = result.v.y;
      didCollide = true;
    }
  }

  // Check net collision
  const netCollision = checkWallCollision({ p: ball.p, v: ball.v, r: ball.r }, NET);
  if (netCollision !== Direction.None) {
    if (netCollision === Direction.Left) {
      ball.p.x = NET.x - ball.r;
      // Ensure velocity points away from net (to the left)
      ball.v.x = -Math.abs(ball.v.x) * BALL_DAMPENING;
      didCollide = true;
    } else if (netCollision === Direction.Right) {
      ball.p.x = NET.x2 + ball.r;
      // Ensure velocity points away from net (to the right)
      ball.v.x = Math.abs(ball.v.x) * BALL_DAMPENING;
      didCollide = true;
    } else if (netCollision === Direction.Up) {
      ball.p.y = NET.y - ball.r;
      // Ensure velocity points away from net (upward)
      ball.v.y = -Math.abs(ball.v.y) * BALL_DAMPENING;
      didCollide = true;
    }
  }

  // Check left/right walls
  if (ball.p.x - ball.r < 0) {
    ball.p.x = ball.r;
    ball.v.x = -ball.v.x * BALL_DAMPENING;
    didCollide = true;
  } else if (ball.p.x + ball.r > ARENA_WIDTH) {
    ball.p.x = ARENA_WIDTH - ball.r;
    ball.v.x = -ball.v.x * BALL_DAMPENING;
    didCollide = true;
  }

  // Check ceiling
  if (ball.p.y - ball.r < 0) {
    ball.p.y = ball.r;
    ball.v.y = -ball.v.y * BALL_DAMPENING;
    didCollide = true;
  }

  // Check floor - returns true to signal goal
  if (ball.p.y + ball.r >= FLOOR_Y) {
    ball.p.y = FLOOR_Y - ball.r;
    ball.v.y = -ball.v.y * BALL_DAMPENING;
    return true; // Ball hit floor
  }

  // Clamp max speed on collision
  if (didCollide) {
    const speed = Math.sqrt(ball.v.x ** 2 + ball.v.y ** 2);
    if (speed > BALL_MAX_SPEED) {
      const clampScale = BALL_MAX_SPEED / speed;
      ball.v.x *= clampScale;
      ball.v.y *= clampScale;
    }
  }

  return false;
}

/**
 * Interpolate between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate a physics object towards a target state
 */
export function interpolateState(
  current: { p: Vec; v: Vec },
  target: { p: Vec; v: Vec },
  factor: number
): void {
  current.p.x = lerp(current.p.x, target.p.x, factor);
  current.p.y = lerp(current.p.y, target.p.y, factor);
  current.v.x = lerp(current.v.x, target.v.x, factor);
  current.v.y = lerp(current.v.y, target.v.y, factor);
}
