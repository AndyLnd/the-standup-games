<script lang="ts">
  export let width = 800;
  export let height = 600;
</script>

<svg viewBox="0 0 {width} {height}" {width} {height}>
  <slot />
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
