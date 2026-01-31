import { Schema, type } from "@colyseus/schema";
import {
  BALL_RADIUS,
  updateBallPhysics,
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
  update(slimes: PhysicsObject[], dt: number): boolean {
    // Use shared physics function
    const state = {
      p: { x: this.p.x, y: this.p.y },
      v: { x: this.v.x, y: this.v.y },
      r: this.r,
    };

    const hitFloor = updateBallPhysics(state, slimes, dt);

    // Copy back to schema
    this.p.x = state.p.x;
    this.p.y = state.p.y;
    this.v.x = state.v.x;
    this.v.y = state.v.y;

    return hitFloor;
  }

  asPhysicsObject(): PhysicsObject {
    return {
      p: { x: this.p.x, y: this.p.y },
      v: { x: this.v.x, y: this.v.y },
      r: this.r,
    };
  }
}
