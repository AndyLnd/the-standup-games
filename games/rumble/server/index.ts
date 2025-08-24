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

  onCreate(_options: any): void | Promise<any> {
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
        case "setGameTime":
          if (client.sessionId === this.state.hostId) {
            this.state.gameTime = Number(data);
          }
          break;
        case "start":
          if (client.sessionId === this.state.hostId) {
            this.state.checkReadyAndStart();
          }
          break;
        case "kickPlayer":
          if (client.sessionId === this.state.hostId) {
            const kickedClient = this.clients.find((c) => c.sessionId === data);
            if (kickedClient) {
              kickedClient.leave();
              this.state.removePlayer(data);
            }
          }
          break;
        case "reset":
          this.state.reset();
          this.gameOverScheduled = false;
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

  async onLeave(client: Client) {
    try {
      await this.allowReconnection(client, 2);
    } catch (e) {
      this.state.removePlayer(client.sessionId);
    }
  }
}
