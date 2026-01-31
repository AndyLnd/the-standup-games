import { type Client, Room, ServerError } from "colyseus";
import { GameState, SlimeVolleyState } from "./schema/SlimeVolley";

export class SlimeVolleyRoom extends Room<SlimeVolleyState> {
  maxClients = 2;

  onCreate() {
    this.setState(new SlimeVolleyState());

    this.onMessage("*", (client, type, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      switch (type) {
        case "move":
          // message is -1 (left), 0 (stop), or 1 (right)
          player.setMove(message as number);
          break;

        case "jump":
          player.jump();
          break;

        case "setName":
          player.name = String(message).slice(0, 8);
          break;

        case "setColor":
          player.color = String(message);
          break;

        case "setReady":
          player.isReady = Boolean(message);
          break;

        case "start":
          // Only host can start
          if (client.sessionId === this.state.hostId) {
            this.state.checkReadyAndStart();
          }
          break;

        case "reset":
          // Only host can reset
          if (client.sessionId === this.state.hostId) {
            this.state.reset();
          }
          break;
      }
    });

    this.setSimulationInterval((dt) => this.update(dt));
  }

  onAuth() {
    // Block joining if game is already in progress
    if (this.state.state !== GameState.Lobby) {
      throw new ServerError(409, "Game is already in session");
    }
    return true;
  }

  onJoin(client: Client) {
    this.state.createPlayer(client.sessionId);
  }

  async onLeave(client: Client) {
    try {
      // Allow reconnection for 15 seconds
      await this.allowReconnection(client, 15);
    } catch {
      // Player didn't reconnect, remove them
      this.state.removePlayer(client.sessionId);
    }
  }

  update(dt: number) {
    this.state.update(dt);
  }
}
