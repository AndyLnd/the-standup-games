<script lang="ts">
  export let browser;
  import { Room } from "colyseus.js";
  import { onMount } from "svelte";
  import { RumbleState } from "rumble/types/RumbleState";
  import { Player } from "rumble/types/Player";
  import {
    GameState,
    updatePlayersAcceleration,
    updatePlayersPosition,
  } from "rumble/server/schema/Rumble";

  // @ts-ignore
  const port_ws = import.meta.env.VITE_PORT_WS || "2567";

  let room: Room<RumbleState>;
  let gameState: GameState = GameState.Lobby;
  let players = new Map<string, Player>();
  let lost: string[] = [];

  async function connect() {
    let Colyseus = await import("colyseus.js");
    const { hostname } = window.location;
    let client = new Colyseus.Client(`wss://${hostname}:${port_ws}/ws`);
    room = await client.joinOrCreate("rumble");
    room.state.listen("state", (newState) => {
      gameState = newState as GameState;
    });
    room.state.listen("lost", (newLost) => (lost = newLost));

    room.state.players.onAdd = (p, key) => {
      players = players.set(key, p);
      p.onChange = (changes) => {
        changes.forEach(({ field, value }) => {
          p[field] = value;
        });
        players = players.set(key, p);
      };
      p.onRemove = () => players.delete(key);
    };
  }

  onMount(() => {
    if (!browser) return;
    connect();
    let frame;

    const loop = (currT: number, prevT: number) => {
      frame = requestAnimationFrame((t) => loop(t, currT));
      const dt = currT - prevT;
      if (gameState !== GameState.InGame) return;
      const newPlayers = updatePlayersAcceleration(players);
      players = updatePlayersPosition(dt, newPlayers);
    };

    loop(16, 0);

    return () => cancelAnimationFrame(frame);
  });

  const boardR = 100;
  const playerR = 10;
  const size = (boardR + playerR) * 2;
  const offset = size / 2;
  const kickRadius = 0.2;
  const getRadius = (c: number) =>
    c > 250
      ? playerR
      : ((Math.min(0, c - 250) / -250) * kickRadius + 1) * playerR;

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
  const handleKeyDown = (code: string) => {
    if (gameState !== GameState.InGame) return;
    if (code === "Space") {
      room.send("kick");
      return;
    }
    if (allKeys.includes(code)) {
      pressedKeys.add(code);
      updateDir();
    }
  };
  const handleKeyUp = (code: string) => {
    if (allKeys.includes(code)) {
      pressedKeys.delete(code);
      updateDir();
    }
  };
</script>

<svelte:body
  on:keydown={(ev) => handleKeyDown(ev.code)}
  on:keyup={(ev) => handleKeyUp(ev.code)} />
<button on:click={() => room.send("setReady", true)}>set ready</button>
<div>{gameState}</div>

{#each [...players] as [key, player]}
  <div>{player.isReady}</div>
  <div>{player.accelDirection}</div>
{/each}
<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <circle
    r={boardR}
    cx={offset}
    cy={offset}
    fill="#797b82"
    stroke="rgba(255,128,128,.2)"
    stroke-width="3px"
  />
  {#each [...players] as [key, { color, name, x, y, isAlive, charge }] (key)}
    <g class="disc" class:isAlive>
      <circle
        cx={x + offset}
        cy={y + offset}
        r={getRadius(charge)}
        fill={color}
        stroke="rgba(0,0,0,.2)"
        stroke-width="1px"
      />
      <text x={x + offset} y={y + offset}>{name}</text>
    </g>
  {/each}
</svg>

<style>
  svg {
    max-width: 100vw;
    max-height: 100vh;
  }

  text {
    font-family: sans-serif;
    font-size: 5px;
    text-anchor: middle;
    font-weight: 600;
    dominant-baseline: middle;
    text-shadow: 0 0 0.3rem white;
  }

  .disc {
    opacity: 0.5;
    filter: blur(1px);
    transition: opacity linear 0.5s, filter linear 0.5s;
  }
  .disc.isAlive {
    opacity: 1;
    filter: none;
  }

  .disc > circle {
    filter: drop-shadow(0.05rem 0.1rem 0.1rem rgba(0, 0, 0, 0.3));
  }

  .gameover-list {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .name {
    font-size: var(--size);
    line-height: 3rem;
  }
</style>
