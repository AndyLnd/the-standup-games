import { RumbleState } from "rumble/types/RumbleState";
import { Player } from "rumble/types/Player";
import {
  GameState,
  updatePlayersAcceleration,
  updatePlayersPosition,
} from "rumble/server/schema/Rumble";

import { get, writable, derived } from "svelte/store";
import { Room, getStateCallbacks } from "colyseus.js";

export const boardR = 100;
export const playerR = 10;
export const size = (boardR + playerR) * 2;
const kickRadius = 0.2;
export const getRadius = (c: number) =>
  c > 250
    ? playerR
    : ((Math.min(0, c - 250) / -250) * kickRadius + 1) * playerR;

let room: Room<RumbleState>;
export const gameState = writable<GameState>(GameState.Lobby);
export const players = writable<Map<string, Player>>(new Map());
export const worldSize = writable<number>(boardR);
export const gameTime = writable<number>(75);
type Loser = { name: string; color: string };
export const getLoserList = () =>
  room.state.lost.map<Loser>((l) => JSON.parse(l));
export const sessionId = writable<string>("");
export const hostId = writable<string>("");
export const self = derived([sessionId, players], ([$sessionId, $players]) =>
  $players.get($sessionId)
);

export const hasRoom = writable(false);

export const isHost = derived(
  [sessionId, hostId],
  ([$sessionId, $hostId]) => $sessionId && $hostId && $sessionId === $hostId
);

export const connect = async (
  goto: (href: string, options: {}) => void,
  id?: string
): Promise<{ error?: number; roomId?: string }> => {
  let Colyseus = await import("colyseus.js");
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
      room = await client.create<RumbleState>("rumble");
    }
    hasRoom.set(!!room);
    room.onLeave(() => {
      players.set(new Map());
      goto("/", { replaceState: true });
    });

    sessionId.set(room.sessionId);

    // Colyseus 0.16: Use getStateCallbacks proxy pattern
    const $ = getStateCallbacks(room);

    $(room.state).listen("hostId", (newHostId: string) => hostId.set(newHostId));
    $(room.state).listen("state", (newState: string) => {
      gameState.set(newState as GameState);
    });
    $(room.state).listen("worldSize", (newSize: number) => worldSize.set(newSize));
    $(room.state).listen("gameTime", (newGameTime: number) => gameTime.set(newGameTime));

    $(room.state).players.onAdd((p: Player, key: string) => {
      players.update((pWritable) => pWritable.set(key, p));
      $(p).onChange(() => {
        players.update((pWritable) => pWritable.set(key, p));
      });
    });

    $(room.state).players.onRemove((_p: Player, key: string) => {
      players.update((pWritable) => {
        pWritable.delete(key);
        return pWritable;
      });
    });
  } catch (e: any) {
    console.error("Colyseus connection error:", e);
    return { error: e.code || 500 };
  }
  return { roomId: room.roomId };
};

const leftKeys = ["KeyA", "ArrowLeft"];
const rightKeys = ["KeyD", "ArrowRight"];
const upKeys = ["KeyW", "ArrowUp"];
const downKeys = ["KeyS", "ArrowDown"];

const allKeys = [...leftKeys, ...rightKeys, ...upKeys, ...downKeys];
const pressedKeys = new Set<string>();

const updateDir = () => {
  const isLeft = leftKeys.some((k) => pressedKeys.has(k));
  const isRight = rightKeys.some((k) => pressedKeys.has(k));
  const isUp = upKeys.some((k) => pressedKeys.has(k));
  const isDown = downKeys.some((k) => pressedKeys.has(k));

  if (!isLeft && !isRight && !isUp && !isDown) {
    room.send("direction", undefined);
    return;
  }
  const x = (isLeft ? -1 : 0) + (isRight ? 1 : 0);
  const y = (isUp ? -1 : 0) + (isDown ? 1 : 0);
  const a = Math.atan2(y, x);
  room.send("direction", a);
};

export const handleKeyDown = (code: string) => {
  if (get(gameState) !== GameState.InGame) return;
  if (code === "Space") {
    room.send("kick");
    return;
  }
  if (allKeys.includes(code) && !pressedKeys.has(code)) {
    pressedKeys.add(code);
    updateDir();
  }
};

export const setKeys = (codes: string[]) => {
  codes = codes.filter((code) => allKeys.includes(code));
  pressedKeys.clear();
  codes.forEach((code) => pressedKeys.add(code));
  updateDir();
};

export const handleKeyUp = (code: string) => {
  if (allKeys.includes(code) && pressedKeys.has(code)) {
    pressedKeys.delete(code);
    updateDir();
  }
};

export const updatePlayers = (dt: number) => {
  players.update(
    (ps) =>
      updatePlayersPosition(dt, updatePlayersAcceleration(ps)) as Map<
        string,
        Player
      >
  );
};

export const onFrame = (callback: (dt?: number) => void) => {
  let frame: number;

  const loop = (currT: number, prevT: number) => {
    frame = requestAnimationFrame((t) => loop(t, currT));
    const dt = currT - prevT;
    callback(dt);
  };

  loop(16, 0);

  // Return cleanup function instead of using onDestroy
  return () => cancelAnimationFrame(frame);
};

export const setReady = (ready: boolean) => room.send("setReady", ready);
export const setName = (name: string) => room.send("setName", name);
export const setColor = (color: string) => room.send("setColor", color);
export const start = () => room.send("start");
export const reset = () => room.send("reset");
export const setGameTime = (maxTime: number) => room.send("setGameTime", maxTime);
export const kickPlayer = (playerId: string) =>
  room.send("kickPlayer", playerId);
