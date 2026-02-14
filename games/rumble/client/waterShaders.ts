export const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_iceRadius;  // Ice floe radius in UV coords (x, y) - ellipse for non-square screens

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Organic blob layer using noise threshold
  float blobLayer(vec2 p, float t, float scale, float speed, vec2 offset) {
    vec2 uv = p * scale + offset;
    uv.x += t * speed;

    // Multiple noise octaves for organic shape
    float n = snoise(uv) * 0.6;
    n += snoise(uv * 2.1 + vec2(t * 0.1, 0.0)) * 0.25;
    n += snoise(uv * 4.3 - vec2(0.0, t * 0.08)) * 0.15;

    return n;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // Fix aspect ratio
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = uv;
    p.x *= aspect;

    // Stretch features in flow direction (horizontal)
    p.y *= 1.8;

    float t = u_time * 0.25;

    // Cold dark water colors
    vec3 waterDeep = vec3(0.02, 0.11, 0.20);
    vec3 waterMid = vec3(0.04, 0.18, 0.32);
    vec3 waterLight = vec3(0.06, 0.26, 0.42);
    vec3 causticDim = vec3(0.10, 0.30, 0.45);
    vec3 causticMid = vec3(0.22, 0.45, 0.58);
    vec3 causticBright = vec3(0.38, 0.62, 0.75);

    // Base deep water color
    vec3 color = waterDeep;

    // Layer 1 (deepest) - large, slow, faint
    float blob1 = blobLayer(p, t * 0.4, 1.2, 0.03, vec2(0.0, 0.0));
    float line1 = smoothstep(0.10, 0.0, abs(blob1 - 0.05));
    color = mix(color, waterMid, line1 * 0.12);
    color = mix(color, causticDim, line1 * 0.14);

    // Layer 2 (middle) - medium size, medium speed
    float blob2 = blobLayer(p, t * 0.7, 2.0, 0.06, vec2(3.0, 5.0));
    float line2 = smoothstep(0.08, 0.0, abs(blob2 - 0.08));
    color = mix(color, waterLight, line2 * 0.15);
    color = mix(color, causticMid, line2 * 0.22);

    // Layer 3 (upper) - smaller, faster, more visible
    float blob3 = blobLayer(p, t * 1.0, 3.0, 0.10, vec2(7.0, 2.0));
    float line3 = smoothstep(0.06, 0.0, abs(blob3 - 0.06));
    color = mix(color, waterLight, line3 * 0.16);
    color = mix(color, causticBright, line3 * 0.28);

    // Layer 4 (surface) - finest detail, fastest, most visible
    float blob4 = blobLayer(p, t * 1.4, 4.5, 0.14, vec2(12.0, 8.0));
    float line4 = smoothstep(0.05, 0.0, abs(blob4 - 0.04));
    color = mix(color, causticBright, line4 * 0.32);

    // Depth shading - darker in the "valleys"
    float depth = blob1 * 0.2 + blob2 * 0.3 + blob3 * 0.3 + blob4 * 0.2;
    color = mix(color, waterDeep, smoothstep(0.2, -0.3, depth) * 0.12);

    // Subtle highlights where surface lines overlap
    float surfaceOverlap = line3 * line4;
    color = mix(color, causticBright, surfaceOverlap * 0.18);

    // === Ice floe interaction waves ===
    // Calculate normalized distance from ice edge (1.0 = at ice edge)
    vec2 centerUV = vec2(0.5, 0.5);
    vec2 delta = uv - centerUV;

    // Normalize by ice radius in each direction (ellipse distance)
    vec2 normalizedDelta = delta / u_iceRadius;
    float distFromIceEdge = length(normalizedDelta);

    // waveZone: 0 at wave start (slightly inside ice edge), positive outside
    // Ice polygon varies 0.97-1.03, so start at 0.95 to stay hidden under polygon
    float waveZone = distFromIceEdge - 0.95;

    // Apply ripples outside ice edge (waveZone > 0)
    if (waveZone > 0.0 && waveZone < 1.5) {
      // Use normalized delta for continuous angular variation (avoids atan discontinuity)
      vec2 dir = normalize(delta);

      // Drift offset based on water flow direction
      float driftOffset = delta.x * t * 0.3;

      // Use sin/cos components for noise input (continuous around circle)
      float waveNoise = snoise(vec2(dir.x * 3.0 + dir.y * 2.0 + driftOffset, waveZone * 6.0 - t * 0.8)) * 0.08;
      float distortedZone = waveZone + waveNoise;

      // Multiple concentric ripples - slower, with drift influence
      float wave1 = sin(distortedZone * 35.0 - t * 3.0 + driftOffset);
      float wave2 = sin(distortedZone * 24.0 - t * 2.2 + 1.0 + driftOffset * 0.7);
      float wave3 = sin(distortedZone * 15.0 - t * 1.5 + 2.0 + driftOffset * 0.5);

      // Sharp wave crests (thin bright lines)
      float crest1 = smoothstep(0.7, 0.95, wave1);
      float crest2 = smoothstep(0.75, 0.95, wave2);
      float crest3 = smoothstep(0.8, 0.95, wave3);

      // Fade out with distance from ice edge
      float fade = 1.0 - smoothstep(0.0, 1.0, waveZone);

      // Combine crests
      float crests = max(max(crest1, crest2 * 0.6), crest3 * 0.4) * fade;

      // Add subtle wave highlights
      color = mix(color, causticBright, crests * 0.3);

      // Very subtle troughs between waves
      float trough1 = smoothstep(-0.3, -0.7, wave1) * fade * 0.08;
      color = mix(color, waterDeep, trough1);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
