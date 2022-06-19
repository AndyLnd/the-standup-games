import { Client, Room, ServerError } from "colyseus";
import { GameState, RumbleState } from "./schema/Rumble";

export class RumbleRoom extends Room<RumbleState> {
  gameOverScheduled: boolean = false;

  onAuth() {
    if (this.state.state !== GameState.Lobby) {
      throw new ServerError(409, "Game is already in session");
    }
    return true;
  }

  onCreate(options: any): void | Promise<any> {
    console.log('create');
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
          break;
        case "start":
          if (client.sessionId === this.state.hostId) {
            this.state.checkReadyAndStart();
          }
          break;
        case "reset":
          this.state.reset();
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
