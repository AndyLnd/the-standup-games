import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player, maxCharge } from "./Player";

const acceleration = 0.007;
const drag = 0.95;
const playerR = 10;
const kickRadius = 0.2;
const kickPower = 0.1;

export const updatePlayersAcceleration = (players: Map<string, Player>) => {
  players.forEach((p) => {
    if (!p.isAlive || p.accelDirection == null) return;
    const dx = Math.cos(p.accelDirection);
    const dy = Math.sin(p.accelDirection);
    p.vx += dx * acceleration;
    p.vy += dy * acceleration;
  });
  return players;
};

export const updatePlayersPosition = (
  dt: number,
  players: Map<string, Player>
) => {
  players.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= drag;
    p.vy *= drag;
    if (Math.abs(p.vx) < 0.001) p.vx = 0;
    if (Math.abs(p.vy) < 0.001) p.vy = 0;
    if (p.charge < maxCharge) p.charge = Math.min(p.charge + dt, maxCharge);
  });
  return players;
};

export enum GameState {
  Lobby = "lobby",
  InGame = "inGame",
  GameOver = "gameOver",
}

export class RumbleState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") worldSize: number = 100;
  @type("string") state: GameState = GameState.Lobby;
  @type(["string"]) lost: string[] = [];
  @type("string") hostId: string = "";

  createPlayer(sessionId: string) {
    this.players.set(sessionId, new Player());
    if (!this.hostId) {
      this.hostId = sessionId;
    }
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
    if (this.hostId === sessionId) {
      this.hostId = [...this.players.keys()][0] ?? "";
    }
  }

  checkReadyAndStart() {
    const isEveryoneReady = [...this.players.values()].every((p) => p.isReady);
    if (isEveryoneReady) {
      this.startGame();
    }
  }

  startGame() {
    this.worldSize = 100;
    this.state = GameState.InGame;
    this.lost = [];

    const tau = Math.PI * 2;
    const step = tau / this.players.size;
    let currentAngle = Math.random() * tau;
    const dist = this.worldSize - playerR * 2;

    this.players.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
      p.isAlive = true;
      p.charge = maxCharge;
      p.x = Math.cos(currentAngle) * dist;
      p.y = Math.sin(currentAngle) * dist;

      currentAngle += step;
    });
  }

  reset() {
    this.worldSize = 100;
    this.state = GameState.Lobby;
    this.lost = [];
    this.players.forEach((p) => {
      p.isAlive = true;
      p.charge = maxCharge;
      p.isReady = false;
    });
  }

  updatePlayersCollision(dt: number) {
    const skip = new Map([...this.players.keys()].map((k) => [k, [k]]));
    this.players.forEach((p, pId) => {
      const others = [...this.players].filter(
        ([id]) => !skip.get(pId).includes(id)
      );
      others.forEach(([oId, o]) => {
        const dx = p.x - o.x;
        const dy = p.y - o.y;
        const uniDist = Math.sqrt(dx * dx + dy * dy) / (playerR * 2);
        if (uniDist < 1) {
          const ϕ = Math.atan2(dy, dx);
          const dvx = Math.cos(ϕ) * (p.vx - o.vx);
          const dvy = Math.sin(ϕ) * (p.vy - o.vy);

          p.vx -= dvx * Math.sign(dx);
          p.vy -= dvy * Math.sign(dy);
          o.vx += dvx * Math.sign(dx);
          o.vy += dvy * Math.sign(dy);

          const offX = ((1 - uniDist) * dx) / 2;
          const offY = ((1 - uniDist) * dy) / 2;
          p.x += offX;
          p.y += offY;
          o.x -= offX;
          o.y -= offY;

          skip.set(oId, [...skip.get(oId), pId]);
        }
      });
    });
  }

  updatePlayersAlive() {
    this.players.forEach((p) => {
      if (!p.isAlive) return p;

      const isAlive = Math.sqrt(p.x * p.x + p.y * p.y) <= this.worldSize;
      if (!isAlive) {
        this.lost.push(p.name);
        p.isAlive = false;
      }
    });
  }

  handleKick(player: Player) {
    if (player.charge < maxCharge) return;
    player.charge = 0;
    const saveDist = playerR * kickRadius + playerR * 2;
    this.players.forEach((p) => {
      if (p === player) return;
      const dx = player.x - p.x;
      const dy = player.y - p.y;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= saveDist) return;

      const ϕ = Math.atan2(dy, dx);
      const dvx = Math.cos(ϕ) * kickPower;
      const dvy = Math.sin(ϕ) * kickPower;
      p.vx -= dvx;
      p.vy -= dvy;
    });
  }

  checkGameOver() {
    const atMostOneAlive =
      [...this.players.values()].filter((p) => p.isAlive).length < 2;
    return atMostOneAlive;
  }

  setGameOver() {
    this.state = GameState.GameOver;
    const stillAlive = [...this.players.values()]
      .filter((p) => p.isAlive)
      .map((p) => p.name);
    this.lost.push(...stillAlive);
  }

  update(dt: number) {
    updatePlayersAcceleration(this.players);
    updatePlayersPosition(dt, this.players);
    this.updatePlayersCollision(dt);
    this.updatePlayersAlive();
  }
}
