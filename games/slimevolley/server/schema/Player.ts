import { Schema, type } from "@colyseus/schema";
import { VecSchema } from "./Ball";
import {
  SLIME_RADIUS,
  SLIME_GRAVITY,
  SLIME_SPEED,
  SLIME_JUMP,
  FLOOR_Y,
  NET,
  type PhysicsObject,
} from "../physics";

export type Side = "left" | "right";

export class Player extends Schema {
  @type(VecSchema) p: VecSchema = new VecSchema();
  @type(VecSchema) v: VecSchema = new VecSchema();
  @type("number") r: number = SLIME_RADIUS;
  @type("number") score: number = 0;
  @type("boolean") isDancing: boolean = false;

  // New fields for multiplayer
  @type("string") name: string = "";
  @type("string") color: string = "#0000ff";
  @type("boolean") isReady: boolean = false;
  @type("string") side: Side = "left";

  // Movement state (not synced, set by server from messages)
  moveDirection: number = 0; // -1 left, 0 none, 1 right
  wantsToJump: boolean = false;

  reset(side: Side) {
    this.side = side;
    if (side === "left") {
      this.p.x = 200;
      this.color = "#0000ff"; // blue
    } else {
      this.p.x = 600;
      this.color = "#ff0000"; // red
    }
    this.p.y = FLOOR_Y;
    this.v.x = 0;
    this.v.y = 0;
    this.isDancing = false;
  }

  get isFloored(): boolean {
    return this.p.y >= FLOOR_Y;
  }

  get minX(): number {
    return this.side === "left" ? this.r : NET.x2 + this.r;
  }

  get maxX(): number {
    return this.side === "left" ? NET.x - this.r : 800 - this.r;
  }

  setMove(direction: number) {
    this.moveDirection = direction;
  }

  jump() {
    this.wantsToJump = true;
  }

  update() {
    // Apply horizontal movement
    this.v.x = this.moveDirection * SLIME_SPEED;

    // Apply jump if on floor and wants to jump
    if (this.isFloored && this.wantsToJump) {
      this.v.y = SLIME_JUMP;
    }
    this.wantsToJump = false;

    // Apply gravity if in air
    if (!this.isFloored) {
      this.v.y += SLIME_GRAVITY;
    }

    // Update position
    this.p.x += this.v.x;
    this.p.y += this.v.y;

    // Clamp horizontal position to bounds
    if (this.p.x < this.minX) {
      this.p.x = this.minX;
    } else if (this.p.x > this.maxX) {
      this.p.x = this.maxX;
    }

    // Clamp to floor
    if (this.p.y > FLOOR_Y) {
      this.p.y = FLOOR_Y;
      this.v.y = 0;
    }
  }

  asPhysicsObject(): PhysicsObject {
    return {
      p: { x: this.p.x, y: this.p.y },
      v: { x: this.v.x, y: this.v.y },
      r: this.r,
    };
  }
}
