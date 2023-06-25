<script lang="ts">
	import { onMount } from 'svelte';
  import confetti from 'canvas-confetti';
  import { isHost, getLoserList, reset } from "./rumbleStore";

  onMount(() => {
    confetti({
      particleCount: 150,
      spread: 150,
    });
	});
</script>

<div class="gameover-list">
  {#each getLoserList().reverse() as { name, color }, i}
    <div class="name" style="--color:{color}">
      <div>{i === 0 ? "👑" : `${i + 1}.`}</div>
      <div>{name}</div>
    </div>
  {/each}
  {#if $isHost}
    <button on:click={reset}>Again!</button>
  {/if}
</div>

<style>
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
    z-index: 4;
  }

  .name {
    font-size: 1.5rem;
    line-height: 2.5rem;
    display: flex;
    min-width: 10rem;
    background: linear-gradient(
      15deg,
      rgba(var(--color), 1) 0%,
      rgba(0, 0, 0, 0) 50%
    );
    border-radius: 0 0 0 1rem;
    margin-bottom: 1rem;
  }
  .name div:first-of-type {
    min-width: 2rem;
    text-align: right;
    margin-right: 0.5rem;
  }

  button {
    cursor: pointer;
    font-size: 2rem;
    background-color: black;
    color: white;
    border: 1px solid white;
    border-radius: 0.5rem;
    padding: 0.5rem;
  }
</style>
