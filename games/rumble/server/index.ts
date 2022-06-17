import { Client, Room } from "colyseus";
import { GameState, RumbleState } from "./schema/Rumble";

export class RumbleRoom extends Room<RumbleState> {
  gameOverScheduled: boolean = false;
  onCreate(options: any): void | Promise<any> {
    this.setState(new RumbleState());

    this.onMessage("*", (client, type, data) => {
      const player = this.state.players.get(client.sessionId)!;
      switch (type) {
        case "direction":
          player.accelDirection = data;
          break;
        case "kick":
          this.state.handleKick(player);
          break;
        case "setName":
          player.name = data;
          break;
        case "setColor":
          player.color = data;
          break;
        case "setReady":
          player.isReady = data;
          this.state.checkReady();
      }
    });

    this.setSimulationInterval((dt) => this.update(dt));
  }

  update(deltaTime: number) {
    if (this.state.state !== GameState.InGame) return;
    this.state.update(deltaTime);
    if (!this.gameOverScheduled && this.state.checkGameOver()) {
      this.gameOverScheduled = true;
      this.clock.setTimeout(() => {
        this.state.setGameOver();
      }, 2000);
    }
  }

  onJoin(client: Client) {
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client: Client) {
    this.state.removePlayer(client.sessionId);
  }
}
