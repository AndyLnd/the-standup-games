<script lang="ts">
  export let height: number = 20;
</script>

<linearGradient id="floor-gradient" x2="0" y2="1">
  <stop offset="0%" stop-color="#23420e" />
  <stop offset="100%" stop-color="#637844" />
</linearGradient>
<rect
  class="floor"
  x={0}
  y={600 - height}
  width={800}
  {height}
  fill="url(#floor-gradient)"
/>
