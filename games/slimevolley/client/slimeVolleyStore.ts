import { SlimeVolleyState, GameState } from "slimevolley/server/schema/SlimeVolley";
import { Player } from "slimevolley/server/schema/Player";
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  FLOOR_Y,
  NET,
  SLIME_RADIUS,
  SLIME_SPEED,
  SLIME_GRAVITY,
  SLIME_JUMP,
  BALL_GRAVITY,
  doBallSlimeCollide,
  resolveBallCollision,
  type PhysicsObject,
} from "slimevolley/server/physics";

import { get, writable, derived } from "svelte/store";
import { Room, getStateCallbacks } from "colyseus.js";

// Re-export for use in components
export { GameState, ARENA_WIDTH, ARENA_HEIGHT, FLOOR_Y, NET, SLIME_RADIUS };

let room: Room<SlimeVolleyState>;

// Player data interface for client-side state
interface PlayerData {
  p: { x: number; y: number };
  v: { x: number; y: number };
  r: number;
  name: string;
  color: string;
  isReady: boolean;
  side: "left" | "right";
  isDancing: boolean;
  score: number;
}

// Svelte stores
export const gameState = writable<GameState>(GameState.Lobby);
export const players = writable<Map<string, PlayerData>>(new Map());
export const ball = writable<{ p: { x: number; y: number }; v: { x: number; y: number }; r: number }>({
  p: { x: 200, y: 200 },
  v: { x: 0, y: 0 },
  r: 20,
});
export const scoreL = writable<number>(0);
export const scoreR = writable<number>(0);
export const ballIsHot = writable<boolean>(false);
export const leftWonLast = writable<boolean>(true);
export const sessionId = writable<string>("");
export const hostId = writable<string>("");
export const hasRoom = writable<boolean>(false);

// Client-side prediction state
let localMoveDirection = 0;
let simulationFrameId: number | null = null;

// Derived stores
export const self = derived([sessionId, players], ([$sessionId, $players]) =>
  $players.get($sessionId)
);

export const isHost = derived(
  [sessionId, hostId],
  ([$sessionId, $hostId]) => $sessionId && $hostId && $sessionId === $hostId
);

export const leftPlayer = derived([players], ([$players]) =>
  [...$players.values()].find((p) => p.side === "left")
);

export const rightPlayer = derived([players], ([$players]) =>
  [...$players.values()].find((p) => p.side === "right")
);

// Helper to convert PlayerData to PhysicsObject
const toPhysicsObject = (p: PlayerData): PhysicsObject => ({
  p: { x: p.p.x, y: p.p.y },
  v: { x: p.v.x, y: p.v.y },
  r: p.r,
});

// Apply local jump immediately (for local player only)
const applyLocalJump = () => {
  const $sessionId = get(sessionId);
  const $players = get(players);
  const player = $players.get($sessionId);
  if (!player) return;

  const isFloored = player.p.y >= FLOOR_Y;
  if (isFloored) {
    player.v.y = SLIME_JUMP;
    players.set(new Map($players));
  }
};

// Player physics update with optional move direction override
const updatePlayerPhysics = (player: PlayerData, moveDir?: number) => {
  // Apply movement if direction provided (local prediction)
  if (moveDir !== undefined) {
    player.v.x = moveDir * SLIME_SPEED;
  }

  // Apply gravity if in air
  const isFloored = player.p.y >= FLOOR_Y;
  if (!isFloored) {
    player.v.y += SLIME_GRAVITY;
  }

  // Update position
  player.p.x += player.v.x;
  player.p.y += player.v.y;

  // Clamp horizontal position to bounds
  const minX = player.side === "left" ? SLIME_RADIUS : NET.x2 + SLIME_RADIUS;
  const maxX = player.side === "left" ? NET.x - SLIME_RADIUS : ARENA_WIDTH - SLIME_RADIUS;
  player.p.x = Math.max(minX, Math.min(maxX, player.p.x));

  // Clamp to floor
  if (player.p.y > FLOOR_Y) {
    player.p.y = FLOOR_Y;
    player.v.y = 0;
  }
};

