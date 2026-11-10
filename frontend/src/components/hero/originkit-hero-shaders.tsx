import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * OriginKit Hero 49 — Woven Fibre Arc WebGL Shader Background (`FibreArc`)
 * Renders 26 glowing parabolic fibre strands sweeping across a deep obsidian canvas
 * and parting radially around the pointer with exponential ease-out settling.
 * Includes graceful CSS fallback when WebGL is unavailable (e.g., jsdom/headless).
 */

const FIBRE_VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FIBRE_FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uHover;

uniform vec3 uBg, uBase, uAccent, uHigh;
uniform float uStrands, uCurve, uSpread, uThin, uComb, uReach, uDir;

float sat(float x){ return clamp(x, 0.0, 1.0); }
float pw(float x, float e){ return pow(max(x, 1e-5), e); }
float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

void main(){
  float ar = uRes.x / max(uRes.y, 1.0);
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(ar, 1.0);
  float t = uTime;
  vec2 apex = vec2(0.34, 0.20);

  float cs = cos(uDir), sn = sin(uDir);
  mat2 rot = mat2(cs, sn, -sn, cs);
  vec2 q  = rot * p;
  vec2 pm = q - rot * ((uMouse - 0.5) * vec2(ar, 1.0));
  vec2 ps = q - normalize(pm + vec2(1e-5)) * uComb * 0.10 * sat(uHover)
            * exp(-dot(pm, pm) / max(uReach * uReach, 1e-4));

  float core = 0.0, halo = 0.0;
  for(int i = 0; i < 26; i++){
    float fi = float(i);
    float f = fi / 25.0;
    float on = sat(uStrands - fi);
    float jit = hash21(vec2(fi, 1.7));
    float k = uCurve * (0.55 + 1.30 * f + 0.10 * jit);
    float ax = apex.x + (f - 0.5) * uSpread * 0.18;
    float ay = apex.y + (f - 0.5) * uSpread * 0.14 + 0.012 * sin(t * 0.5 + fi);
    float dx = ps.x - ax;
    float yc = ay - k * dx * dx;
    float sl = -2.0 * k * dx;
    float dd = abs(ps.y - yc) / sqrt(1.0 + sl * sl);
    float w = uThin * (0.0016 + 0.0032 * jit);
    core += on * pw(w / (w + dd), 3.2);
    halo += on * pw(w * 11.0 / (w * 11.0 + dd), 1.9) * 0.085;
  }

  float env = mix(0.20, 1.0, sat((ps.x + 0.52) / 0.95));
  core *= env;
  halo *= env;

  vec3 col = uBg;
  col += uBase * halo * 1.5;
  col += mix(uAccent, uHigh, sat(core * 0.75)) * core * 1.4;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compileWebGLShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function parseColorRgb(color: string | undefined, fallback: [number, number, number]): [number, number, number] {
  if (!color) return fallback;
  const trimmed = String(color).trim();
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return [r / 255, g / 255, b / 255];
      }
    }
  }
  return fallback;
}

function clampNum(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function isHeadlessJsdom(): boolean {
  return typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent || "");
}

export interface FibreArcCanvasProps {
  background?: string;
  baseColor?: string;
  accentColor?: string;
  highlight?: string;
  density?: number;
  speed?: number;
  direction?: number;
  hover?: number;
  reach?: number;
  curve?: number;
  spread?: number;
  thickness?: number;
  comb?: number;
  className?: string;
  style?: CSSProperties;
}

