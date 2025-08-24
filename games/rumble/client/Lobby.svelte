<script lang="ts">
  export let browser = false;
  import { onMount } from "svelte";
  import { getRandomColor, getRandomName } from "utils/randomize";
  import {
    isHost,
    self,
    players,
    setReady,
    start,
    setName,
    setColor,
    kickPlayer,
    setGameTime,
    gameTime,
  } from "./rumbleStore";
  import CopyButton from "./CopyButton.svelte";

  let userName = "";
  let userColor = "";

  onMount(() => {
    if (!browser) return;
    userName = localStorage.getItem("userName") || getRandomName();
    userColor = localStorage.getItem("userColor") || getRandomColor();
  });

  $: if (userName) {
    localStorage.setItem("userName", userName);
    setName(userName);
  }

  $: if (userColor) {
    localStorage.setItem("userColor", userColor);
    setColor(userColor);
  }
</script>

<section>
  <h2>Join Game</h2>
  <div class="invite">
    <h4>{$players.size} {$players.size === 1 ? "player" : "players"}</h4>
    <CopyButton copyString={window.location.href}>Copy Game Link</CopyButton>
  </div>
  <div class="gameTime">
    <div>Time Limit: {$gameTime}s</div>
    {#if $isHost}
      <input
        type="range"
        min={30}
        max={120}
        bind:value={$gameTime}
        on:change={(e) => setGameTime($gameTime)}
      />
    {/if}
  </div>

  <div class="setup">
    <div>
      <button
        disabled={$self?.isReady}
        on:click={() => {
          userName = getRandomName();
          userColor = getRandomColor();
        }}>🎲</button
      >
      <div class="tooltip">Surprise me!</div>
    </div>
    <input disabled={$self?.isReady} bind:value={userColor} type="color" />
    <input
      autofocus
      disabled={$self?.isReady}
      bind:value={userName}
      maxlength="8"
    />
    <button
      disabled={userName.trim().length === 0}
      class:isReady={$self?.isReady}
      on:click={() => setReady(!$self?.isReady)}
      >{$self?.isReady ? "Wait, wait!" : "Let's go!"}</button
    >
  </div>
  <div class="player-list">
    {#each [...$players] as [key, player] (key)}
      <div class="player-wrapper">
        <div class="player" class:playerready={player.isReady}>
          <div class="ready">{player.isReady ? "✅" : "❓"}</div>
          <div class="color" style="background-color: {player.color}" />
          <div>{player.name}</div>
        </div>
        {#if $isHost && !($self === player)}
          <button class="kick-button" on:click={() => kickPlayer(key)}>
            ❌
          </button>
        {/if}
      </div>
    {/each}
  </div>

  {#if $isHost}
    {#if [...$players].some(([_, p]) => !p.isReady)}
      <button disabled>Waiting ...</button>
    {:else}<button on:click={start}>Start</button>{/if}
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 2rem;
    gap: 1rem;
  }
  section > * {
    min-width: 400px;
    margin: 0;
  }
  h2,
  h4 {
    text-align: center;
  }
  .player-list {
    display: flex;
    flex-direction: column;
  }

  .player-wrapper {
    display: grid;
    grid-template-columns: 1fr auto;
  }
  .player {
    margin: 0.2rem;
    border: 1px solid white;
    padding: 0.2rem;
    border-radius: 0.2rem;
    display: flex;
    align-items: center;
  }
  .playerready {
    background: rgba(0, 255, 0, 0.1);
  }

  .setup {
    display: grid;
    justify-content: center;
    grid-template-columns: auto auto 1fr auto;
  }

  .setup input {
    color: black;
    height: 100%;
    padding: 0;
    border: 0;
  }

  .setup div {
    display: flex;
    position: relative;
  }
  .setup div .tooltip {
    pointer-events: none;
    opacity: 0;
    position: absolute;
    transition: all ease-in 0.1s;
    font-weight: 900;
    rotate: 0;
    translate: -30px -15px;
    scale: 0.5;
    color: rgb(241, 244, 146);
    text-shadow: 1px 1px 0 rgb(53, 0, 0);
    white-space: nowrap;
  }
  .setup div:hover .tooltip {
    opacity: 1;
    scale: 1;
    rotate: -15deg;
  }
  .setup div button:first-of-type {
    border-top-left-radius: 0.2rem;
    border-bottom-left-radius: 0.2rem;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding: 0.25rem 0.5rem;
    width: auto;
  }
  .setup input:nth-child(2) {
    padding: 0 0.25rem 0 0.2rem;
    border-radius: 0;
  }

  .setup input:nth-child(3) {
    padding-left: 0.25rem;
  }

  .setup button:first-of-type {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    width: 5rem;
  }

  .ready {
    width: 1rem;
    text-align: center;
  }

  .color {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin: 0 0.5rem;
  }

  button {
    cursor: pointer;
    border-radius: 0.2rem;
    background-color: rgb(95, 172, 95);
    border: none;
    padding: 0.5rem;
  }

  button.isReady {
    background-color: rgb(174, 100, 100);
  }

  button.kick-button {
    margin: 0.2rem;
    padding: unset;
    background-color: black;
    border: 1px solid white;
    width: 32px;
  }
  .gameTime {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin: 1.5rem auto;
  }
  .gameTime div {
    margin: auto;
  }
  .gameTime input {
    flex-grow: 1;
  }

  .invite{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }
</style>
