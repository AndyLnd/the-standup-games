<script lang="ts">
  import type { Vec } from "utils";

  let {
    pos = { x: 0, y: 0 },
    parentPos = { x: 0, y: 0 },
    target = { x: 0, y: 0 }
  }: { pos?: Vec; parentPos?: Vec; target?: Vec } = $props();

  let blink = $state(false);
  const initBlink = () => {
    blink = false;
    setTimeout(() => {
      blink = true;
      setTimeout(initBlink, 60);
    }, Math.random() * 2000 + 1000);
  };
  initBlink();

  let pupil = $derived.by(() => {
    const diffX = target.x - (parentPos.x + pos.x);
    const diffY = target.y - (parentPos.y + pos.y);
    const length = Math.sqrt(diffX ** 2 + diffY ** 2);
    const scale = length > 4 ? length / 4 : 1;
    return { x: diffX / scale, y: diffY / scale };
  });
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
