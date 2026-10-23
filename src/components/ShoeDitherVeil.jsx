'use client'

import { useEffect, useRef } from 'react'
import { Mesh, Program, RenderTarget, Renderer, Texture, Triangle } from 'ogl'
import './ShoeDitherVeil.css'

const ORDERED = { bayer: 0, noise: 1, lines: 2 }

const MASK_SCALE = 0.5
const MAX_BURSTS = 4
const BURST_SECONDS = 1.2
const HOLD = 1.6

const hexToRgb = (hex) => {
  let h = String(hex || '').replace('#', '')
  if (h.length === 3) h = h.replace(/./g, (c) => c + c)
  const n = parseInt(h.slice(0, 6), 16)
  return Number.isNaN(n) ? [0, 0, 0] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const fitScale = (w, h, iw, ih, contain) => {
  const ratio = w / h / (iw / ih)
  if (contain) return ratio > 1 ? [ratio, 1] : [1, 1 / ratio]
  return ratio > 1 ? [1, 1 / ratio] : [ratio, 1]
}

const wanderAt = (t, w, h) => [
  w * (0.5 + 0.33 * Math.sin(t * 0.53) + 0.08 * Math.sin(t * 1.31 + 0.6)),
  h * (0.5 + 0.28 * Math.sin(t * 0.71 + 1.1) + 0.07 * Math.cos(t * 1.57)),
]

let blueNoise = null

const getBlueNoise = () => {
  if (blueNoise) return blueNoise
  const size = 64
  const n = size * size
  const wrap = size - 1
  const taps = []
  for (let dy = -6; dy <= 6; dy++) {
    for (let dx = -6; dx <= 6; dx++) taps.push(dx, dy, Math.exp(-(dx * dx + dy * dy) / 4.5))
  }
  const energy = new Float32Array(n)
  const on = new Uint8Array(n)
  const splat = (i, sign) => {
    const x = i % size
    const y = (i - x) / size
    for (let k = 0; k < taps.length; k += 3) {
      energy[((y + taps[k + 1]) & wrap) * size + ((x + taps[k]) & wrap)] += sign * taps[k + 2]
    }
  }
  const find = (state, highest) => {
    let best = 0
    let value = highest ? -Infinity : Infinity
    for (let i = 0; i < n; i++) {
      if (on[i] !== state) continue
      if (highest ? energy[i] > value : energy[i] < value) {
        value = energy[i]
        best = i
      }
    }
    return best
  }
  let seed = 7
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const initial = Math.round(n * 0.1)
  for (let placed = 0; placed < initial; ) {
    const i = Math.floor(random() * n)
    if (on[i]) continue
    on[i] = 1
    splat(i, 1)
    placed++
  }
  for (let guard = 0; guard < n; guard++) {
    const cluster = find(1, true)
    on[cluster] = 0
    splat(cluster, -1)
    const gap = find(0, false)
    on[gap] = 1
    splat(gap, 1)
    if (gap === cluster) break
  }
  const seedOn = on.slice()
  const seedEnergy = energy.slice()
  const rank = new Uint16Array(n)
  for (let r = initial - 1; r >= 0; r--) {
    const cluster = find(1, true)
    on[cluster] = 0
    splat(cluster, -1)
    rank[cluster] = r
  }
  on.set(seedOn)
  energy.set(seedEnergy)
  for (let r = initial; r < n; r++) {
    const gap = find(0, false)
    on[gap] = 1
    splat(gap, 1)
    rank[gap] = r
  }
  const data = new Uint8Array(n * 4)
  for (let i = 0; i < n; i++) {
    const v = Math.floor((rank[i] / n) * 256)
    data[i * 4] = v
    data[i * 4 + 1] = v
    data[i * 4 + 2] = v
    data[i * 4 + 3] = 255
  }
  blueNoise = data
  return data
}

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const maskFragment = `#version 300 es
precision highp float;

uniform sampler2D tPrev;
uniform vec2 uSize;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uSoftness;
uniform float uStrength;
uniform float uFade;
uniform float uHold;

in vec2 vUv;
out vec4 fragColor;

float strokeDistance(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  return length(p - a - ab * h);
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  float trail = max(texture(tPrev, vUv).r - uFade, 0.0);
  float band = max(uRadius * uSoftness, 1.0) * uHold;
  float d = strokeDistance(p, uFrom, uTo);
  trail = max(trail, clamp((uRadius - d) / band, 0.0, 1.0) * uStrength);
  fragColor = vec4(trail, 0.0, 0.0, 1.0);
}
`

const viewFragment = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D tImage;
uniform sampler2D tMask;
uniform sampler2D tNoise;
uniform sampler2D tDiffused;
uniform sampler2D tHistory;
uniform vec2 uResolution;
uniform vec2 uGrid;
uniform float uDebug;
uniform vec2 uCover;
uniform float uLod;
uniform float uCell;
uniform int uPattern;
uniform int uPalette;
uniform float uLevels;
uniform vec3 uPaper;
uniform vec3 uRimColor;
uniform float uRim;
uniform float uContrast;
uniform float uBrightness;
uniform float uReverse;
uniform float uIntro;
uniform float uHold;
uniform vec2 uSize;
uniform vec4 uBursts[4];
uniform float uBurstWidth;
uniform float uHalftone;
uniform float uMinDensity;
uniform float uMaxRadius;
uniform float uPreBlur;
uniform float uUnsharp;

in vec2 vUv;
out vec4 fragColor;

float bayer(vec2 cell) {
  ivec2 p = ivec2(mod(cell, 8.0));
  int v = p.x ^ p.y;
  int m = ((v & 1) << 5) | ((p.y & 1) << 4) | ((v & 2) << 2) | ((p.y & 2) << 1) | ((v & 4) >> 1) | ((p.y & 4) >> 2);
  return (float(m) + 0.5) / 64.0;
}

float blueNoise(vec2 cell) {
  return (texelFetch(tNoise, ivec2(mod(cell, 64.0)), 0).r * 255.0 + 0.5) / 256.0;
}

float engraving(vec2 cell) {
  float period = 6.0;
  float f = (mod(cell.x + cell.y, period) + 0.5) / period;
  return clamp(abs(f * 2.0 - 1.0) + (bayer(cell) - 0.5) * (2.0 / period), 0.0, 1.0);
}

vec2 imageUv(vec2 uv) {
  return (uv - 0.5) * uCover + 0.5;
}

float within(vec2 p) {
  vec2 s = step(vec2(0.0), p) * step(p, vec2(1.0));
  return s.x * s.y;
}

vec3 grade(vec3 c) {
  return pow(clamp((c - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0), vec3(1.6));
}

float shockwave(vec2 p) {
  float value = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 burst = uBursts[i];
    if (burst.w <= 0.0) continue;
    float offset = distance(p, burst.xy) - burst.z;
    float edge = offset > 0.0 ? offset / (uBurstWidth * 0.35) : -offset / uBurstWidth;
    value = max(value, clamp(1.0 - edge, 0.0, 1.0) * burst.w);
  }
  return value;
}

vec3 toned(vec3 c) {
  return uPalette == 1 ? grade(c) : grade(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))));
}

