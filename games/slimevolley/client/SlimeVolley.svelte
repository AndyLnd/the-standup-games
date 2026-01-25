<script>
  import Ball from "./Ball.svelte";
  import Floor from "./Floor.svelte";
  import GameContainer from "./GameContainer.svelte";
  import ScoreBoard from "./ScoreBoard.svelte";
  import Slime from "./Slime.svelte";
</script>

<GameContainer width={800} height={600}>
  {#if $game.gameOver}
    <g class="spin">
      <text x={400} y={300}>
        <tspan on:click={startGame} text-anchor="middle">🏐</tspan>
      </text>
    </g>
  {:else}
    <ScoreBoard {maxScore} score={$game.scoreL} x={20} y={30} />
    <ScoreBoard {maxScore} toLeft score={$game.scoreR} x={600} y={30} />
  {/if}
  <Floor height={20} />
  <rect {...net} fill="white" />
  <Slime
    pos={$slimeL.p}
    isDancing={$game.started && !$game.ballIsHot && $game.leftWonLast}
    facingRight
    target={$ball.p}
    color="blue"
  />
  <Slime
    pos={$slimeR.p}
    isDancing={$game.started && !$game.ballIsHot && !$game.leftWonLast}
    target={$ball.p}
    color="red"
  />
  <Ball pos={$ball.p} r={$ball.r} />
</GameContainer>
