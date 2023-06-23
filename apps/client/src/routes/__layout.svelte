<script>
  import '../app.css';
</script>

<svelte:head>
  <title>The Standup Games</title>
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
    height: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
