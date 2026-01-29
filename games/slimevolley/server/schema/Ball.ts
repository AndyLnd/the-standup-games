import { Schema, type } from "@colyseus/schema";
import {
  BALL_RADIUS,
  BALL_GRAVITY,
  BALL_DAMPENING,
  BALL_MAX_SPEED,
  ARENA_WIDTH,
  FLOOR_Y,
  NET,
  doBallSlimeCollide,
  resolveBallCollision,
  checkWallCollision,
  Direction,
  type PhysicsObject,
} from "../physics";

export class VecSchema extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class Ball extends Schema {
  @type(VecSchema) p: VecSchema = new VecSchema();
  @type(VecSchema) v: VecSchema = new VecSchema();
  @type("number") r: number = BALL_RADIUS;

  reset(startX: number, startY: number) {
    this.p.x = startX;
    this.p.y = startY;
    this.v.x = 0;
    this.v.y = 0;
  }

  // Returns true if ball hit the floor
  update(slimes: PhysicsObject[]): boolean {
    // Apply gravity
    this.v.y += BALL_GRAVITY;

    // Update position
    this.p.x += this.v.x;
    this.p.y += this.v.y;

    let didCollide = false;

    // Check slime collisions
    for (const slime of slimes) {
      if (doBallSlimeCollide(this.asPhysicsObject(), slime)) {
        const result = resolveBallCollision(this.asPhysicsObject(), slime);
        this.p.x = result.p.x;
        this.p.y = result.p.y;
        this.v.x = result.v.x;
        this.v.y = result.v.y;
        didCollide = true;
      }
    }

    // Check net collision
    const netCollision = checkWallCollision(this.asPhysicsObject(), NET);
    if (netCollision !== Direction.None) {
      if (netCollision === Direction.Left || netCollision === Direction.Right) {
        this.v.x = -this.v.x * BALL_DAMPENING;
        // Push ball out of net
        if (netCollision === Direction.Left) {
          this.p.x = NET.x - this.r;
        } else {
          this.p.x = NET.x2 + this.r;
        }
      } else if (netCollision === Direction.Up) {
        this.v.y = -this.v.y * BALL_DAMPENING;
        this.p.y = NET.y - this.r;
      }
      didCollide = true;
    }

    // Check left/right walls
    if (this.p.x - this.r < 0) {
      this.p.x = this.r;
      this.v.x = -this.v.x * BALL_DAMPENING;
      didCollide = true;
    } else if (this.p.x + this.r > ARENA_WIDTH) {
      this.p.x = ARENA_WIDTH - this.r;
      this.v.x = -this.v.x * BALL_DAMPENING;
      didCollide = true;
    }

    // Check ceiling
    if (this.p.y - this.r < 0) {
      this.p.y = this.r;
      this.v.y = -this.v.y * BALL_DAMPENING;
      didCollide = true;
    }

    // Check floor - returns true to signal goal
    if (this.p.y + this.r >= FLOOR_Y) {
      this.p.y = FLOOR_Y - this.r;
      this.v.y = -this.v.y * BALL_DAMPENING;
      return true; // Ball hit floor
    }

    // Apply dampening on collision
    if (didCollide) {
      // Clamp velocity
      const speed = Math.sqrt(this.v.x ** 2 + this.v.y ** 2);
      if (speed > BALL_MAX_SPEED) {
        const scale = BALL_MAX_SPEED / speed;
        this.v.x *= scale;
        this.v.y *= scale;
      }
    }

    return false; // Ball still in play
  }

  asPhysicsObject(): PhysicsObject {
    return {
      p: { x: this.p.x, y: this.p.y },
      v: { x: this.v.x, y: this.v.y },
      r: this.r,
    };
  }
}
