import { Schema, type } from "@colyseus/schema";

export class VecSchema extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class Ball extends Schema {
  @type(VecSchema) p: VecSchema = new VecSchema();
  @type(VecSchema) v: VecSchema = new VecSchema();
  @type("number") r: number = 0;
}
