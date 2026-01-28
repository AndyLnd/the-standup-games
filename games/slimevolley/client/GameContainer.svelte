<script lang="ts">
  import type { Snippet } from "svelte";
  let { width = 800, height = 600, children }: { width?: number; height?: number; children?: Snippet } = $props();
</script>

<svg viewBox="0 0 {width} {height}" {width} {height}>
  {@render children?.()}
</svg>

<style>
  svg {
    min-width: 800px;
    margin: auto;
    background: linear-gradient(
      0deg,
      rgba(34, 135, 195, 1) 0%,
      rgba(255, 238, 202, 1) 100%
    );
  }
</style>
