<script lang="ts">
  import { onMount } from "svelte";

  let width = $state(100);
  let height = $state(100);
  let canvas: HTMLCanvasElement | undefined = $state();
  type Star = { x: number; y: number; s: number };
  let stars: Star[] = [];

  onMount(() => {
    if (!canvas) return;
    stars = Array.from({ length: 250 }, () => newStar());
    const ctx = canvas.getContext("2d")!;
    let lastTime = Date.now();
    let rid = requestAnimationFrame(function update() {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      stars = stars.map((s) => updateStar(s, width / 15 / deltaTime));

      const scale = Math.sqrt(width ** 2 + height ** 2) / 1000;

      // Clear to transparent
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      // Draw stars
      ctx.fillStyle = "#fff";
      stars.forEach(({ x, y, s }) => {
        ctx.beginPath();
        ctx.arc(x, y, s * scale, 0, 2 * Math.PI);
        ctx.fill();
      });

      rid = requestAnimationFrame(update);
    });

    return () => cancelAnimationFrame(rid);
  });

  const updateStar = ({ x, y, s }: Star, speed: number) => {
    x -= s * speed;
    if (x <= -1) return newStar(width + 3);
    return { x, y, s };
  };

  const newStar = (x = Math.random() * width): Star => ({
    x,
    y: Math.random() * height,
    s: (Math.random() * 0.7 + 0.3) ** 2,
  });
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<canvas bind:this={canvas} {width} {height}></canvas>

<style>
  canvas {
    object-fit: cover;
    position: absolute;
    width: 100dvw;
    height: 100dvh;
    left: 0;
    top: 0;
    z-index: 0;
  }
</style>
