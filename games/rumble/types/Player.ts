//
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
//
// GENERATED USING @colyseus/schema 1.0.34
//

import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") public name!: string;
  @type("string") public color!: string;
  @type("boolean") public isReady!: boolean;
  @type("number") public x!: number;
  @type("number") public y!: number;
  @type("number") public vx!: number;
  @type("number") public vy!: number;
  @type("boolean") public isAlive!: boolean;
  @type("number") public charge!: number;
  @type("number") public accelDirection!: number;
}
