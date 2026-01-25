<script>
  export let toLeft = false;
  export let maxScore = 5;
  export let score = 0;
  export let x = 0;
  export let y = 0;

  $: points = Array.from({ length: maxScore }, (_, i) =>
    toLeft ? i >= maxScore - score : i < score
  );
</script>

{#each points as point, i}
  <circle
    cx={(toLeft ? 800 - maxScore * 40 : 40) + i * 40}
    cy={40}
    r={16}
    fill={point ? 'url(#ball-gradient)' : 'none'}
    stroke="black" />
{/each}
