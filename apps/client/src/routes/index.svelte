<script lang="ts">
  import { goto } from '$app/navigation';
  import Logo from '$lib/Logo.svelte';
  const hostNewGame = () => {
    const name = Math.random().toString(36).substring(2);
    goto(`/${name}`);
  };
</script>

<svelte:head>
  <title>The Standup Games</title>
</svelte:head>

<section>
  <Logo />
  <button on:click={() => hostNewGame()}>Host Game</button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
  }
  button {
    cursor: pointer;
    font-size: 2rem;
    background-color: black;
    color: white;
    border: 1px solid white;
    border-radius: 0.5rem;
    padding: 1rem;
  }

</style>
