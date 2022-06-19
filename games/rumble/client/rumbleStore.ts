import { RumbleState } from "rumble/types/RumbleState";
import { Player } from "rumble/types/Player";
import { onMount } from "svelte";
import {
  GameState,
  updatePlayersAcceleration,
  updatePlayersPosition,
} from "rumble/server/schema/Rumble";

import { get, writable } from "svelte/store";
import { Room } from "colyseus.js";

export const boardR = 100;
export const playerR = 10;
export const size = (boardR + playerR) * 2;
export const offset = size / 2;
const kickRadius = 0.2;
export const getRadius = (c: number) =>
  c > 250
    ? playerR
    : ((Math.min(0, c - 250) / -250) * kickRadius + 1) * playerR;

let room: Room<RumbleState>;
export const gameState = writable<GameState>(GameState.Lobby);
export const players = writable<Map<string, Player>>(new Map());
export const lost = writable<string[]>([]);

export const connect = async () => {
  let Colyseus = await import("colyseus.js");
  const { hostname } = window.location;
  const isLocalhost = hostname === "localhost";
  // @ts-ignore
  const port_ws = import.meta.env.VITE_PORT_WS || "443";

  const client = new Colyseus.Client(
    isLocalhost
      ? `wss://localhost:${port_ws}`
      : `wss://ws.thestandup.games:${port_ws}`
  );
  room = await client.joinOrCreate<RumbleState>("rumble");
  room.state.listen("state", (newState) => {
    gameState.set(newState as GameState);
  });
  room.state.listen("lost", (newLost) => lost.set(newLost));

  room.state.players.onAdd = (p, key) => {
    players.update((pWritable) => pWritable.set(key, p));
    p.onChange = (changes) => {
      changes.forEach(({ field, value }) => {
        p[field] = value;
      });
      players.update((pWritable) => pWritable.set(key, p));
    };
    p.onRemove = () => {
      players.update((pWritable) => {
        pWritable.delete(key);
        return pWritable;
      });
    };
  };
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
  if (allKeys.includes(code)) {
    pressedKeys.add(code);
    updateDir();
  }
};

export const handleKeyUp = (code: string) => {
  if (allKeys.includes(code)) {
    pressedKeys.delete(code);
    updateDir();
  }
};

export const updatePlayers = (dt: number) => {
  players.update((ps) =>
    updatePlayersPosition(dt, updatePlayersAcceleration(ps))
  );
};

export const onFrame = (callback: (dt?: number) => void) => {
  onMount(() => {
    let frame;

    const loop = (currT: number, prevT: number) => {
      frame = requestAnimationFrame((t) => loop(t, currT));
      const dt = currT - prevT;
      callback(dt);
    };

    loop(16, 0);

    return () => cancelAnimationFrame(frame);
  });
};

export const sendReady = () => {
  room.send("setReady", true)
}
