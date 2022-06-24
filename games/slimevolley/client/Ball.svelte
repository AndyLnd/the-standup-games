<script lang="ts">
  import { Vec } from "utils";
  export let pos: Vec = { x: 0, y: 0 };
  export let r = 0;
</script>

<radialGradient id="ball-gradient" cx="50%" cy="25%" fx="50%" fy="25%">
  <stop offset="0%" stop-color="#fff820" />
  <stop offset="100%" stop-color="#d0bc32" />
</radialGradient>

<circle
  cx="0"
  cy="0"
  {r}
  fill="url(#ball-gradient)"
  transform="translate({pos.x}
  {pos.y})"
/>
