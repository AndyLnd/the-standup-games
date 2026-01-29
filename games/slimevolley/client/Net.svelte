<script lang="ts">
  let { x = 397, y = 510, width = 6, height = 70 }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } = $props();
</script>

<rect {x} {y} {width} {height} fill="white" />
