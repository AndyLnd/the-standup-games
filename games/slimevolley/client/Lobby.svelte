<script lang="ts">
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
  } from "./slimeVolleyStore";
  import CopyButton from "./CopyButton.svelte";

  let { browser = false }: { browser?: boolean } = $props();

  let userName = $state("");
  let userColor = $state("");

  onMount(() => {
    if (!browser) return;
    userName = localStorage.getItem("userName") || getRandomName();
    userColor = localStorage.getItem("userColor") || getRandomColor();
  });

  $effect(() => {
    if (userName) {
      localStorage.setItem("userName", userName);
      setName(userName);
    }
  });

  $effect(() => {
    if (userColor) {
      localStorage.setItem("userColor", userColor);
      setColor(userColor);
    }
  });
</script>

<section>
  <h2>SlimeVolley</h2>
  <p class="subtitle">2-Player Volleyball</p>

  <div class="invite">
    <h4>{$players.size}/2 players</h4>
    <CopyButton copyString={window.location.href}>Copy Game Link</CopyButton>
  </div>

  <div class="setup">
    <div>
      <button
        disabled={$self?.isReady}
        onclick={() => {
          userName = getRandomName();
          userColor = getRandomColor();
        }}>🎲</button>
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
      onclick={() => setReady(!$self?.isReady)}
      >{$self?.isReady ? "Wait, wait!" : "Let's go!"}</button>
  </div>

  <div class="player-list">
    {#each [...$players] as [key, player] (key)}
      <div class="player" class:playerready={player.isReady}>
        <div class="ready">{player.isReady ? "✅" : "❓"}</div>
        <div class="color" style="background-color: {player.color}"></div>
        <div class="name">{player.name || "..."}</div>
        <div class="side">{player.side === "left" ? "⬅️ Left" : "Right ➡️"}</div>
      </div>
    {/each}
  </div>

  <div class="controls-info">
    <p><strong>Controls:</strong> A/D or ←/→ to move, W or ↑ to jump</p>
  </div>

  {#if $isHost}
    {#if $players.size < 2}
      <button disabled>Waiting for opponent...</button>
    {:else if [...$players].some(([_, p]) => !p.isReady)}
      <button disabled>Waiting for ready...</button>
    {:else}
      <button onclick={start}>Start Game</button>
    {/if}
  {:else}
    <p class="waiting">Waiting for host to start...</p>
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
  h2 {
    text-align: center;
    margin-bottom: 0;
  }
  .subtitle {
    text-align: center;
    opacity: 0.7;
    margin-top: 0;
  }
  h4 {
    text-align: center;
  }
  .player-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .player {
    margin: 0.2rem;
    border: 1px solid white;
    padding: 0.5rem;
    border-radius: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
    width: 1.5rem;
    text-align: center;
  }

  .color {
    width: 16px;
    height: 16px;
    border-radius: 8px;
  }

  .name {
    flex: 1;
  }

  .side {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  button {
    cursor: pointer;
    border-radius: 0.2rem;
    background-color: rgb(95, 172, 95);
    border: none;
    padding: 0.5rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.isReady {
    background-color: rgb(174, 100, 100);
  }

  .controls-info {
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.8;
    background: rgba(255,255,255,0.1);
    padding: 0.5rem 1rem;
    border-radius: 0.2rem;
  }

  .controls-info p {
    margin: 0.25rem 0;
  }

  .invite {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }

  .waiting {
    text-align: center;
    opacity: 0.7;
  }
</style>
