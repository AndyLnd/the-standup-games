import { Schema, type } from "@colyseus/schema";
import { VecSchema } from "./Ball";

export class Player extends Schema {
  @type(VecSchema) p: VecSchema = new VecSchema();
  @type(VecSchema) v: VecSchema = new VecSchema();
  @type("number") r: number = 50;
  @type("number") score: number = 0;
  @type("boolean") isDancing = false;

  update(dt:number){

  }
}