// Client-side physics simulation (players + ball, using server-synced velocities)
const runClientSimulation = () => {
  const currentState = get(gameState);
  if (currentState !== GameState.InGame) {
    return;
  }

  const $players = get(players);
  const $ball = get(ball);

  // Update all players with physics
  const $sessionId = get(sessionId);
  const newPlayerMap = new Map($players);
  for (const [key, player] of newPlayerMap) {
    // Use local move direction for local player, infer from velocity for others
    const moveDir = key === $sessionId ? localMoveDirection : player.v.x / SLIME_SPEED;
    updatePlayerPhysics(player, moveDir);
  }
  players.set(newPlayerMap);

  // Ball prediction with physics
  const newBall = {
    ...$ball,
    p: { x: $ball.p.x + $ball.v.x, y: $ball.p.y + $ball.v.y },
    v: { x: $ball.v.x, y: $ball.v.y + BALL_GRAVITY },
  };

  // Check ball-slime collisions (predict locally)
  const ballObj: PhysicsObject = { p: newBall.p, v: newBall.v, r: newBall.r };
  for (const player of $players.values()) {
    const slimeObj = toPhysicsObject(player);
    if (doBallSlimeCollide(ballObj, slimeObj)) {
      const result = resolveBallCollision(ballObj, slimeObj);
      newBall.p = result.p;
      newBall.v = result.v;
      ballObj.p = result.p;
      ballObj.v = result.v;
    }
  }

  // Basic bounds clamping for ball
  if (newBall.p.x - newBall.r < 0) {
    newBall.p.x = newBall.r;
    newBall.v.x = -newBall.v.x * 0.95;
  } else if (newBall.p.x + newBall.r > ARENA_WIDTH) {
    newBall.p.x = ARENA_WIDTH - newBall.r;
    newBall.v.x = -newBall.v.x * 0.95;
  }
  if (newBall.p.y - newBall.r < 0) {
    newBall.p.y = newBall.r;
    newBall.v.y = -newBall.v.y * 0.95;
  }
  if (newBall.p.y + newBall.r > FLOOR_Y) {
    newBall.p.y = FLOOR_Y - newBall.r;
    newBall.v.y = -newBall.v.y * 0.95;
  }

  ball.set(newBall);

  simulationFrameId = requestAnimationFrame(runClientSimulation);
};

const startClientSimulation = () => {
  if (simulationFrameId === null) {
    simulationFrameId = requestAnimationFrame(runClientSimulation);
  }
};

const stopClientSimulation = () => {
  if (simulationFrameId !== null) {
    cancelAnimationFrame(simulationFrameId);
    simulationFrameId = null;
  }
};

// Helper to clone player data for reactivity
const clonePlayerData = (p: Player): PlayerData => ({
  p: { x: p.p.x, y: p.p.y },
  v: { x: p.v.x, y: p.v.y },
  r: p.r,
  name: p.name,
  color: p.color,
  isReady: p.isReady,
  side: p.side as "left" | "right",
  isDancing: p.isDancing,
  score: p.score,
});

