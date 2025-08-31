  <script lang="ts">
    export let worldSize = 0;
    const height = 6;
  </script>
  
  <defs>
    <radialGradient id="board">
      <stop offset="10%" stop-color="#696b72" />
      <stop offset="95%" stop-color="#797b82" />
    </radialGradient>
  </defs>

  <defs>
    <linearGradient id="rim">
      <stop offset="5%" stop-color="#432" />
      <stop offset="70%" stop-color="#210" />
      <stop offset="95%" stop-color="#432" />
    </linearGradient>
  </defs>

  <g fill="blue">
  <circle
    r={$worldSize}
    cx={0}
    cy={height}
    fill="url('#rim')"
  />
  <rect x={-$worldSize} y={0} width={$worldSize * 2} {height} fill="url('#rim')" />
  </g>
  <circle
    r={$worldSize}
    cx={0}
    cy={0}
    fill="url('#board')"
    stroke="rgb(196,128,64)"
    stroke-width="1px"
  />

