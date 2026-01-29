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
