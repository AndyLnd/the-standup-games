//
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
//
// GENERATED USING @colyseus/schema 1.0.34
//

import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";

export class RumbleState extends Schema {
  @type({ map: Player }) public players: MapSchema<Player> =
    new MapSchema<Player>();
  @type("number") public worldSize!: number;
  @type("number") public gameTime!: number;
  @type("string") public theme!: string;
  @type("string") public state!: string;
  @type(["string"]) public lost: ArraySchema<string> =
    new ArraySchema<string>();
  @type("string") public hostId!: string;
}
