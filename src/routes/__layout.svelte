<script>
  import "../app.css";
</script>

<svelte:head>
  <title>Rumble</title>
</svelte:head>

<main>
  <slot />
</main>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
