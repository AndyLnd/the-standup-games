<script lang="ts">
  import { goto } from "$app/navigation";
   const hostNewGame = () => {
    const name = Math.random().toString(36).substring(2);
    goto(`/${name}`);
  };
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <button on:click={() => hostNewGame()}>Host game</button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }
</style>
