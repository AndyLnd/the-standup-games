<script lang="ts">
  import { onMount } from "svelte";

  import {
    connect,
    gameState,
    hasRoom,
    self,
    GameState,
  } from "./slimeVolleyStore";

  import Lobby from "./Lobby.svelte";
  import Game from "./Game.svelte";
  import ForkMe from "../../../apps/client/src/lib/ForkMe.svelte";

  let { browser, roomId = undefined, goto }: {
    browser: boolean;
    roomId?: string;
    goto: (path: string, options?: object) => void;
  } = $props();

  let loadingError = $state(0);

  onMount(async () => {
    if (!browser) return;
    if (roomId && !$hasRoom) {
      const { error } = await connect(goto, roomId);
      loadingError = error ?? 0;
    }
  });

  const hostGame = async () => {
    const { roomId: newRoomId, error } = await connect(goto);
    loadingError = error ?? 0;
    if (newRoomId) {
      goto(`/slimevolley/${newRoomId}`);
    }
  };
</script>

<ForkMe />

{#if !roomId}
  <section>
    <h1>SlimeVolley</h1>
    <p>2-Player Online Volleyball</p>
    <button class="host" onclick={() => hostGame()}>Host Game</button>
  </section>
{:else if loadingError}
  <section>
    <p>
      {loadingError === 409
        ? "Sorry, the game is already in progress."
        : "Sorry, you can't join this game."}
    </p>
    <p>Try hosting a new one.</p>
    <button class="host" onclick={() => hostGame()}>Host Game</button>
  </section>
{:else if !$self}
  <section>
    <div>loading ...</div>
  </section>
{:else if $gameState === GameState.Lobby}
  <Lobby {browser} />
{:else}
  <Game />
{/if}

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
    gap: 1rem;
  }
  h1 {
    margin-bottom: 0;
  }
  p {
    margin-top: 0;
    opacity: 0.7;
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
