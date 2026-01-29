<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    ball,
    leftPlayer,
    rightPlayer,
    scoreL,
    scoreR,
    gameState,
    leftWonLast,
    isHost,
    reset,
    handleKeyDown,
    handleKeyUp,
    GameState,
    NET,
  } from "./slimeVolleyStore";

  import GameContainer from "./GameContainer.svelte";
  import Floor from "./Floor.svelte";
  import Net from "./Net.svelte";
  import Slime from "./Slime.svelte";
  import BallComponent from "./Ball.svelte";
  import ScoreBoard from "./ScoreBoard.svelte";

  const maxScore = 5;

  const onKeyDown = (e: KeyboardEvent) => {
    handleKeyDown(e.code);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    handleKeyUp(e.code);
  };

  onMount(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  });
</script>

<div class="game-wrapper">
  <GameContainer width={800} height={600}>
    <ScoreBoard {maxScore} score={$scoreL} />
    <ScoreBoard {maxScore} toLeft score={$scoreR} />

    <Floor height={20} />
    <Net x={NET.x} y={NET.y} width={NET.width} height={NET.height} />

    {#if $leftPlayer}
      <Slime
        pos={{ x: $leftPlayer.p.x, y: $leftPlayer.p.y }}
        isDancing={$leftPlayer.isDancing}
        facingRight
        target={{ x: $ball.p.x, y: $ball.p.y }}
        color={$leftPlayer.color}
      />
    {/if}

    {#if $rightPlayer}
      <Slime
        pos={{ x: $rightPlayer.p.x, y: $rightPlayer.p.y }}
        isDancing={$rightPlayer.isDancing}
        target={{ x: $ball.p.x, y: $ball.p.y }}
        color={$rightPlayer.color}
      />
    {/if}

    <BallComponent pos={$ball.p} r={$ball.r} />

    {#if $gameState === GameState.GameOver}
      <g class="game-over">
        <text x={400} y={250} text-anchor="middle" class="winner-text">
          {$scoreL >= maxScore ? $leftPlayer?.name : $rightPlayer?.name} Wins!
        </text>
        {#if $isHost}
          <foreignObject x={300} y={280} width={200} height={50}>
            <button onclick={reset}>Play Again</button>
          </foreignObject>
        {/if}
      </g>
    {/if}
  </GameContainer>

  <div class="controls-hint">
    A/D or ←/→ to move, W or ↑ to jump
  </div>
</div>

<style>
  .game-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .controls-hint {
    width: 800px;
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.6;
  }

  :global(.winner-text) {
    font-size: 2rem;
    fill: white;
    font-weight: bold;
  }

  button {
    cursor: pointer;
    font-size: 1.2rem;
    background-color: rgb(95, 172, 95);
    color: black;
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    width: 100%;
  }
</style>
