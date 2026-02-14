<script lang="ts">
  import { onMount } from "svelte";
  import { vertexShaderSource, fragmentShaderSource } from "./waterShaders";

  let { worldSize, svgSize }: { worldSize: number; svgSize: number } = $props();

  let width = $state(100);
  let height = $state(100);
  let canvas: HTMLCanvasElement | undefined = $state();

  function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  onMount(() => {
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const iceRadiusLocation = gl.getUniformLocation(program, "u_iceRadius");

    let startTime = Date.now();
    let rid: number;

    function render() {
      if (!canvas || !gl) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (Date.now() - startTime) / 1000);

      // Ice radius in UV coords - accounts for SVG being square but screen not
      // SVG fits to smaller dimension and is centered
      const svgFraction = worldSize / svgSize; // Fraction of SVG that ice takes (radius/viewbox)
      const minDim = Math.min(canvas.width, canvas.height);

      // In UV coords: SVG takes up (minDim/screenDim) in each direction
      // Ice radius in UV = svgFraction * (minDim / screenDim)
      const iceRadiusX = svgFraction * (minDim / canvas.width);
      const iceRadiusY = svgFraction * (minDim / canvas.height);
      gl.uniform2f(iceRadiusLocation, iceRadiusX, iceRadiusY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rid = requestAnimationFrame(render);
    }

    render();

    return () => cancelAnimationFrame(rid);
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
