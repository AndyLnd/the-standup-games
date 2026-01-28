<script lang="ts">
  let {
    toLeft = false,
    maxScore = 5,
    score = 0,
    x = 0,
    y = 0
  }: { toLeft?: boolean; maxScore?: number; score?: number; x?: number; y?: number } = $props();

  let points = $derived(Array.from({ length: maxScore }, (_, i) =>
    toLeft ? i >= maxScore - score : i < score
  ));
</script>

{#each points as point, i}
  <circle
    cx={(toLeft ? 800 - maxScore * 40 : 40) + i * 40}
    cy={40}
    r={16}
    fill={point ? 'url(#ball-gradient)' : 'none'}
    stroke="black" />
{/each}
