<script lang="ts">
  import type { Vec } from "utils";
  let { pos = { x: 0, y: 0 }, r = 0 }: { pos?: Vec; r?: number } = $props();
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