// Connection
export const connect = async (
  goto: (href: string, options?: object) => void,
  id?: string
): Promise<{ error?: number; roomId?: string }> => {
  const Colyseus = await import("colyseus.js");
  const isLocalhost = window.location.hostname === "localhost";
  // @ts-ignore
  const port_ws = import.meta.env.VITE_PORT_WS || "2567";

  const client = new Colyseus.Client(
    isLocalhost
      ? `ws://localhost:${port_ws}`
      : `wss://ws.thestandup.games:${port_ws}`
  );

  try {
    if (id) {
      room = await client.joinById(id);
    } else {
      room = await client.create<SlimeVolleyState>("slimevolley");
    }
    hasRoom.set(!!room);
    room.onLeave(() => {
      players.set(new Map());
      goto("/slimevolley", { replaceState: true });
    });

    sessionId.set(room.sessionId);

    // Colyseus 0.16: Use getStateCallbacks proxy pattern
    const $ = getStateCallbacks(room);

    $(room.state).listen("hostId", (newHostId: string) => {
      hostId.set(newHostId);
    });
    $(room.state).listen("state", (newState: string) => {
      gameState.set(newState as GameState);

      // Start/stop client simulation based on game state
      if (newState === GameState.InGame) {
        startClientSimulation();
      } else {
        stopClientSimulation();
      }
    });
    $(room.state).listen("scoreL", (newScore: number) => scoreL.set(newScore));
    $(room.state).listen("scoreR", (newScore: number) => scoreR.set(newScore));
    $(room.state).listen("ballIsHot", (newBallIsHot: boolean) =>
      ballIsHot.set(newBallIsHot)
    );
    $(room.state).listen("leftWonLast", (newLeftWonLast: boolean) =>
      leftWonLast.set(newLeftWonLast)
    );

    // Listen to ball changes - set up after initial state sync
    const updateBall = () => {
      if (room.state.ball?.p) {
        // Sync authoritative state from server (including velocity for prediction)
        ball.set({
          p: { x: room.state.ball.p.x, y: room.state.ball.p.y },
          v: { x: room.state.ball.v.x, y: room.state.ball.v.y },
          r: room.state.ball.r,
        });
      }
    };

    // Wait for initial state sync before setting up nested listeners
    room.onStateChange.once(() => {
      $(room.state.ball).onChange(() => {
        updateBall();
      });

      // Listen to nested ball position changes (VecSchema)
      if (room.state.ball?.p) {
        $(room.state.ball.p).onChange(() => {
          updateBall();
        });
      }

      // Initial ball state
      updateBall();
    });

    // Player collection callbacks
    $(room.state).players.onAdd((p: Player, key: string) => {
      const syncPlayer = () => {
        players.update((map) => new Map(map).set(key, clonePlayerData(p)));
      };
      syncPlayer();
      $(p).onChange(syncPlayer);
      $(p.p).onChange(syncPlayer);
      $(p.v).onChange(syncPlayer);
    });

    $(room.state).players.onRemove((_p: Player, key: string) => {
      players.update((pWritable) => {
        const newMap = new Map(pWritable);
        newMap.delete(key);
        return newMap;
      });
    });
  } catch (e: unknown) {
    console.error("Colyseus connection error:", e);
    const error = e as { code?: number };
    return { error: error.code || 500 };
  }
  return { roomId: room.roomId };
};

// Key handling - both WASD and arrows work for any player
const pressedKeys = new Set<string>();
const jumpKeys = ["KeyW", "ArrowUp"];
const leftKeys = ["KeyA", "ArrowLeft"];
const rightKeys = ["KeyD", "ArrowRight"];
const moveKeys = [...leftKeys, ...rightKeys];

const getDirectionFromKeys = (): number => {
  const isLeft = leftKeys.some((k) => pressedKeys.has(k));
  const isRight = rightKeys.some((k) => pressedKeys.has(k));
  return (isLeft ? -1 : 0) + (isRight ? 1 : 0);
};

const updateMovement = () => {
  if (!get(self)) return;
  room.send("move", getDirectionFromKeys());
};

export const handleKeyDown = (code: string) => {
  if (get(gameState) !== GameState.InGame) return;
  if (!get(self)) return;

  if (jumpKeys.includes(code)) {
    applyLocalJump();
    room.send("jump");
    return;
  }

  if (moveKeys.includes(code) && !pressedKeys.has(code)) {
    pressedKeys.add(code);
    localMoveDirection = getDirectionFromKeys();
    updateMovement();
  }
};

export const handleKeyUp = (code: string) => {
  if (get(gameState) !== GameState.InGame) return;
  if (!get(self)) return;

  if (moveKeys.includes(code) && pressedKeys.has(code)) {
    pressedKeys.delete(code);
    localMoveDirection = getDirectionFromKeys();
    updateMovement();
  }
};

// Actions
export const setReady = (ready: boolean) => room.send("setReady", ready);
export const setName = (name: string) => room.send("setName", name);
export const setColor = (color: string) => room.send("setColor", color);
export const start = () => room.send("start");
export const reset = () => room.send("reset");
