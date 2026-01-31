import { Schema, type } from "@colyseus/schema";
import { VecSchema } from "./Ball";
import {
  SLIME_RADIUS,
  FLOOR_Y,
  updatePlayerPhysics,
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

  setMove(direction: number) {
    this.moveDirection = direction;
  }

  jump() {
    this.wantsToJump = true;
  }

  update(dt: number) {
    // Use shared physics function
    const state = {
      p: { x: this.p.x, y: this.p.y },
      v: { x: this.v.x, y: this.v.y },
      r: this.r,
      side: this.side as "left" | "right",
    };

    updatePlayerPhysics(state, this.moveDirection, this.wantsToJump, dt);
    this.wantsToJump = false;

    // Copy back to schema
    this.p.x = state.p.x;
    this.p.y = state.p.y;
    this.v.x = state.v.x;
    this.v.y = state.v.y;
  }

  asPhysicsObject(): PhysicsObject {
    return {
      p: { x: this.p.x, y: this.p.y },
      v: { x: this.v.x, y: this.v.y },
      r: this.r,
    };
  }
}