vec3 quantize(vec3 v, float t) {
  float steps = max(uLevels - 1.0, 1.0);
  vec3 s = v * steps;
  vec3 base = floor(s);
  return min(base + step(vec3(t), s - base), vec3(steps)) / steps;
}

float lumaOf(vec3 rgb) {
  return dot(rgb, vec3(0.2126, 0.7152, 0.0722));
}

float sampleLuma(vec2 uv) {
  return lumaOf(texture(tImage, clamp(uv, 0.0, 1.0)).rgb);
}

float blurLuma(vec2 uv, float radiusPx) {
  vec2 o = (uCover / uResolution) * max(radiusPx, 0.0);
  float sum = sampleLuma(uv) * 4.0;
  sum += sampleLuma(uv + vec2(o.x, 0.0));
  sum += sampleLuma(uv - vec2(o.x, 0.0));
  sum += sampleLuma(uv + vec2(0.0, o.y));
  sum += sampleLuma(uv - vec2(0.0, o.y));
  sum += sampleLuma(uv + o);
  sum += sampleLuma(uv - o);
  sum += sampleLuma(uv + vec2(o.x, -o.y));
  sum += sampleLuma(uv + vec2(-o.x, o.y));
  return sum / 12.0;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  vec2 cell = floor(px / uCell);
  vec2 center = (cell + 0.5) * uCell;
  vec2 cellUv = vec2(center.x / uResolution.x, 1.0 - center.y / uResolution.y);

  vec2 sampleUv = imageUv(cellUv);
  float framed = within(sampleUv);
  vec4 cellTex = textureLod(tImage, sampleUv, 0.0);
  float shoe = step(0.6, cellTex.a) * framed;
  vec3 level;
  if (uPattern == 3) {
    level = texelFetch(tDiffused, ivec2(cell), 0).rgb;
  } else {
    float t = uPattern == 1 ? blueNoise(cell) : (uPattern == 2 ? engraving(cell) : bayer(cell));
    level = quantize(toned(cellTex.rgb), t);
  }

  vec2 photoUv = imageUv(vUv);
  vec4 raw = texture(tImage, photoUv);
  vec4 photo = vec4(raw.rgb, raw.a * within(photoUv));

  vec2 point = vec2(cellUv.x, 1.0 - cellUv.y) * uSize;
  float mask = max(clamp(texture(tMask, cellUv).r * uHold, 0.0, 1.0), shockwave(point));
  float shown = mix(mask, 1.0 - mask, uReverse);
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  float spread = length((cellUv - 0.5) * aspect) / length(aspect * 0.5);
  float appear = step(spread * 0.72 + bayer(cell + vec2(3.0, 5.0)) * 0.28, uIntro * 1.001);

  if (uHalftone > 0.5) {
    float fine = blurLuma(sampleUv, uPreBlur);
    float wide = blurLuma(sampleUv, uUnsharp);
    float sharp = clamp(fine + (fine - wide), 0.0, 1.0);
    float graded = clamp((sharp - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);
    float coverage = max(graded, uMinDensity) * shoe;
    float radius = uMaxRadius * sqrt(clamp(coverage, 0.0, 1.0));
    float dist = length(px - center);
    float disk = step(0.05, radius) * (1.0 - smoothstep(radius - 0.7, radius + 0.7, dist));
    float soft = clamp(texture(tMask, cellUv).r * uHold, 0.0, 1.0);
    soft = mix(soft, 1.0 - soft, uReverse);
    float dotAlpha = disk * (1.0 - soft);
    float videoAlpha = soft * photo.a;
    float alpha = dotAlpha + videoAlpha * (1.0 - dotAlpha);
    vec3 rgb = uPaper;
    if (alpha > 0.001) {
      rgb = (uPaper * dotAlpha + photo.rgb * videoAlpha * (1.0 - dotAlpha)) / alpha;
    }
    fragColor = vec4(rgb * alpha * appear, alpha * appear);
    return;
  }

  // 2-tone ink: paper where the smoothed dither is on and the cell is inside the shoe.
  // The reveal mask above stays live and is not part of that history.
  float graded = clamp(lumaOf(toned(cellTex.rgb)), 0.0, 1.0);
  float rawAlpha = clamp(cellTex.a, 0.0, 1.0) * framed;
  float threshold = uPattern == 1 ? blueNoise(cell) : (uPattern == 2 ? engraving(cell) : bayer(cell));
  ivec2 histCoord = ivec2(cell.x, uGrid.y - 1.0 - cell.y);
  vec4 hist = texelFetch(tHistory, histCoord, 0);
  if (uDebug > 0.5) {
    float nearT = rawAlpha > 0.02 && abs(graded - threshold) < 0.05 ? 1.0 : 0.0;
    float nearA = rawAlpha > 0.35 && rawAlpha < 0.65 ? 1.0 : 0.0;
    if (nearT > 0.5 || nearA > 0.5) {
      vec3 dbg = vec3(nearT, 0.0, nearA) * appear;
      fragColor = vec4(dbg, appear);
      return;
    }
  }
  // 2-tone: a cell inside the shoe is paper, or it is empty. Ink stays transparent.
  float lit = hist.b * hist.a;
  vec4 color = vec4(uPaper, lit);
  float order = bayer(cell.yx);
  float low = order * (1.0 - uRim);
  color = mix(color, vec4(uRimColor, 1.0), step(low, shown) * step(0.001, uRim));
  color = mix(color, photo, step(low + uRim, shown));
  color = mix(vec4(0.0), color, appear);
  fragColor = vec4(color.rgb * color.a, color.a);
}
`

const historyFragment = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D tImage;
uniform sampler2D tHistory;
uniform sampler2D tNoise;
uniform vec2 uCanvas;
uniform vec2 uGrid;
uniform vec2 uCover;
uniform float uCell;
uniform int uPattern;
uniform float uLevels;
uniform float uContrast;
uniform float uBrightness;
uniform float uMix;
uniform float uHyst;
uniform float uReset;

in vec2 vUv;
out vec4 fragColor;

float bayer(vec2 cell) {
  ivec2 p = ivec2(mod(cell, 8.0));
  int v = p.x ^ p.y;
  int m = ((v & 1) << 5) | ((p.y & 1) << 4) | ((v & 2) << 2) | ((p.y & 2) << 1) | ((v & 4) >> 1) | ((p.y & 4) >> 2);
  return (float(m) + 0.5) / 64.0;
}

float blueNoise(vec2 cell) {
  return (texelFetch(tNoise, ivec2(mod(cell, 64.0)), 0).r * 255.0 + 0.5) / 256.0;
}

float engraving(vec2 cell) {
  float period = 6.0;
  float f = (mod(cell.x + cell.y, period) + 0.5) / period;
  return clamp(abs(f * 2.0 - 1.0) + (bayer(cell) - 0.5) * (2.0 / period), 0.0, 1.0);
}

vec2 imageUv(vec2 uv) {
  return (uv - 0.5) * uCover + 0.5;
}

float within(vec2 p) {
  vec2 s = step(vec2(0.0), p) * step(p, vec2(1.0));
  return s.x * s.y;
}

vec3 grade(vec3 c) {
  return pow(clamp((c - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0), vec3(1.6));
}

float lumaOf(vec3 rgb) {
  return dot(rgb, vec3(0.2126, 0.7152, 0.0722));
}

vec3 toned(vec3 c) {
  return grade(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))));
}

void main() {
  float rows = uGrid.y;
  vec2 store = floor(gl_FragCoord.xy);
  vec2 cell = vec2(store.x, rows - 1.0 - store.y);
  vec2 center = (cell + 0.5) * uCell;
  vec2 cellUv = vec2(center.x / uCanvas.x, 1.0 - center.y / uCanvas.y);
  vec2 sampleUv = imageUv(cellUv);
  float framed = within(sampleUv);
  vec4 cellTex = textureLod(tImage, sampleUv, 0.0);
  float graded = framed * clamp(lumaOf(toned(cellTex.rgb)), 0.0, 1.0);
  float rawAlpha = framed * clamp(cellTex.a, 0.0, 1.0);

  float steps = max(uLevels - 1.0, 1.0);
  float threshold = uPattern == 1 ? blueNoise(cell) : (uPattern == 2 ? engraving(cell) : bayer(cell));

  vec4 prev = texelFetch(tHistory, ivec2(store), 0);
  float mixT = uReset > 0.5 ? 1.0 : uMix;
  float sGraded = mix(prev.r, graded, mixT);
  float sAlpha = mix(prev.g, rawAlpha, mixT);
  float compared = sGraded;
  if (steps > 1.0) {
    float scaled = clamp(sGraded, 0.0, 0.9999) * steps;
    compared = scaled - floor(scaled);
  }

  float on;
  float aOn;
  if (uReset > 0.5) {
    on = step(threshold, compared);
    aOn = sAlpha > 0.55 ? 1.0 : 0.0;
  } else {
    on = prev.b > 0.5
      ? (compared < threshold - uHyst ? 0.0 : 1.0)
      : (compared > threshold + uHyst ? 1.0 : 0.0);
    aOn = prev.a > 0.5
      ? (sAlpha < 0.45 ? 0.0 : 1.0)
      : (sAlpha > 0.55 ? 1.0 : 0.0);
  }

  fragColor = vec4(sGraded, sAlpha, on, aOn);
}
`

const loadBitmaps = async (base, count, width, height, signal) => {
  const bitmaps = new Array(count)
  let next = 0
  const worker = async () => {
    while (next < count) {
      const index = next
      next += 1
      const name = `${String(index).padStart(3, '0')}.webp`
      const response = await fetch(`${base}/${name}`, { signal })
      if (!response.ok) throw new Error(`Missing frame ${name}`)
      const blob = await response.blob()
      // ImageBitmap ignores UNPACK_FLIP_Y, so the flip has to be baked in
      // or the shoe draws upside down.
      const options = {
        imageOrientation: 'flipY',
        premultiplyAlpha: 'none',
      }
      if (width > 0 && height > 0) {
        options.resizeWidth = width
        options.resizeHeight = height
        options.resizeQuality = 'high'
      }
      try {
        bitmaps[index] = await createImageBitmap(blob, options)
      } catch {
        bitmaps[index] = await createImageBitmap(blob, { imageOrientation: 'flipY' })
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, count) }, worker))
  return bitmaps
}

