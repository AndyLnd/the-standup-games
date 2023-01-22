<script lang="ts">
  export let browser: boolean;
  export let roomId: string | undefined = undefined;
  export let goto: (path: string) => void;
  import { onMount } from "svelte";

  import {
    connect,
    onFrame,
    updatePlayers,
    gameState,
    hasRoom,
    self,
  } from "./rumbleStore";
  import { GameState } from "rumble/server/schema/Rumble";

  import Lobby from "./Lobby.svelte";
  import Game from "./Game.svelte";
  import Scores from "./Scores.svelte";
  import ForkMe from "../../../apps/client/src/lib/ForkMe.svelte";

  onMount(() => {
    if (!browser) return;
    if (roomId && !$hasRoom) {
      connect(roomId);
    }
    onFrame((dt) => {
      if ($gameState === GameState.InGame) updatePlayers(dt!);
    });
  });

  const hostGame = async () => {
    const { roomId } = await connect();
    goto(`/rumble/${roomId}`);
  };
</script>

<ForkMe />

{#if !roomId}
  <section>
    <button class="host" on:click={() => hostGame()}>Host Game</button>
  </section>
{:else if !$self}
  <div>loading ...</div>
{:else if $gameState === GameState.Lobby}
  <Lobby {browser} />
{:else}
  <Game />
  {#if $gameState === GameState.GameOver}
    <Scores />
  {/if}
{/if}

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
  }
  button {
    cursor: pointer;
    font-size: 2rem;
    background-color: black;
    color: white;
    border: 1px solid white;
    border-radius: 0.5rem;
    padding: 1rem;
  }
</style>
