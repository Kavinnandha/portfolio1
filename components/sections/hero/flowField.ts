/**
 * The hero background, in raw WebGL: one full-screen triangle and a fragment
 * shader that paints a slow, domain-warped noise field in the site palette —
 * paper ground, paper-2 clouds, an accent-soft wash and a small luminous
 * accent core that leans toward the pointer with an eased lag.
 *
 * The field is deliberately low-frequency, so it renders at a bounded pixel
 * count (DPR ≤ 2, ≤ 1.5 on touch, plus a pixel budget) and is upscaled by the
 * compositor — indistinguishable, and cheap on integrated GPUs.
 *
 * The canvas is created and owned here, so every mount gets a fresh context
 * and `destroy()` can release it outright (WEBGL_lose_context) on unmount.
 */

type FlowFieldOptions = {
  /** Reduced motion: draw one still frame (and again on resize), never animate. */
  still: boolean;
  /** Lean toward a mouse/pen pointer. */
  interactive: boolean;
};

const VERT = /* glsl */ `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_lean;
varying vec2 v_uv;

// Palette, linearised from sRGB so the blends read as light, not mud.
const vec3 PAPER  = vec3(0.9047, 0.8879, 0.8469); // #f4f2ed
const vec3 PAPER2 = vec3(0.8308, 0.8069, 0.7531); // #ebe8e1
const vec3 SOFT   = vec3(0.7606, 0.7914, 1.0000); // #e2e6ff
const vec3 ACCENT = vec3(0.0241, 0.0578, 1.0000); // #2b44ff

// 2D simplex noise — Ashima Arts / Stefan Gustavson (MIT).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
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

float fbm(vec2 p) {
  float f = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    f += a * snoise(p);
    p = mat2(0.8, -0.6, 0.6, 0.8) * p * 2.02 + vec2(11.7, 3.1);
    a *= 0.5;
  }
  return f;
}

vec3 toSRGB(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), c));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  // Units of the shorter side, so shapes keep their size on portrait phones.
  vec2 box = u_res / min(u_res.x, u_res.y);
  vec2 p = (v_uv - 0.5) * box;
  vec2 ptr = (u_pointer - 0.5) * box;
  float t = u_time;

  // The field gathers gently toward the pointer.
  vec2 toPtr = ptr - p;
  p += toPtr * (0.14 * u_lean) * exp(-dot(toPtr, toPtr) * 1.8);

  // Slow domain warp feeding a low-frequency fbm.
  vec2 q = vec2(snoise(p * 0.85 + vec2(0.0, t * 0.05)),
                snoise(p * 0.85 + vec2(5.2, 1.3) - vec2(t * 0.04, 0.0)));
  float n = fbm(p * 0.7 + q * 0.9 + vec2(t * 0.018, -t * 0.012));

  // Paper ground with soft paper-2 clouds.
  vec3 col = mix(PAPER, PAPER2, smoothstep(-0.15, 0.7, n) * 0.85);

  // Accent-soft wash: drifts on its own, leans toward the pointer.
  vec2 home = (vec2(0.72, 0.64) - 0.5) * box + vec2(0.08 * sin(t * 0.13), 0.06 * cos(t * 0.1));
  vec2 c = mix(home, ptr, 0.4 * u_lean);
  float d = length((p - c) * vec2(0.82, 1.0)) + 0.18 * n + 0.06 * q.x;
  col = mix(col, SOFT, (1.0 - smoothstep(0.0, 0.58, d)) * 0.88);

  // Luminous accent core, used sparingly.
  float core = exp(-pow(max(d, 0.0) * 4.4, 2.0));
  col = mix(col, ACCENT, core * 0.36);

  // Settle to plain paper at the bottom edge: a seamless hand-off to the page.
  col = mix(PAPER, col, smoothstep(0.0, 0.28, v_uv.y));

  // Tiny static dither so the 8-bit gradient never bands.
  vec3 rgb = toSRGB(col) + (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(rgb, 1.0);
}
`;

/** Drawing-buffer pixel budget — above it the soft field renders smaller and is upscaled. */
const MAX_PIXELS = 1_400_000;
/** Start a way into the noise so the first frame is already composed. */
const TIME_SEED = 37;
/** The frame shown under reduced motion. */
const STILL_TIME = 52;
/** Skip frames closer together than this (ms): ~60fps is plenty on 120Hz+ screens. */
const MIN_FRAME_MS = 13;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * Mounts the field as a canvas inside `host`. Returns `destroy`, or null when
 * WebGL is unavailable (or software-only) — the host's CSS gradient then
 * stays as the fallback.
 */
