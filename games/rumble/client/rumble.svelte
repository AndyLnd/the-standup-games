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
  import CountDown from "./CountDown.svelte";
  import Controls from "./Controls.svelte";

  let loadingError = 0;

  const isMobile =
    typeof navigator !== "undefined" &&
    /android|ip(hone|od|ad)/gi.test(navigator.userAgent);

  onMount(async () => {
    if (!browser) return;
    if (roomId && !$hasRoom) {
      const { error } = await connect(goto, roomId);
      loadingError = error ?? 0;
    }
    if (!loadingError) {
      onFrame((dt) => {
        if ($gameState === GameState.InGame) updatePlayers(dt!);
      });
    }
  });

  const hostGame = async () => {
    const { roomId, error } = await connect(goto);
    loadingError = error ?? 0;
    goto(`/rumble/${roomId}`);
  };
</script>

<ForkMe />

{#if !roomId}
  <section>
    <button class="host" on:click={() => hostGame()}>Host Game</button>
  </section>
{:else if loadingError}
  <section>
    <p>
      {loadingError === 409
        ? "Sorry, the round is already running."
        : "Sorry, you can't join this round."}
    </p>
    <p>Try hosting a new one.</p>
    <button class="host" on:click={() => hostGame()}>Host Game</button>
  </section>
{:else if !$self}
  <section>
    <div>loading ...</div>
  </section>
{:else if $gameState === GameState.Lobby}
  <Lobby {browser} />
{:else}
  <Game />

  {#if $gameState === GameState.CountDown}
    <CountDown />
  {/if}

  {#if isMobile}
    <Controls />
  {/if}

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
