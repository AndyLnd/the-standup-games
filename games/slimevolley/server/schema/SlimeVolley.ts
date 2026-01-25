import { Schema, type, MapSchema } from "@colyseus/schema";
import { Ball } from "./Ball";
import { Player } from "./Player";

export enum GameState {
  Lobby,
  InGame,
  GameOver,
}

export class SlimeVolleyState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(Ball) ball: Ball = new Ball();
  @type("number") state: GameState = GameState.Lobby;

  update(dt: number) {
    this.players.forEach((p) => p.update(dt));
    this.ball.update(dt);
  }
}
