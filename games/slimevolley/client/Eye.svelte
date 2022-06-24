<script lang="ts">
  import { Vec } from "utils";

  export let pos: Vec = { x: 0, y: 0 };
  export let parentPos: Vec = { x: 0, y: 0 };
  export let target = { x: 0, y: 0 };
  let pupil: Vec = { x: 0, y: 0 };

  let blink = false;
  const initBlink = () => {
    blink = false;
    setTimeout(() => {
      blink = true;
      setTimeout(initBlink, 60);
    }, Math.random() * 2000 + 1000);
  };
  initBlink();

  $: {
    const diffX = target.x - (parentPos.x + pos.x);
    const diffY = target.y - (parentPos.y + pos.y);
    const length = Math.sqrt(diffX ** 2 + diffY ** 2);
    const scale = length > 4 ? length / 4 : 1;
    pupil = { x: diffX / scale, y: diffY / scale };
  }
</script>

<g transform="translate({pos.x} {pos.y})">
  {#if blink}
    <circle cx="0" cy="0" r="10" fill="rgba(0,0,0,.3)" />
  {:else}
    <circle cx="0" cy="0" r="10" fill="white" />
    <circle
      cx="0"
      cy="0"
      r="6"
      fill="black"
      transform="translate({pupil.x} {pupil.y})"
    />
  {/if}
</g>
