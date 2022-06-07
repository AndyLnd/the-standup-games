<script lang="ts">
  export let id: string;
  export let isHost: boolean;
  import {
    gameStore,
    handleKeyDown,
    handleKeyUp,
    update,
    boardR,
    playerR,
    GameState,
    kickRadius,
    reset,
  } from './rumbleStore';
  import { onMount } from 'svelte';
  onMount(() => {
    update();
  });
  const size = (boardR + playerR) * 2;
  const offset = size / 2;
  const getRadius = (c: number) => (c > 15 ? playerR : ((Math.min(0, c - 15) / -15) * kickRadius + 1) * playerR);
</script>

<svelte:body on:keydown={ev => handleKeyDown(id, ev.code)} on:keyup={ev => handleKeyUp(id, ev.code)} />

<svg viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <circle r={boardR} cx={offset} cy={offset} fill="#797b82" stroke="rgba(255,128,128,.2)" stroke-width="3px" />
  {#each $gameStore.players as { color, name, x, y, id, isAlive, charge } (id)}
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

{#if $gameStore.state === GameState.GameOver}
  <div class="gameover-list">
    {#each $gameStore.lost as name, i}
      <div class="name" style="--size: {(i / $gameStore.lost.length) * 1 + 2}rem">{name}</div>
    {/each}
    {#if isHost}
      <button on:click={reset}>Again!</button>
    {/if}
  </div>
{/if}

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