export function FibreArcCanvas({
  background = "#04070F",
  baseColor = "#1B4FD8",
  accentColor = "#6FC8FF",
  highlight = "#FFFFFF",
  density = 26,
  speed = 85,
  direction = 0,
  hover = 185,
  reach = 24,
  curve = 32,
  spread = 105,
  thickness = 95,
  comb = 165,
  className,
  style,
}: FibreArcCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  const configRef = useRef({
    background,
    baseColor,
    accentColor,
    highlight,
    density: clampNum(density, 4, 26),
    speed: clampNum(speed, 0, 100) / 50,
    direction: (clampNum(direction, 0, 360) * Math.PI) / 180,
    hover: clampNum(hover, 0, 200) / 100,
    reach: clampNum(reach, 5, 100) / 100,
    curve: clampNum(curve, 15, 400) / 100,
    spread: clampNum(spread, 0, 300) / 100,
    thickness: clampNum(thickness, 20, 400) / 100,
    comb: clampNum(comb, 0, 400) / 100,
  });

  configRef.current = {
    background,
    baseColor,
    accentColor,
    highlight,
    density: clampNum(density, 4, 26),
    speed: clampNum(speed, 0, 100) / 50,
    direction: (clampNum(direction, 0, 360) * Math.PI) / 180,
    hover: clampNum(hover, 0, 200) / 100,
    reach: clampNum(reach, 5, 100) / 100,
    curve: clampNum(curve, 15, 400) / 100,
    spread: clampNum(spread, 0, 300) / 100,
    thickness: clampNum(thickness, 20, 400) / 100,
    comb: clampNum(comb, 0, 400) / 100,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isHeadlessJsdom()) {
      setFallbackActive(true);
      return;
    }

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false });
    } catch {
      gl = null;
    }

    if (!gl) {
      setFallbackActive(true);
      return;
    }

    const vs = compileWebGLShader(gl, gl.VERTEX_SHADER, FIBRE_VERTEX_SHADER);
    const fs = compileWebGLShader(gl, gl.FRAGMENT_SHADER, FIBRE_FRAGMENT_SHADER);
    if (!vs || !fs) {
      setFallbackActive(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setFallbackActive(true);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallbackActive(true);
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const getLoc = (name: string) => {
      if (!(name in uniforms)) {
        uniforms[name] = gl!.getUniformLocation(program, name);
      }
      return uniforms[name];
    };

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, onTarget: 0 };
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let reducedMotion = false;

    const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mq) {
      reducedMotion = mq.matches;
    }

    const renderFrame = (now: number) => {
      if (!gl) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const cfg = configRef.current;
      if (!reducedMotion) {
        elapsed = (elapsed + dt * cfg.speed) % 3600;
      }

      const k = 1 - Math.exp(-6 * dt);
      pointer.on += (pointer.onTarget - pointer.on) * k;
      pointer.x += ((pointer.onTarget > 0 ? pointer.tx : 0.5) - pointer.x) * k;
      pointer.y += ((pointer.onTarget > 0 ? pointer.ty : 0.5) - pointer.y) * k;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 1200;
      const ch = canvas.clientHeight || 720;
      const w = Math.max(1, Math.round(cw * dpr));
      const h = Math.max(1, Math.round(ch * dpr));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      gl.viewport(0, 0, w, h);
      gl.uniform2f(getLoc("uRes"), w, h);
      gl.uniform1f(getLoc("uTime"), elapsed);
      gl.uniform2f(getLoc("uMouse"), pointer.x, 1 - pointer.y);
      gl.uniform1f(getLoc("uHover"), Math.min(1, pointer.on) * cfg.hover);

      const bg = parseColorRgb(cfg.background, [0.016, 0.027, 0.059]);
      const base = parseColorRgb(cfg.baseColor, [0.106, 0.31, 0.847]);
      const acc = parseColorRgb(cfg.accentColor, [0.435, 0.784, 1.0]);
      const hi = parseColorRgb(cfg.highlight, [1, 1, 1]);

      gl.uniform3f(getLoc("uBg"), bg[0], bg[1], bg[2]);
      gl.uniform3f(getLoc("uBase"), base[0], base[1], base[2]);
      gl.uniform3f(getLoc("uAccent"), acc[0], acc[1], acc[2]);
      gl.uniform3f(getLoc("uHigh"), hi[0], hi[1], hi[2]);
      gl.uniform1f(getLoc("uStrands"), cfg.density);
      gl.uniform1f(getLoc("uReach"), cfg.reach);
      gl.uniform1f(getLoc("uDir"), cfg.direction);
      gl.uniform1f(getLoc("uCurve"), cfg.curve);
      gl.uniform1f(getLoc("uSpread"), cfg.spread);
      gl.uniform1f(getLoc("uThin"), cfg.thickness);
      gl.uniform1f(getLoc("uComb"), cfg.comb);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(renderFrame);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        pointer.tx = clampNum((e.clientX - rect.left) / rect.width, 0, 1);
        pointer.ty = clampNum((e.clientY - rect.top) / rect.height, 0, 1);
        pointer.onTarget = 1;
      } else {
        pointer.onTarget = 0;
      }
    };

    const onPointerLeave = () => {
      pointer.onTarget = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerLeave, { passive: true });
    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerLeave);
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
      }
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        background,
        ...style,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: fallbackActive ? "none" : "block",
        }}
      />
      {fallbackActive ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 72% 38%, rgba(27, 79, 216, 0.32), rgba(111, 200, 255, 0.10) 48%, rgba(4, 7, 15, 0.98) 85%)",
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * OriginKit Hero 51 — Eye-Tracking Ray-Traced Iris WebGL Component (`GrinIris`)
 * Renders a procedural 3D fibrous iris refracted under a glassy cornea that
 * tracks the user's pointer across the page in real time.
 * Includes a crisp CSS radial fallback when WebGL is unavailable.
 */

