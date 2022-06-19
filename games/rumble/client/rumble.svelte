<script lang="ts">
  export let browser;
  import { onMount } from "svelte";

  import {
    connect,
    onFrame,
    updatePlayers,
    gameState,
    handleKeyDown,
    handleKeyUp,
    players,
    size,
    boardR,
    offset,
    getRadius,
    sendReady,
  } from "./rumbleStore";
  import { GameState } from "rumble/server/schema/Rumble";

  onMount(() => {
    if (!browser) return;
    connect();
    onFrame((dt) => {
      if ($gameState === GameState.InGame) updatePlayers(dt);
    });
  });
</script>

<svelte:body
  on:keydown={(ev) => handleKeyDown(ev.code)}
  on:keyup={(ev) => handleKeyUp(ev.code)} />
<button on:click={sendReady}>set ready</button>
<div>{$gameState}</div>

{#each [...$players] as [key, player] (key)}
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
  {#each [...$players] as [key, { color, name, x, y, isAlive, charge }] (key)}
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
