<script lang="ts">
  import { onMount } from "svelte";
  let hasFocus = $state(typeof document !== "undefined" ? document.hasFocus() : true);

  onMount(() => {
    const intervalId = setInterval(() => {
      hasFocus = document.hasFocus();
    }, 100);
    return () => clearInterval(intervalId);
  });
</script>


<div class="warning" class:hasFocus>
  <div>Click to Play</div>
  <p>Keyboard controls only work when the game window is focused.</p>
</div>

<style>
.warning {
 padding: 5rem 0;
 display:flex;
 flex-direction: column;
 align-items: center;
 position: fixed;
 left:0;
 top:0;
 width: 100vw;
 background-image: linear-gradient(rgba(255,0,0,0), rgba(255,0,0,.8) 25%, rgba(255,0,0,.8) 75%, rgba(255,0,0,0));
 color: white;
 text-shadow: 0 0 10px black;
 top: 50%;
 translate: 0 -50%;
 z-index: 2;
}
.warning.hasFocus {
  display: none;
}
.warning div {
  font-weight: bold;
  font-size: 2rem;
}
</style>