<script lang="ts">
  import {
    handleKeyDown,
    handleKeyUp,
    players,
    size,
    getRadius,
    worldSize,
    gameState,
    sessionId,
    playerR,
  } from "./rumbleStore";
  import Stars from "./Stars.svelte";
  import { GameState } from "rumble/server/schema/Rumble";
</script>

<svelte:body
  on:keydown={(ev) => handleKeyDown(ev.code)}
  on:keyup={(ev) => handleKeyUp(ev.code)}
/>
<Stars />

<svg
  viewBox="{-size / 2} {-size / 2} {size} {size}"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <radialGradient id="board">
      <stop offset="10%" stop-color="#696b72" />
      <stop offset="95%" stop-color="#797b82" />
    </radialGradient>
  </defs>
  <circle
    r={$worldSize}
    cx={0}
    cy={0}
    fill="url('#board')"
    stroke="rgba(255,128,128,.2)"
    stroke-width="3px"
  />
  {#each [...$players] as [key, { color, name, x, y, isAlive, charge }] (key)}
    <g class="disc" class:isAlive>
      {#if $gameState === GameState.CountDown && $sessionId === key}
        <circle
          class="highlight"
          cx={x}
          cy={y}
          r={playerR}
          fill="none"
          stroke="white"
          stroke-width=".5px"
        />
      {/if}
      <circle
        class="body"
        cx={x}
        cy={y}
        r={getRadius(charge)}
        fill={color}
        stroke="rgba(0,0,0,.2)"
        stroke-width=".5px"
      />
      <text {x} {y}>{name}</text>
    </g>
  {/each}
</svg>

<style>
  svg {
    max-width: 100dvw;
    max-height: 100dvh;
    z-index: 1;
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

  .body {
    filter: drop-shadow(0.05rem 0.1rem 0.1rem rgba(0, 0, 0, 0.3));
  }
  .highlight {
    transform-box: fill-box;
    transform-origin: center;
    transform: scale(1.2);
    filter: drop-shadow(0 0 0.1rem rgb(244, 239, 211));
    animation: bounce ease-in-out 0.5s infinite alternate;
  }
  @keyframes bounce {
    from {
      stroke: rgba(255, 255, 255, 0);
      transform: scale(1);
    }
    to {
      stroke: rgba(255, 255, 255, 1);
      transform: scale(2);
    }
  }
</style>
