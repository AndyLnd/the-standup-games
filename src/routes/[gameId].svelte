<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/env';
  import { players, initGame, setName, setColor, setReady, isReady, isHost } from '$lib/lobby';
  import { connectAsHost } from '$lib/webRtc';
  import { GameState, gameStore, startGame } from '$lib/games/rumbleStore';
  import Rumble from '$lib/games/rumble.svelte';

  const { gameId } = $page.params;
  let userName = '';
  let userColor = '';

  const setUserName = (name: string) => {
    localStorage.setItem('userName', name);
    setName(name);
  };

  const setUserColor = (color: string) => {
    localStorage.setItem('userColor', color);
    setColor(color);
  };

  if (browser) {
    userName = localStorage.getItem('userName') || 'Guest';
    userColor = localStorage.getItem('userColor') || `#${Math.random().toString(16).substring(2, 8)}`;
    setUserName(userName);
    setColor(userColor);
    initGame(userName, gameId);
  }

  const start = async () => {
    await connectAsHost();
    startGame();
  };
</script>

{#if $gameStore.state !== GameState.Lobby}
  <Rumble />
{:else}
  {#if $isHost}
    <p>You are hosting</p>
  {/if}
  <div class="setup">
    <input disabled={$isReady} bind:value={userColor} type="color" on:input={() => setUserColor(userColor)} />
    <input disabled={$isReady} bind:value={userName} maxlength="8" on:input={() => setUserName(userName)} />
    <button disabled={userName.trim().length === 0} class:isReady={$isReady} on:click={() => setReady(!$isReady)}
      >{$isReady ? 'Wait, wait!' : "Let's go!"}</button
    >
  </div>

  <div class="player-list">
    {#each $players as player (player.id)}
      <div class="player">
        <div class="ready">{player.isReady ? '✅' : '❓'}</div>
        <div class="color" style="background-color: {player.color}" />
        <div>{player.name}</div>
      </div>
    {/each}
  </div>

  {#if $isHost}
    <button disabled={$players.some(p => !p.isReady)} on:click={start}>Start</button>
  {/if}
{/if}

<style>
  .player-list {
    display: flex;
    flex-direction: column;
  }
  .player {
    display: flex;
    align-items: center;
  }

  .setup {
    display: flex;
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
    background-color: rgb(95, 172, 95);
  }

  button.isReady {
    background-color: rgb(174, 100, 100);
  }
</style>