export default function ShoeDitherVeil({
  framesUrl = '/shoe-frames/manifest.json',
  dotColor = '#FF5A1F',
  fit = 'contain',
  mode = 'dither',
  pattern = 'bayer',
  pixelSize = 5,
  temporalSmoothing = 0.35,
  hysteresis = 0.04,
  levels = 2,
  palette = 'duotone',
  contrast = 1.15,
  brightness = 0,
  revealRadius = 200,
  softness = 0.6,
  linger = 1,
  strength = 1,
  minDensity = 0.15,
  rimColor = '#a78bfa',
  rim = 0,
  reverse = false,
  wander = false,
  clickBurst = true,
  ariaLabel = 'Rotating grey sneaker',
  className = '',
  style = undefined,
  maskCanvasRef,
}) {
  const containerRef = useRef(null)
  const settingsRef = useRef(null)
  const wakeRef = useRef(() => {})

  useEffect(() => {
    settingsRef.current = {
      fit,
      mode,
      pattern: pattern === 'noise' || pattern === 'lines' ? pattern : 'bayer',
      pixelSize,
      temporalSmoothing,
      hysteresis,
      levels,
      palette,
      paperColor: dotColor,
      contrast,
      brightness,
      revealRadius,
      softness,
      linger,
      strength,
      minDensity,
      rimColor,
      rim,
      reverse,
      wander,
      clickBurst,
    }
    wakeRef.current()
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const dev = process.env.NODE_ENV === 'development'
    const debugQuery = dev && new URLSearchParams(window.location.search).has('ditherDebug')
    let debugFlicker = debugQuery
    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: debugQuery,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas
    canvas.classList.add('shoe-dither-gl')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)

    const floatMask = renderer.isWebgl2 && !!renderer.getExtension('EXT_color_buffer_float')
    const geometry = new Triangle(gl)

    const dataTexture = () =>
      new Texture(gl, {
        image: new Uint8Array(4),
        width: 1,
        height: 1,
        generateMipmaps: false,
        flipY: false,
        minFilter: gl.NEAREST,
        magFilter: gl.NEAREST,
      })
    const imageTexture = new Texture(gl, {
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR,
      flipY: false,
      premultiplyAlpha: false,
    })
    const noiseTexture = dataTexture()
    const diffusedTexture = dataTexture()

    const createMask = (w, h) =>
      new RenderTarget(gl, {
        width: w,
        height: h,
        depth: false,
        type: floatMask ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        internalFormat: floatMask ? gl.RGBA16F : gl.RGBA,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
      })
    const destroyMask = (target) => {
      gl.deleteFramebuffer(target.buffer)
      gl.deleteTexture(target.texture.texture)
    }
    let masks = [createMask(2, 2), createMask(2, 2)]
    const createHistory = (w, h) =>
      new RenderTarget(gl, {
        width: w,
        height: h,
        depth: false,
        type: floatMask ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        internalFormat: floatMask ? gl.RGBA16F : gl.RGBA,
        minFilter: gl.NEAREST,
        magFilter: gl.NEAREST,
      })
    let history = [createHistory(2, 2), createHistory(2, 2)]
    let historyReset = true

    const maskUniforms = {
      tPrev: { value: masks[0].texture },
      uSize: { value: [1, 1] },
      uFrom: { value: [0, 0] },
      uTo: { value: [0, 0] },
      uRadius: { value: 1 },
      uSoftness: { value: 0.5 },
      uStrength: { value: 0 },
      uFade: { value: 1 },
      uHold: { value: HOLD },
    }
    const viewUniforms = {
      tImage: { value: imageTexture },
      tMask: { value: masks[0].texture },
      tNoise: { value: noiseTexture },
      tDiffused: { value: diffusedTexture },
      tHistory: { value: history[0].texture },
      uResolution: { value: [1, 1] },
      uGrid: { value: [2, 2] },
      uDebug: { value: 0 },
      uCover: { value: [1, 1] },
      uLod: { value: 0 },
      uCell: { value: 3 },
      uPattern: { value: 1 },
      uPalette: { value: 0 },
      uLevels: { value: 2 },
      uPaper: { value: [1, 1, 1] },
      uRimColor: { value: [1, 1, 1] },
      uRim: { value: 0 },
      uContrast: { value: 1 },
      uBrightness: { value: 0 },
      uReverse: { value: 0 },
      uIntro: { value: 0 },
      uHold: { value: HOLD },
      uSize: { value: [1, 1] },
      uBursts: { value: Array.from({ length: MAX_BURSTS * 4 }, () => 0) },
      uBurstWidth: { value: 60 },
      uHalftone: { value: 0 },
      uMinDensity: { value: 0.15 },
      uMaxRadius: { value: 1 },
      uPreBlur: { value: 1 },
      uUnsharp: { value: 1 },
    }
    const maskMesh = new Mesh(gl, {
      geometry,
      program: new Program(gl, {
        vertex,
        fragment: maskFragment,
        uniforms: maskUniforms,
        depthTest: false,
        depthWrite: false,
      }),
    })
    const viewMesh = new Mesh(gl, {
      geometry,
      program: new Program(gl, {
        vertex,
        fragment: viewFragment,
        uniforms: viewUniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    })
    const historyUniforms = {
      tImage: { value: imageTexture },
      tHistory: { value: history[0].texture },
      tNoise: { value: noiseTexture },
      uCanvas: { value: [1, 1] },
      uGrid: { value: [2, 2] },
      uCover: { value: [1, 1] },
      uCell: { value: 2 },
      uPattern: { value: 0 },
      uLevels: { value: 2 },
      uContrast: { value: 1.15 },
      uBrightness: { value: 0 },
      uMix: { value: 0.35 },
      uHyst: { value: 0.04 },
      uReset: { value: 1 },
    }
    const historyMesh = new Mesh(gl, {
      geometry,
      program: new Program(gl, {
        vertex,
        fragment: historyFragment,
        uniforms: historyUniforms,
        depthTest: false,
        depthWrite: false,
      }),
    })

    let image = null
    let imageWidth = 1
    let imageHeight = 1
    let width = 1
    let height = 1
    let visible = true
    let raf = 0
    let last = performance.now()
    let presence = 0
    let drift = 0
    let elapsed = 0
    let frameIndex = 0
    let uploadedIndex = -1
    let frameCount = 115
    let fps = 24
    let ready = false
    let bitmaps = []
    const pointer = { x: 0, y: 0, inside: false, fresh: true, placed: false }
    const brush = { x: 0, y: 0, px: 0, py: 0 }
    const bursts = []
    const abort = new AbortController()
    let cancelled = false

    const paintShoeMask = (bitmap) => {
      const mask = maskCanvasRef?.current
      if (!mask) return
      const w = canvas.width
      const h = canvas.height
      if (mask.width !== w || mask.height !== h) {
        mask.width = w
        mask.height = h
      }
      const ctx = mask.getContext('2d')
      if (!ctx) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)
      if (!bitmap) return
      const contain = settingsRef.current?.fit === 'contain'
      const cover = fitScale(w, h, bitmap.width, bitmap.height, contain)
      const dw = w / cover[0]
      const dh = h / cover[1]
      const dx = (w - dw) / 2
      const dy = (h - dh) / 2
      ctx.save()
      ctx.translate(0, h)
      ctx.scale(1, -1)
      ctx.drawImage(bitmap, dx, dy, dw, dh)
      ctx.restore()
      ctx.globalCompositeOperation = 'source-in'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }

    const layout = () => {
      const nextW = Math.max(1, container.clientWidth)
      const nextH = Math.max(1, container.clientHeight)
      if (nextW !== width || nextH !== height) historyReset = true
      width = nextW
      height = nextH
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setSize(width, height)
      paintShoeMask(image)
      viewUniforms.uResolution.value = [canvas.width, canvas.height]
      maskUniforms.uSize.value = [width, height]
      viewUniforms.uSize.value = [width, height]
      const mw = Math.max(2, Math.round(width * MASK_SCALE))
      const mh = Math.max(2, Math.round(height * MASK_SCALE))
      if (mw !== masks[0].width || mh !== masks[0].height) {
        masks.forEach(destroyMask)
        masks = [createMask(mw, mh), createMask(mw, mh)]
      }
      if (!pointer.placed) {
        pointer.x = width / 2
        pointer.y = height / 2
      }
    }

    const uploadFrame = (index) => {
      const bitmap = bitmaps[index]
      if (!bitmap) {
        paintShoeMask(null)
        return
      }
      if (index === uploadedIndex) return
      imageTexture.image = bitmap
      imageTexture.needsUpdate = true
      image = bitmap
      imageWidth = bitmap.width
      imageHeight = bitmap.height
      uploadedIndex = index
      paintShoeMask(bitmap)
    }

    const frame = (now) => {
      raf = 0
      if (!visible || document.hidden) return
      const s = settingsRef.current
      if (!s) return
      const rawDt = Math.max(0, (now - last) / 1000)
      const dt = Math.min(0.05, rawDt)
      last = now
      if (ready && !reducedMotion) elapsed += rawDt
      if (ready) {
        frameIndex = reducedMotion ? 0 : Math.floor(elapsed * fps) % frameCount
        uploadFrame(frameIndex)
      }

      const wanderOn = s.wander && !reducedMotion
      let targetX = pointer.x
      let targetY = pointer.y
      if (!pointer.inside && wanderOn) {
        drift = Math.min(1, drift + dt / 1.2)
        const [wx, wy] = wanderAt(now / 1000, width, height)
        const k = drift * drift * (3 - 2 * drift)
        targetX += (wx - targetX) * k
        targetY += (wy - targetY) * k
      } else {
        drift = 0
      }

      presence += ((pointer.inside || wanderOn ? 1 : 0) - presence) * (1 - Math.exp(-dt / 0.16))

      if (pointer.fresh) {
        brush.x = brush.px = targetX
        brush.y = brush.py = targetY
        pointer.fresh = false
      } else {
        const follow = 1 - Math.exp(-dt / 0.035)
        brush.x += (targetX - brush.x) * follow
        brush.y += (targetY - brush.y) * follow
      }

      const burstData = viewUniforms.uBursts.value
      burstData.fill(0)
      for (let i = bursts.length - 1; i >= 0; i--) {
        if ((now - bursts[i].start) / 1000 >= BURST_SECONDS) bursts.splice(i, 1)
      }
      bursts.forEach((b, i) => {
        const k = Math.max(0, (now - b.start) / 1000 / BURST_SECONDS)
        const reach =
          Math.hypot(Math.max(b.x, width - b.x), Math.max(b.y, height - b.y)) + viewUniforms.uBurstWidth.value
        burstData[i * 4] = b.x
        burstData[i * 4 + 1] = b.y
        burstData[i * 4 + 2] = reach * Math.sin((k * Math.PI) / 2)
        burstData[i * 4 + 3] = 1 - k * k * k
      })

      const minFade = floatMask ? 0 : 1.5 / 255
      const fade = s.linger > 0 ? dt / s.linger : 1
      maskUniforms.tPrev.value = masks[0].texture
      maskUniforms.uFrom.value = [brush.px, brush.py]
      maskUniforms.uTo.value = [brush.x, brush.y]
      maskUniforms.uRadius.value = s.revealRadius * (0.45 + 0.55 * presence)
      maskUniforms.uSoftness.value = s.softness
      maskUniforms.uStrength.value = presence * s.strength
      maskUniforms.uFade.value = Math.max(fade, minFade)
      viewUniforms.uBurstWidth.value = Math.max(60, s.revealRadius * 0.9)
      renderer.render({ scene: maskMesh, target: masks[1] })
      masks.reverse()
      brush.px = brush.x
      brush.py = brush.y

      const cell = Math.max(1, Math.round(s.pixelSize * renderer.dpr))
      if (image) {
        viewUniforms.uCover.value = fitScale(canvas.width, canvas.height, imageWidth, imageHeight, s.fit === 'contain')
      }
      const patternName = s.pattern === 'noise' || s.pattern === 'lines' ? s.pattern : 'bayer'
      const patternIndex = ORDERED[patternName]
      if (patternIndex === 1 && noiseTexture.width !== 64) {
        noiseTexture.image = getBlueNoise()
        noiseTexture.width = 64
        noiseTexture.height = 64
        noiseTexture.needsUpdate = true
      }

      const cols = Math.max(1, Math.ceil(canvas.width / cell))
      const rows = Math.max(1, Math.ceil(canvas.height / cell))
      if (cols !== history[0].width || rows !== history[0].height) {
        history.forEach(destroyMask)
        history = [createHistory(cols, rows), createHistory(cols, rows)]
        historyReset = true
      }
      if (image && s.mode !== 'halftone') {
        historyUniforms.tImage.value = imageTexture
        historyUniforms.tHistory.value = history[0].texture
        historyUniforms.tNoise.value = noiseTexture
        historyUniforms.uCanvas.value = [canvas.width, canvas.height]
        historyUniforms.uGrid.value = [cols, rows]
        historyUniforms.uCover.value = viewUniforms.uCover.value
        historyUniforms.uCell.value = cell
        historyUniforms.uPattern.value = patternIndex
        historyUniforms.uLevels.value = Math.max(2, Math.round(s.levels))
        historyUniforms.uContrast.value = s.contrast
        historyUniforms.uBrightness.value = s.brightness
        historyUniforms.uMix.value = Math.min(1, Math.max(0, s.temporalSmoothing))
        historyUniforms.uHyst.value = Math.max(0, s.hysteresis)
        historyUniforms.uReset.value = historyReset ? 1 : 0
        renderer.render({ scene: historyMesh, target: history[1] })
        history.reverse()
        historyReset = false
      }

      const texelsPerPixel = image ? (viewUniforms.uCover.value[0] * imageWidth) / canvas.width : 1
      viewUniforms.tMask.value = masks[0].texture
      viewUniforms.tHistory.value = history[0].texture
      viewUniforms.uGrid.value = [cols, rows]
      viewUniforms.uDebug.value = debugFlicker ? 1 : 0
      viewUniforms.uCell.value = cell
      viewUniforms.uLod.value = Math.log2(Math.max(cell * texelsPerPixel, 1))
      viewUniforms.uPattern.value = patternIndex
      viewUniforms.uPalette.value = s.palette === 'rgb' ? 1 : 0
      viewUniforms.uLevels.value = Math.max(2, Math.round(s.levels))
      viewUniforms.uPaper.value = hexToRgb(s.paperColor)
      viewUniforms.uRimColor.value = hexToRgb(s.rimColor)
      viewUniforms.uRim.value = Math.min(Math.max(s.rim, 0), 0.95)
      viewUniforms.uContrast.value = s.contrast
      viewUniforms.uBrightness.value = s.brightness
      viewUniforms.uReverse.value = s.reverse ? 1 : 0
      viewUniforms.uHalftone.value = s.mode === 'halftone' ? 1 : 0
      viewUniforms.uMinDensity.value = s.minDensity
      viewUniforms.uMaxRadius.value = 0.45 * cell
      viewUniforms.uPreBlur.value = 0.25 * cell
      viewUniforms.uUnsharp.value = 1.5 * cell
      viewUniforms.uIntro.value = image ? 1 : 0
      if (image) renderer.render({ scene: viewMesh })

      if (visible && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (raf || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    wakeRef.current = wake

    const locate = (e) => {
      const rect = container.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.placed = true
    }
    const onMove = (e) => {
      locate(e)
      if (!pointer.inside) {
        pointer.inside = true
        pointer.fresh = true
      }
      wake()
    }
    const onLeave = () => {
      pointer.inside = false
      wake()
    }
    const onDown = (e) => {
      onMove(e)
      if (!settingsRef.current?.clickBurst || (e.pointerType === 'mouse' && e.button !== 0)) return
      bursts.push({ x: pointer.x, y: pointer.y, start: performance.now() })
      if (bursts.length > MAX_BURSTS) bursts.shift()
    }
    const onKey = (e) => {
      if (!dev || e.key !== 'd' || e.metaKey || e.ctrlKey || e.altKey) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      debugFlicker = !debugFlicker
      container.dataset.ditherDebug = debugFlicker ? '1' : '0'
      wake()
    }
    if (debugFlicker) container.dataset.ditherDebug = '1'
    window.addEventListener('keydown', onKey)
    container.addEventListener('pointermove', onMove, { passive: true })
    container.addEventListener('pointerenter', onMove, { passive: true })
    container.addEventListener('pointerdown', onDown, { passive: true })
    container.addEventListener('pointerleave', onLeave, { passive: true })
    container.addEventListener('pointercancel', onLeave, { passive: true })

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else {
        wake()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const resizeObserver = new ResizeObserver(() => {
      layout()
      wake()
    })
    resizeObserver.observe(container)
    let dprMedia = null
    const onDprChange = () => {
      layout()
      wake()
      bindDpr()
    }
    const bindDpr = () => {
      dprMedia?.removeEventListener('change', onDprChange)
      dprMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      dprMedia.addEventListener('change', onDprChange)
    }
    bindDpr()
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !document.hidden) wake()
      else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    intersectionObserver.observe(container)

    layout()
    wake()

    const boot = async () => {
      const manifestResponse = await fetch(framesUrl, { signal: abort.signal })
      if (!manifestResponse.ok) throw new Error('Missing shoe frame manifest')
      const manifest = await manifestResponse.json()
      frameCount = manifest.frameCount || 115
      fps = manifest.fps || 24
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const css = Math.max(1, Math.min(container.clientWidth || manifest.width, container.clientHeight || manifest.height))
      const scale = Math.min(1, (css * dpr) / manifest.width)
      const bitmapW = Math.max(1, Math.round(manifest.width * scale))
      const bitmapH = Math.max(1, Math.round(manifest.height * scale))
      const base = framesUrl.replace(/\/[^/]*$/, '')
      const loaded = await loadBitmaps(base, frameCount, bitmapW, bitmapH, abort.signal)
      if (cancelled) {
        loaded.forEach((bitmap) => bitmap?.close())
        return
      }
      bitmaps = loaded
      ready = true
      frameIndex = 0
      uploadFrame(0)
      wake()
      if (!reducedMotion) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (cancelled) return
            canvas.classList.add('is-shown')
            maskCanvasRef?.current?.classList.add('is-shown')
          })
        })
      }
    }
    boot().catch((error) => {
      if (error?.name === 'AbortError') return
      console.warn(error)
    })

    return () => {
      cancelled = true
      abort.abort()
      cancelAnimationFrame(raf)
      wakeRef.current = () => {}
      resizeObserver.disconnect()
      dprMedia?.removeEventListener('change', onDprChange)
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('keydown', onKey)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerenter', onMove)
      container.removeEventListener('pointerdown', onDown)
      container.removeEventListener('pointerleave', onLeave)
      container.removeEventListener('pointercancel', onLeave)
      bitmaps.forEach((bitmap) => bitmap?.close())
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
    }
  }, [framesUrl])

  return (
    <div
      ref={containerRef}
      className={`shoe-dither-veil ${className}`.trim()}
      style={style}
      role="img"
      aria-label={ariaLabel}
    />
  )
}
