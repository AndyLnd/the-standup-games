import { Schema, type } from "@colyseus/schema";

export const maxCharge = 2000;

export class Player extends Schema {
  @type("string") name: string = "";
  @type("string") color: string = "";
  @type("boolean") isReady: boolean = false;
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") vx: number = 0;
  @type("number") vy: number = 0;
  @type("boolean") isAlive: boolean = true;
  @type("number") charge: number = maxCharge;
  @type("number") accelDirection: number = undefined;
}
