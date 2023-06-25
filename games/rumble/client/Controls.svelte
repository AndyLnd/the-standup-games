<script lang="ts">
  import { handleKeyDown, setKeys } from "./rumbleStore";
  let dpad: HTMLDivElement;

  const getKeys = (ev: PointerEvent) => {
    const x = ev.offsetX / dpad.offsetWidth;
    const y = ev.offsetY / dpad.offsetHeight;
    const low = 0.33;
    const high = 0.67;
    const keyX = x < low ? "ArrowLeft" : x > high ? "ArrowRight" : undefined;
    const keyY = y < low ? "ArrowUp" : y > high ? "ArrowDown" : undefined;
    return [keyX, keyY];
  };

  const handleDownEvent = (ev: PointerEvent) => {
    if (!ev.buttons) return;

    const keys = getKeys(ev).filter(Boolean) as string[];
    setKeys(keys);
  };

  const unpressAll = () => setKeys([]);
  const handleSpace = () => handleKeyDown("Space");
</script>

<div
  class="dpad"
  bind:this={dpad}
  on:pointerdown|preventDefault={handleDownEvent}
  on:pointerenter|preventDefault={handleDownEvent}
  on:pointermove|preventDefault={handleDownEvent}
  on:pointerup|preventDefault={unpressAll}
  on:pointerleave|preventDefault={unpressAll}
  on:pointercancel|preventDefault={unpressAll}
  on:dragstart|preventDefault
  on:touchstart|preventDefault
  on:mousedown|preventDefault
/>
<div class="kick" on:pointerdown|preventDefault={handleSpace} />

<style>
  div {
    position: absolute;
    z-index: 3;
    opacity: 0.5;
    overflow: hidden;
    border-radius: 50%;
    border: 2px solid white;
  }

  .dpad {
    bottom: 6vmax;
    left: 6vmax;
    width: 16vmax;
    height: 16vmax;
    background: radial-gradient(grey, white);
  }
  .dpad::after {
    position: absolute;
    content: "";
    display: block;
    background: black;
    inset: 0;
    clip-path: polygon(
      33% 0,
      67% 0,
      67% 33%,
      100% 33%,
      100% 67%,
      67% 67%,
      67% 100%,
      33% 100%,
      33% 67%,
      0 67%,
      0 33%,
      33% 33%
    );
  }

  .kick {
    bottom: 6dvmax;
    right: 6dvmax;
    width: 10dvmax;
    height: 10dvmax;
    background: radial-gradient(rgb(192, 111, 111), grey);
  }
</style>
