<script lang="ts">
  export let browser = false;
  import { onMount } from "svelte";
  import {
    isHost,
    self,
    players,
    setReady,
    start,
    setName,
    setColor,
  } from "./rumbleStore";

  let userName = "";
  let userColor = "";

  const setUserName = (name: string) => {
    localStorage.setItem("userName", name);
    setName(name);
  };

  const setUserColor = (color: string) => {
    localStorage.setItem("userColor", color);
    setColor(color);
  };

  onMount(() => {
    if (!browser) return;
    userName = localStorage.getItem("userName") || "Guest";
    userColor =
      localStorage.getItem("userColor") ||
      `#${Math.random().toString(16).substring(2, 8)}`;
    setUserName(userName);
    setUserColor(userColor);
  });
</script>

<section>
  <h2>Join Game</h2>
  <div class="setup">
    <input
      disabled={$self?.isReady}
      bind:value={userColor}
      type="color"
      on:input={() => setUserColor(userColor)}
    />
    <input
      autofocus
      disabled={$self?.isReady}
      bind:value={userName}
      maxlength="8"
      on:input={() => setUserName(userName)}
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
      <div class="player" class:playerready={player.isReady}>
        <div class="ready">{player.isReady ? "✅" : "❓"}</div>
        <div class="color" style="background-color: {player.color}" />
        <div>{player.name}</div>
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
    padding-top: 2rem;
  }
  section > * {
    min-width: 400px;
    margin: 1rem auto;
  }
  h2 {
    text-align: center;
  }
  .player-list {
    display: flex;
    flex-direction: column;
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
    display: flex;
    justify-content: center;
  }

  .setup input {
    color: black;
    height: 100%;
    padding: 0;
    border: 0;
  }
  .setup input:first-of-type {
    border-top-left-radius: 0.2rem;
    border-bottom-left-radius: 0.2rem;
    padding: 0 0.25rem 0 0.2rem;
  }
  .setup input:nth-child(2) {
    padding-left: 0.25rem;
  }

  .setup button {
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
</style>
