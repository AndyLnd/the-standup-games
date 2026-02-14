<script lang="ts">
  let { worldSize }: { worldSize: number } = $props();
  const height = 4;
  const numPoints = 24;
  const seed = 12345;

  // Seeded random number generator for consistent shape
  function seededRandom(s: number): () => number {
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  // Pre-generate consistent variations for each point
  // Centered around 1.0 so average radius matches collision circle
  const variations: number[] = [];
  const random = seededRandom(seed);
  for (let i = 0; i < numPoints; i++) {
    variations.push(0.97 + random() * 0.06);
  }

  // Generate ice floe data (returns array of {x, y} points)
  function generateIceFloeData(radius: number): Array<{ x: number; y: number }> {
    return variations.map((variation, i) => {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = radius * variation;
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r
      };
    });
  }

  function fmtPoint(x: number, y: number): string {
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }

  // Convert points to SVG polygon string
  function pointsToString(points: Array<{ x: number; y: number }>, offsetY = 0): string {
    return points.map(p => fmtPoint(p.x, p.y + offsetY)).join(' ');
  }

  // Generate side panels as array of polygon point strings
  function generateSidePanels(points: Array<{ x: number; y: number }>): string[] {
    return points.map((p1, i) => {
      const p2 = points[(i + 1) % points.length];
      return `${fmtPoint(p1.x, p1.y)} ${fmtPoint(p2.x, p2.y)} ${fmtPoint(p2.x, p2.y + height)} ${fmtPoint(p1.x, p1.y + height)}`;
    });
  }

  let iceData = $derived(generateIceFloeData(worldSize));
  let icePoints = $derived(pointsToString(iceData));
  let rimPoints = $derived(pointsToString(iceData, height));
  let sidePanels = $derived(generateSidePanels(iceData));

  // Underwater portion - slightly larger and offset
  let underwaterData = $derived(generateIceFloeData(worldSize * 1.08));
  let underwaterPoints = $derived(pointsToString(underwaterData, 12));
</script>

<defs>
  <!-- Ice surface gradient -->
  <radialGradient id="ice-surface" cx="30%" cy="30%">
    <stop offset="0%" stop-color="#ffffff" />
    <stop offset="40%" stop-color="#e8f4f8" />
    <stop offset="70%" stop-color="#c5dde8" />
    <stop offset="100%" stop-color="#a8ccd9" />
  </radialGradient>

  <!-- Ice rim/side gradient -->
  <linearGradient id="ice-rim" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#b8d4e3" />
    <stop offset="50%" stop-color="#7fb5cc" />
    <stop offset="100%" stop-color="#5a9ab8" />
  </linearGradient>

  <!-- Underwater shadow gradient (for circle) -->
  <radialGradient id="underwater-shadow" cx="50%" cy="40%" r="50%">
    <stop offset="0%" stop-color="#010d1a" stop-opacity="0.85" />
    <stop offset="50%" stop-color="#021428" stop-opacity="0.5" />
    <stop offset="100%" stop-color="#021428" stop-opacity="0" />
  </radialGradient>

  <!-- Snow texture pattern -->
  <filter id="ice-texture">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
    <feDiffuseLighting in="noise" lighting-color="#ffffff" surfaceScale="1.5" result="light">
      <feDistantLight azimuth="45" elevation="60" />
    </feDiffuseLighting>
    <feBlend in="SourceGraphic" in2="light" mode="overlay" />
  </filter>

  <!-- Underwater blur filter -->
  <filter id="underwater-blur" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
  </filter>

  <!-- Clip path for ice surface -->
  <clipPath id="ice-clip">
    <polygon points={icePoints} />
  </clipPath>
</defs>

<!-- Underwater shadow (deep submerged part) - uses circle for proper radial gradient -->
<ellipse
  cx={0}
  cy={25}
  rx={worldSize * 1.25}
  ry={worldSize * 1.1}
  fill="url('#underwater-shadow')"
  filter="url(#underwater-blur)"
/>

<!-- Water line / foam ring where ice meets water -->
<polygon
  points={rimPoints}
  fill="none"
  stroke="rgba(150, 200, 220, 0.5)"
  stroke-width="2"
/>

<!-- Ice rim (3D depth effect - bottom edge) -->
<polygon
  points={rimPoints}
  fill="url('#ice-rim')"
/>

<!-- Side panels connecting top surface to rim -->
{#each sidePanels as panel}
  <polygon points={panel} fill="url('#ice-rim')" />
{/each}

<!-- Main ice surface -->
<g clip-path="url(#ice-clip)">
  <polygon
    points={icePoints}
    fill="url('#ice-surface')"
    filter="url(#ice-texture)"
  />
</g>
<polygon
  points={icePoints}
  fill="none"
  stroke="#9ec5d6"
  stroke-width="0.5"
/>