const EYE_VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const EYE_FRAGMENT_SHADER = `
uniform vec2  uCenter;
uniform float uRadius;
uniform mat3  uRot;
uniform float uCosA;
uniform float uSinA;
uniform float uZc;
uniform float uRc;
uniform float uIrisZ;
uniform float uIrisR;
uniform float uPupil;
uniform float uMark;
uniform vec3  uIris;
uniform vec3  uSclera;
uniform vec3  uMarkCol;
uniform vec3  uCollar;
uniform vec2  uLight;
uniform float uGloss;
uniform float uRed;
uniform float uVeins;
uniform float uLimbus;
uniform float uFiber;
uniform float uTime;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float box(vec3 R, vec3 d, vec3 up, vec2 hw, float soft) {
  float k = dot(R, d);
  if (k <= 0.0) return 0.0;
  vec3 rt = normalize(cross(up, d));
  vec3 u = cross(d, rt);
  vec2 uv = vec2(dot(R, rt), dot(R, u)) / k;
  vec2 e = smoothstep(hw + soft, hw - soft, abs(uv));
  return e.x * e.y;
}

vec3 roll(vec3 v) {
  return vec3(uLight.x * v.x - uLight.y * v.y, uLight.y * v.x + uLight.x * v.y, v.z);
}

vec3 env(vec3 R) {
  vec3 c = vec3(0.0);
  c += vec3(1.0, 0.98, 0.97) * 16.0 *
       box(R, roll(normalize(vec3(0.40, 0.72, -0.55))), vec3(0.0, 0.0, 1.0), vec2(0.75, 0.75), 0.35);
  c += vec3(1.0, 0.97, 0.95) * 9.0 *
       box(R, roll(normalize(vec3(-0.92, 0.05, 0.25))), vec3(0.0, 1.0, 0.0), vec2(0.22, 0.65), 0.10);
  c += vec3(0.05, 0.045, 0.045) * (0.4 + 0.6 * smoothstep(-0.4, 1.0, R.y));
  return c;
}

vec3 irisShade(vec2 q) {
  float r = length(q);
  float a = atan(q.y, q.x);
  vec2 cs = vec2(cos(a), sin(a));
  float w = (vnoise(vec3(cs * 5.0, r * 4.0)) - 0.5) * 0.06 +
            (vnoise(vec3(cs * 16.0, r * 10.0)) - 0.5) * 0.025;
  vec2 cw = vec2(cos(a + w), sin(a + w));
  float n1 = vnoise(vec3(cw * 9.0, r * 3.0 + 3.0));
  float t1 = pow(1.0 - abs(vnoise(vec3(cw * 38.0, r * 3.0 + 9.0)) * 2.0 - 1.0), 5.0);
  float t2 = pow(1.0 - abs(vnoise(vec3(cw * 63.0, r * 5.0 + 1.7)) * 2.0 - 1.0), 6.0);
  float run = smoothstep(0.25, 0.75, vnoise(vec3(cw * 20.0, r * 13.0 + 4.0)));
  float thr = clamp((t1 + t2 * 0.8) * (0.30 + 0.70 * run), 0.0, 1.0);
  vec3 dark = uIris * vec3(0.08, 0.12, 0.18);
  vec3 light = mix(uIris, vec3(0.45, 0.85, 1.0), 0.35) * 1.45;
  vec3 c = mix(dark, uIris * 0.85, smoothstep(0.2, 0.75, n1) * 0.35 + 0.05);
  c = mix(c, light, thr * uFiber);
  c *= 1.0 - 0.65 * smoothstep(0.68, 0.86, vnoise(vec3(cw * 16.0, r * 9.0 + 21.0))) * uFiber;
  float n2 = vnoise(vec3(cw * 30.0, r * 7.0 + 9.0));
  c = mix(mix(dark, uIris, 0.5), c, uFiber);
  c *= mix(1.0, 0.28, smoothstep(0.80, 1.0, r) * (0.5 + 0.5 * uLimbus));
  float pr = uPupil;
  float cr = pr * (1.35 + 0.8 * (vnoise(vec3(cs * 6.0, 11.0)) - 0.5) + 0.45 * (n2 - 0.5));
  float collar = smoothstep(cr, cr - 0.07, r);
  vec3 cc = uCollar * (0.35 + 1.5 * n2);
  c = mix(c, cc, collar * 0.75);
  float jag = 0.03 * (vnoise(vec3(cs * 13.0, 2.0)) - 0.5);
  c *= mix(0.45, 1.0, smoothstep(pr, pr + 0.14, r));
  float pupil = smoothstep(pr + 0.012, pr - 0.012, r + jag);
  return mix(c, vec3(0.004), pupil);
}

vec3 scleraAlbedo(vec3 nl) {
  vec3 a = uSclera;
  float away = smoothstep(uCosA - 0.06, uCosA - 0.55, nl.z);
  a = mix(a, vec3(0.62, 0.12, 0.12), away * uVeins * 0.25);
  return a;
}

vec3 diffuse(vec3 n, vec3 albedo) {
  vec3 L = roll(normalize(vec3(0.50, 0.70, 0.55)));
  float ndl = dot(n, L);
  vec3 wrap = vec3(0.85, 0.60, 0.60) * (0.35 + 0.65 * uRed);
  vec3 d = clamp((ndl + wrap) / (1.0 + wrap), 0.0, 1.0);
  d *= d;
  float fill = max(0.0, dot(n, roll(normalize(vec3(-0.85, -0.15, 0.50)))));
  return albedo * (d * 1.55 + vec3(0.24, 0.20, 0.22) * fill + 0.04);
}

vec3 limbShade(vec3 c, float k) {
  k = clamp(k, 0.0, 1.0);
  float g = dot(c, vec3(0.3, 0.5, 0.2));
  return mix(c, vec3(min(g, 1.2)) * 0.22, k);
}

vec2 sphereHit(vec3 ro, vec3 rd, vec3 c, float r) {
  vec3 oc = ro - c;
  float b = dot(oc, rd);
  float h = b * b - (dot(oc, oc) - r * r);
  if (h < 0.0) return vec2(-1.0, h);
  return vec2(-b - sqrt(h), h);
}

float tone(float x) {
  return x < 0.8 ? x : 0.8 + 0.2 * (1.0 - exp(-(x - 0.8) / 0.2));
}

void main() {
  float px = 1.0 / uRadius;
  vec2 p = (gl_FragCoord.xy - uCenter) * px;
  vec3 ro = vec3(p, 4.0);
  vec3 rd = vec3(0.0, 0.0, -1.0);
  vec3 fwd = uRot * vec3(0.0, 0.0, 1.0);
  vec3 cc = fwd * uZc;
  vec2 hE = sphereHit(ro, rd, vec3(0.0), 1.0);
  vec2 hC = sphereHit(ro, rd, cc, uRc);
  vec3 PC = ro + rd * hC.x;
  bool capHit = hC.x > 0.0 && dot(PC, fwd) > uCosA;

  float cov = 1.0 - smoothstep(1.0 - px, 1.0 + px, length(p));
  vec2 dc = p - cc.xy;
  vec3 rimC = cc + vec3(normalize(dc + 1e-6) * uRc, 0.0);
  float capRim = smoothstep(uCosA - 0.01, uCosA + 0.01, dot(rimC, fwd));
  cov = max(cov, (1.0 - smoothstep(uRc - px, uRc + px, length(dc))) * capRim);
  if (cov <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 col;
  if (capHit) {
    vec3 N = normalize(PC - cc);
    vec3 Pl = PC * uRot;
    vec3 rr = refract(rd, N, 1.0 / 1.376);
    vec3 rl = rr * uRot;
    float t = (uIrisZ - Pl.z) / min(rl.z, -1e-3);
    vec2 q = (Pl.xy + rl.xy * t) / (uIrisR * 0.95);
    float rq = length(q);
    vec3 ir = irisShade(q);
    float il = 0.78 + 0.48 * max(0.0, dot(fwd, roll(normalize(vec3(0.30, 0.75, 0.60)))));
    ir *= il * (0.78 + 0.22 * smoothstep(0.9, -0.4, q.y));
    vec3 under = diffuse(normalize(fwd + uRot * vec3(q * uIrisR, 0.0)), scleraAlbedo(vec3(q * uSinA, uCosA)));
    vec3 base = mix(ir, under, smoothstep(0.97, 1.06, rq));
    float lr = (rq - 1.03) / 0.10;
    float rim = length(Pl.xy) / uSinA;
    float lc = (rim - 1.0) / 0.10;
    base = limbShade(base, uLimbus * max(exp(-lr * lr), exp(-lc * lc)));
    float ndv = max(0.0, N.z);
    float F = 0.025 + 0.975 * pow(1.0 - ndv, 5.0);
    col = base * (1.0 - F) + env(reflect(rd, N)) * F * uGloss * 1.4;
  } else {
    vec3 P = ro + rd * max(hE.x, 0.0);
    if (hE.x < 0.0) P = vec3(normalize(p) * 0.999, 0.03);
    vec3 N = normalize(P);
    vec3 nl = N * uRot;
    col = diffuse(N, scleraAlbedo(nl));
    float lg = (uCosA - nl.z) / 0.06;
    col = limbShade(col, uLimbus * exp(-lg * lg));
    float graze = pow(1.0 - clamp(N.z, 0.0, 1.0), 3.0);
    col *= mix(vec3(1.0), vec3(0.62, 0.24, 0.23), graze * 0.65 * uRed);
    float F = 0.04 + 0.96 * pow(1.0 - clamp(N.z, 0.0, 1.0), 5.0);
    col += env(reflect(rd, N)) * F * uGloss;
  }

  col = vec3(tone(col.r), tone(col.g), tone(col.b));
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  gl_FragColor = vec4(col * cov, cov);
}
`;

