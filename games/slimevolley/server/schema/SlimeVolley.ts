import { Schema, type, MapSchema } from "@colyseus/schema";
import { Ball } from "./Ball";
import { Player, type Side } from "./Player";
import {
  MAX_SCORE,
  BALL_START_LEFT,
  BALL_START_RIGHT,
  ARENA_WIDTH,
} from "../physics";

export enum GameState {
  Lobby = "lobby",
  InGame = "inGame",
  GameOver = "gameOver",
}

export class SlimeVolleyState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(Ball) ball: Ball = new Ball();
  @type("string") state: GameState = GameState.Lobby;
  @type("string") hostId: string = "";
  @type("number") scoreL: number = 0;
  @type("number") scoreR: number = 0;
  @type("boolean") ballIsHot: boolean = false;
  @type("boolean") leftWonLast: boolean = true;

  private roundResetTimeout: ReturnType<typeof setTimeout> | null = null;

  createPlayer(sessionId: string): Player {
    const player = new Player();

    // Assign side based on player count
    const existingPlayers = [...this.players.values()];
    const leftTaken = existingPlayers.some((p) => p.side === "left");

    player.side = leftTaken ? "right" : "left";
    player.reset(player.side);

    this.players.set(sessionId, player);

    // First player becomes host
    if (this.players.size === 1) {
      this.hostId = sessionId;
    }

    return player;
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);

    // If host left, assign new host
    if (this.hostId === sessionId && this.players.size > 0) {
      const [newHostId] = this.players.keys();
      this.hostId = newHostId;
    }

    // If a player leaves during game, end the game
    if (this.state === GameState.InGame && this.players.size < 2) {
      this.state = GameState.GameOver;
    }
  }

  getPlayerBySide(side: Side): Player | undefined {
    return [...this.players.values()].find((p) => p.side === side);
  }

  checkReadyAndStart(): boolean {
    if (this.players.size !== 2) return false;

    const allReady = [...this.players.values()].every((p) => p.isReady);
    if (!allReady) return false;

    this.startGame();
    return true;
  }

  startGame() {
    this.state = GameState.InGame;
    this.scoreL = 0;
    this.scoreR = 0;
    this.leftWonLast = true;

    // Reset players to starting positions
    this.players.forEach((player) => {
      player.reset(player.side);
      player.isDancing = false;
    });

    // Reset ball (start on left side)
    this.ball.reset(BALL_START_LEFT.x, BALL_START_LEFT.y);
    this.ballIsHot = true;
  }

  resetRound() {
    // Reset players to starting positions
    this.players.forEach((player) => {
      player.reset(player.side);
      player.isDancing = false;
    });

    // Ball spawns on the side that lost
    const ballStart = this.leftWonLast ? BALL_START_RIGHT : BALL_START_LEFT;
    this.ball.reset(ballStart.x, ballStart.y);
    this.ballIsHot = true;
  }

  handleGoal(ballX: number) {
    if (!this.ballIsHot) return;

    this.ballIsHot = false;

    // Determine which side scored
    // Ball on right side (>400) = left player scores
    // Ball on left side (<=400) = right player scores
    if (ballX > ARENA_WIDTH / 2) {
      this.scoreL++;
      this.leftWonLast = true;
      const leftPlayer = this.getPlayerBySide("left");
      if (leftPlayer) leftPlayer.isDancing = true;
    } else {
      this.scoreR++;
      this.leftWonLast = false;
      const rightPlayer = this.getPlayerBySide("right");
      if (rightPlayer) rightPlayer.isDancing = true;
    }

    // Check for game over
    if (this.scoreL >= MAX_SCORE || this.scoreR >= MAX_SCORE) {
      this.state = GameState.GameOver;
      return;
    }

    // Schedule round reset
    if (this.roundResetTimeout) {
      clearTimeout(this.roundResetTimeout);
    }
    this.roundResetTimeout = setTimeout(() => {
      if (this.state === GameState.InGame) {
        this.resetRound();
      }
    }, 800);
  }

  update(dt: number) {
    if (this.state !== GameState.InGame) return;

    // Update players
    this.players.forEach((player) => player.update(dt));

    // Update ball with slime physics objects
    const slimes = [...this.players.values()].map((p) => p.asPhysicsObject());
    const hitFloor = this.ball.update(slimes, dt);

    if (hitFloor && this.ballIsHot) {
      this.handleGoal(this.ball.p.x);
    }
  }

  reset() {
    this.state = GameState.Lobby;
    this.scoreL = 0;
    this.scoreR = 0;
    this.ballIsHot = false;
    this.leftWonLast = true;

    // Reset player ready states
    this.players.forEach((player) => {
      player.isReady = false;
      player.reset(player.side);
    });

    // Reset ball
    this.ball.reset(BALL_START_LEFT.x, BALL_START_LEFT.y);

    if (this.roundResetTimeout) {
      clearTimeout(this.roundResetTimeout);
      this.roundResetTimeout = null;
    }
  }
}