export function createFlowField(host: HTMLElement, { still, interactive }: FlowFieldOptions): (() => void) | null {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className =
    "pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-[1400ms] ease-out-expo";

  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return null;
  host.appendChild(canvas);

  const parallel = gl.getExtension("KHR_parallel_shader_compile");

  let program: WebGLProgram | null = null;
  let vert: WebGLShader | null = null;
  let frag: WebGLShader | null = null;
  let buffer: WebGLBuffer | null = null;
  let uRes: WebGLUniformLocation | null = null;
  let uTime: WebGLUniformLocation | null = null;
  let uPointer: WebGLUniformLocation | null = null;
  let uLean: WebGLUniformLocation | null = null;

  let ready = false;
  let lost = false;
  let destroyed = false;
  let inView = true;
  let pageVisible = document.visibilityState !== "hidden";
  let raf = 0;
  let pollRaf = 0;
  let last = 0;
  let time = still ? STILL_TIME : TIME_SEED;
  // Pointer in uv space (y up); `lean` is how strongly the field follows it.
  const ptr = { x: 0.7, y: 0.62, tx: 0.7, ty: 0.62, lean: 0, targetLean: 0 };

  const draw = () => {
    if (!ready || lost) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uPointer, ptr.x, ptr.y);
    gl.uniform1f(uLean, ptr.lean);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Layout size (clientWidth ignores the scroll-out transforms on ancestors).
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const cap = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;
    const ratio = Math.min(window.devicePixelRatio || 1, cap, Math.sqrt(MAX_PIXELS / (w * h)));
    const bw = Math.max(1, Math.round(w * ratio));
    const bh = Math.max(1, Math.round(h * ratio));
    if (bw === canvas.width && bh === canvas.height) return;
    canvas.width = bw;
    canvas.height = bh;
    draw(); // resizing clears the buffer — repaint in the same frame
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (last && now - last < MIN_FRAME_MS) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;
    time += dt;
    const follow = 1 - Math.exp(-dt * 2.6); // eased lag toward the pointer
    ptr.x += (ptr.tx - ptr.x) * follow;
    ptr.y += (ptr.ty - ptr.y) * follow;
    ptr.lean += (ptr.targetLean - ptr.lean) * (1 - Math.exp(-dt * 1.4));
    draw();
  };

  const sync = () => {
    const run = ready && !lost && !destroyed && !still && inView && pageVisible;
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const fail = () => {
    ready = false;
    sync();
    canvas.remove(); // the host's CSS gradient carries on alone
  };

  const setup = () => {
    vert = compile(gl, gl.VERTEX_SHADER, VERT);
    frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    program = gl.createProgram();
    if (!vert || !frag || !program) return fail();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.bindAttribLocation(program, 0, "a_pos");
    gl.linkProgram(program);

    // With KHR_parallel_shader_compile the driver links off the main thread;
    // poll instead of blocking the hero entrance that is starting right now.
    const finish = () => {
      pollRaf = 0;
      if (destroyed || lost || !program) return;
      if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
        pollRaf = requestAnimationFrame(finish);
        return;
      }
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[hero] flow field failed to link:", gl.getProgramInfoLog(program), frag && gl.getShaderInfoLog(frag));
        }
        return fail();
      }
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(program, "u_res");
      uTime = gl.getUniformLocation(program, "u_time");
      uPointer = gl.getUniformLocation(program, "u_pointer");
      uLean = gl.getUniformLocation(program, "u_lean");

      ready = true;
      resize();
      draw();
      canvas.style.opacity = "1"; // cross-fades over the CSS fallback
      sync();
    };
    finish();
  };

  const onLost = (e: Event) => {
    e.preventDefault(); // allow a restore
    lost = true;
    ready = false;
    canvas.style.opacity = "0";
    sync();
  };
  const onRestored = () => {
    lost = false;
    setup();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch" || !raf) return;
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    ptr.tx = clamp((e.clientX - r.left) / r.width, -0.2, 1.2);
    ptr.ty = clamp(1 - (e.clientY - r.top) / r.height, -0.2, 1.2);
    ptr.targetLean = 1;
  };
  const onPointerOut = (e: PointerEvent) => {
    if (!e.relatedTarget) ptr.targetLean = 0; // left the window
  };
  const onVisibility = () => {
    pageVisible = document.visibilityState !== "hidden";
    sync();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (entry) inView = entry.isIntersecting;
    sync();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  if (interactive && !still) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
  }

  setup();

  return () => {
    destroyed = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(pollRaf);
    raf = 0;
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerout", onPointerOut);
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    if (!gl.isContextLost()) {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
  };
}