const activeEyesRegistry = new Set<HTMLDivElement>();
const sharedSaccade = { glanceX: 0, glanceY: 0, nextAt: 0 };

function linearizeHex(hex: string): [number, number, number] {
  const rgb = parseColorRgb(hex, [0.23, 0.51, 0.96]);
  return [Math.pow(rgb[0], 2.2), Math.pow(rgb[1], 2.2), Math.pow(rgb[2], 2.2)];
}

export interface GrinIrisEyeProps {
  irisColor?: string;
  scleraColor?: string;
  collarColor?: string;
  scale?: number;
  className?: string;
}

export function GrinIrisEye({
  irisColor = "#3B82F6",
  scleraColor = "#F8FAFC",
  collarColor = "#10B981",
  scale = 132,
  className,
}: GrinIrisEyeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || isHeadlessJsdom()) {
      setFallback(true);
      return;
    }

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    } catch {
      gl = null;
    }

    if (!gl) {
      setFallback(true);
      return;
    }

    const fmt = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const precisionPrefix = `precision ${fmt && fmt.precision > 0 ? "highp" : "mediump"} float;\n`;
    const vs = compileWebGLShader(gl, gl.VERTEX_SHADER, EYE_VERTEX_SHADER);
    const fs = compileWebGLShader(gl, gl.FRAGMENT_SHADER, precisionPrefix + EYE_FRAGMENT_SHADER);
    if (!vs || !fs) {
      setFallback(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setFallback(true);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }

    gl.useProgram(program);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uniformNames = [
      "uCenter",
      "uRadius",
      "uRot",
      "uCosA",
      "uSinA",
      "uZc",
      "uRc",
      "uIrisZ",
      "uIrisR",
      "uPupil",
      "uMark",
      "uIris",
      "uSclera",
      "uMarkCol",
      "uCollar",
      "uLight",
      "uGloss",
      "uRed",
      "uVeins",
      "uLimbus",
      "uFiber",
      "uTime",
    ] as const;

    const u: Record<string, WebGLUniformLocation | null> = {};
    for (const name of uniformNames) {
      u[name] = gl.getUniformLocation(program, name);
    }

    gl.clearColor(0, 0, 0, 0);

    const deg = Math.PI / 180;
    let yaw = 18 * deg;
    let pitch = 1 * deg;
    let dilateScale = 1;
    let elapsed = 0;
    let lastTs = 0;
    let rafId = 0;
    let destroyed = false;

    const pointer = { u: 0.5, v: 0.5, active: false, down: false };

    const syncSize = () => {
      if (!gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round((container.clientWidth || 28) * dpr));
      const h = Math.max(1, Math.round((container.clientHeight || 28) * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const drawEye = (dt: number) => {
      if (!gl) return;
      elapsed += dt;
      const w = canvas.width;
      const h = canvas.height;
      const radius = 0.71 * (scale / 100) * Math.min(w, h) * 0.5;
      const cx = w * 0.5;
      const cy = h * 0.5;

      let targetYaw = 18 * deg;
      let targetPitch = 1 * deg;

      if (pointer.active) {
        const dx = (pointer.u * w - cx) / Math.max(radius, 1);
        const dy = -(pointer.v * h - cy) / Math.max(radius, 1);
        const dist = 1.7;
        const maxTurn = 34 * deg;
        targetYaw = clampNum(Math.atan2(dx, dist), -maxTurn, maxTurn);
        targetPitch = clampNum(Math.atan2(dy, Math.hypot(dx, dist)), -maxTurn, maxTurn);
      } else {
        const now = performance.now();
        if (now >= sharedSaccade.nextAt) {
          const wanderRange = 20 * deg;
          const resetToCenter = Math.random() < 0.4;
          sharedSaccade.glanceX = resetToCenter ? 0 : (Math.random() * 2 - 1) * wanderRange;
          sharedSaccade.glanceY = resetToCenter ? 0 : (Math.random() * 2 - 1) * wanderRange * 0.6;
          sharedSaccade.nextAt = now + 2000 * (0.5 + Math.random());
        }
        targetYaw += sharedSaccade.glanceX;
        targetPitch += sharedSaccade.glanceY;
      }

      const step = 1 - Math.exp(-dt / 0.045);
      yaw += (targetYaw - yaw) * step;
      pitch += (targetPitch - pitch) * step;

      const targetDilate = 1 + (pointer.active ? 0.11 : 0) - (pointer.down ? 0.22 : 0);
      dilateScale += (targetDilate - dilateScale) * (1 - Math.exp(-dt / 0.25));
      const pupilRadius = Math.min(0.58, 0.145 * dilateScale);

      const cyaw = Math.cos(yaw);
      const syaw = Math.sin(yaw);
      const cpitch = Math.cos(pitch);
      const spitch = Math.sin(pitch);

      const rot = new Float32Array([
        cyaw,
        0,
        -syaw,
        -syaw * spitch,
        cpitch,
        -cyaw * spitch,
        syaw * cpitch,
        spitch,
        cyaw * cpitch,
      ]);

      const irisAngle = 29 * deg;
      const sinA = Math.sin(irisAngle);
      const cosA = Math.cos(irisAngle);
      const bulge = 1.12;
      const rc = (sinA * sinA + (bulge - cosA) * (bulge - cosA)) / (2 * (bulge - cosA));
      const zc = bulge - rc;
      const irisZ = cosA - 0.04;
      const irisR = Math.sqrt(1 - irisZ * irisZ);

      const irisVec = linearizeHex(irisColor);
      const scleraVec = linearizeHex(scleraColor);
      const collarVec = linearizeHex(collarColor);

      gl.useProgram(program);
      gl.uniform2f(u.uCenter, cx, h - cy);
      gl.uniform1f(u.uRadius, radius);
      gl.uniformMatrix3fv(u.uRot, false, rot);
      gl.uniform1f(u.uCosA, cosA);
      gl.uniform1f(u.uSinA, sinA);
      gl.uniform1f(u.uZc, zc);
      gl.uniform1f(u.uRc, rc);
      gl.uniform1f(u.uIrisZ, irisZ);
      gl.uniform1f(u.uIrisR, irisR);
      gl.uniform1f(u.uPupil, pupilRadius);
      gl.uniform1f(u.uMark, 0);
      gl.uniform3f(u.uIris, irisVec[0], irisVec[1], irisVec[2]);
      gl.uniform3f(u.uSclera, scleraVec[0], scleraVec[1], scleraVec[2]);
      gl.uniform3f(u.uMarkCol, 1, 1, 1);
      gl.uniform3f(u.uCollar, collarVec[0], collarVec[1], collarVec[2]);
      gl.uniform2f(u.uLight, 1, 0);
      gl.uniform1f(u.uGloss, 1.0);
      gl.uniform1f(u.uRed, 0.65);
      gl.uniform1f(u.uVeins, 0.22);
      gl.uniform1f(u.uLimbus, 0.78);
      gl.uniform1f(u.uFiber, 1.0);
      gl.uniform1f(u.uTime, elapsed % 100);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (ts: number) => {
      if (destroyed) return;
      rafId = requestAnimationFrame(tick);
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016;
      lastTs = ts;
      syncSize();
      drawEye(dt);
    };

    const updatePointer = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      let cx = rect.left + rect.width / 2;
      let cy = rect.top + rect.height / 2;
      if (activeEyesRegistry.size > 1) {
        let minL = Infinity;
        let minT = Infinity;
        let maxR = -Infinity;
        let maxB = -Infinity;
        for (const el of activeEyesRegistry) {
          const r = el.getBoundingClientRect();
          minL = Math.min(minL, r.left);
          minT = Math.min(minT, r.top);
          maxR = Math.max(maxR, r.right);
          maxB = Math.max(maxB, r.bottom);
        }
        cx = (minL + maxR) / 2;
        cy = (minT + maxB) / 2;
      }
      pointer.u = 0.5 + (e.clientX - cx) / rect.width;
      pointer.v = 0.5 + (e.clientY - cy) / rect.height;
      pointer.active = true;
    };

    const onDown = (e: PointerEvent) => {
      updatePointer(e);
      pointer.down = true;
    };

    const onUp = () => {
      pointer.down = false;
    };

    activeEyesRegistry.add(container);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    syncSize();
    rafId = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      activeEyesRegistry.delete(container);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      if (gl) {
        if (buf) gl.deleteBuffer(buf);
        if (program) gl.deleteProgram(program);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
      }
    };
  }, [irisColor, scleraColor, collarColor, scale]);

  return (
    <span
      ref={containerRef}
      data-grin-iris=""
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-flex",
        position: "relative",
        width: "0.72em",
        height: "0.72em",
        margin: "0 0.02em",
        verticalAlign: "-0.08em",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: fallback ? "none" : "block",
        }}
      />
      {fallback ? (
        <span
          style={{
            width: "86%",
            height: "86%",
            margin: "auto",
            borderRadius: "50%",
            background: `radial-gradient(circle at 62% 46%, #020617 0 18%, ${irisColor} 20% 48%, ${scleraColor} 52% 85%, #334155 100%)`,
            boxShadow: "inset 0 1px 3px rgba(255,255,255,0.65)",
          }}
        />
      ) : null}
    </span>
  );
}
