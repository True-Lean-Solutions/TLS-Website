/*! liquid-glass.js v1.1.0 | Apple-style Liquid Glass for the web (WebGL2)
 *  Rendering model adapted from Liquid Glass Studio, Copyright (c) 2024 Charles Yin, MIT License.
 *  Rounded-box SDF and polynomial smooth minimum after Inigo Quilez. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LiquidGlass = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = '1.1.0';
  const MAX_SHAPES = 16;
  const MAX_BLUR_TAPS = 128;
  const VIDEO_TIMEOUT_MS = 20000;

  const DEFAULTS = Object.freeze({
    thickness: 20, ior: 1.4, refraction: 0.05, dispersion: 7,
    fresnelRange: 30, fresnelHardness: 20, fresnelStrength: 20,
    glareRange: 30, glareHardness: 20, glareStrength: 90, glareConvergence: 50, glareOpposite: 80, glareAngle: -45,
    blur: 1, blurEdge: true, tint: Object.freeze([255, 255, 255, 0]),
    shadowSpread: 25, shadowStrength: 15, shadowOffset: Object.freeze([0, 10]),
    merge: 0, roundness: 5, debug: 0,
  });

  const RANGES = {
    thickness: [1, 80], ior: [1, 4], refraction: [0, 0.2], dispersion: [0, 50],
    fresnelRange: [1, 100], fresnelHardness: [0, 100], fresnelStrength: [0, 100],
    glareRange: [1, 100], glareHardness: [0, 100], glareStrength: [0, 120],
    glareConvergence: [0, 100], glareOpposite: [0, 100], glareAngle: [-180, 180],
    blur: [0, 100], shadowSpread: [2, 100], shadowStrength: [0, 100],
    merge: [0, 200], roundness: [2, 7], debug: [0, 4],
  };

  const PRESETS = Object.freeze({
    standard: Object.freeze({}),
    clear: Object.freeze({ blur: 0, refraction: 0.06, dispersion: 9, tint: [255, 255, 255, 0], shadowStrength: 10 }),
    frosted: Object.freeze({ blur: 12, refraction: 0.04, dispersion: 4, tint: [255, 255, 255, 0.18], fresnelStrength: 30 }),
    dark: Object.freeze({ blur: 10, refraction: 0.045, dispersion: 5, tint: [18, 18, 22, 0.42], fresnelStrength: 14, glareStrength: 70, shadowStrength: 25 }),
  });

  const FITS = ['cover', 'contain', 'fill'];
  const VIDEO_URL = /\.(mp4|webm|ogv|mov|m4v)(?:[?#].*)?$/i;
  const RELEASED = new WeakMap(); // canvas -> { lose, dispatched, pending } so a later create() can restore it

  // ------------------------------------------------------------------ shaders

  const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

  const COMMON = `
uniform vec2 u_res;
uniform float u_dpr;
uniform vec4 u_shapes[${MAX_SHAPES}];
uniform vec4 u_shapeMeta[${MAX_SHAPES}];
uniform int u_count;
uniform float u_merge;

float sdShape(vec2 p, vec4 s, vec2 m) {
  vec2 hs = s.zw;
  float r = clamp(m.x, 0.0, min(hs.x, hs.y));
  vec2 q = abs(p - s.xy);
  vec2 d = q - hs;
  if (r > 0.0 && d.x > -r && d.y > -r) {
    vec2 c = max(q - (hs - vec2(r)), 0.0);
    return pow(pow(c.x, m.y) + pow(c.y, m.y), 1.0 / m.y) - r;
  }
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float smin(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Shapes arrive sorted by group: smooth-merge within a group, hard union across groups.
float scene(vec2 p) {
  float best = 1e6;
  float cur = 1e6;
  float group = -1.0;
  for (int i = 0; i < ${MAX_SHAPES}; i++) {
    if (i >= u_count) break;
    vec4 m = u_shapeMeta[i];
    float di = sdShape(p, u_shapes[i], m.xy);
    if (m.z != group) {
      best = min(best, cur);
      cur = di;
      group = m.z;
    } else {
      cur = smin(cur, di, u_merge);
    }
  }
  return min(best, cur);
}
`;

  const FRAG_BG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform int u_hasTex;
uniform vec3 u_bgColor;
uniform vec4 u_uvMap;
uniform float u_shadowSpread;
uniform float u_shadowStrength;
uniform vec2 u_shadowOffset;
${COMMON}
void main() {
  vec3 col = u_bgColor;
  if (u_hasTex == 1) {
    vec2 t = v_uv * u_uvMap.xy + u_uvMap.zw;
    if (t.x >= 0.0 && t.x <= 1.0 && t.y >= 0.0 && t.y <= 1.0) {
      vec4 s = texture(u_tex, t);
      col = mix(u_bgColor, s.rgb, s.a);
    }
  }
  if (u_count > 0 && u_shadowStrength > 0.0) {
    float d = scene(gl_FragCoord.xy - u_shadowOffset) / u_dpr;
    col -= vec3(exp(-abs(d) / u_shadowSpread) * 0.6 * u_shadowStrength);
  }
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  const FRAG_BLUR = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_texel;
uniform int u_radius;
void main() {
  float sigma = max(float(u_radius) / 3.0, 0.5);
  vec4 sum = texture(u_tex, v_uv);
  float ws = 1.0;
  for (int i = 1; i <= ${MAX_BLUR_TAPS}; i++) {
    if (i > u_radius) break;
    float fi = float(i);
    float w = exp(-0.5 * fi * fi / (sigma * sigma));
    sum += (texture(u_tex, v_uv + u_texel * fi) + texture(u_tex, v_uv - u_texel * fi)) * w;
    ws += 2.0 * w;
  }
  o = sum / ws;
}`;

  const FRAG_MAIN = `#version 300 es
precision highp float;
#define PI 3.14159265359
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_bg;
uniform sampler2D u_blurred;
uniform float u_thickness;
uniform float u_ior;
uniform float u_refraction;
uniform float u_dispersion;
uniform float u_fresnelRange;
uniform float u_fresnelHardness;
uniform float u_fresnelStrength;
uniform float u_glareRange;
uniform float u_glareHardness;
uniform float u_glareStrength;
uniform float u_glareConvergence;
uniform float u_glareOpposite;
uniform float u_glareAngle;
uniform vec4 u_tint;
uniform int u_blurEdge;
uniform int u_debug;
${COMMON}

float toLin(float c) { return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4); }
float toGamma(float c) { return c <= 0.0031308 ? 12.92 * c : 1.055 * pow(c, 1.0 / 2.4) - 0.055; }
const vec3 WHITE = vec3(0.95047, 1.0, 1.08883);
float labF(float t) { return t > 0.008856 ? pow(t, 1.0 / 3.0) : 7.787 * t + 16.0 / 116.0; }
float labFi(float t) { return t > 0.206893 ? t * t * t : (t - 16.0 / 116.0) / 7.787; }

vec3 srgbToLch(vec3 c) {
  vec3 l = vec3(toLin(c.r), toLin(c.g), toLin(c.b));
  vec3 xyz = vec3(
    dot(l, vec3(0.4124, 0.3576, 0.1805)),
    dot(l, vec3(0.2126, 0.7152, 0.0722)),
    dot(l, vec3(0.0193, 0.1192, 0.9505))) / WHITE;
  vec3 f = vec3(labF(xyz.x), labF(xyz.y), labF(xyz.z));
  float a = 500.0 * (f.x - f.y);
  float b = 200.0 * (f.y - f.z);
  float chroma = length(vec2(a, b));
  return vec3(116.0 * f.y - 16.0, chroma, chroma < 1e-4 ? 0.0 : atan(b, a));
}

vec3 lchToSrgb(vec3 lch) {
  float a = lch.y * cos(lch.z);
  float b = lch.y * sin(lch.z);
  float fy = (lch.x + 16.0) / 116.0;
  vec3 xyz = vec3(labFi(fy + a / 500.0), labFi(fy), labFi(fy - b / 200.0)) * WHITE;
  vec3 l = max(vec3(
    dot(xyz, vec3(3.2406, -1.5372, -0.4986)),
    dot(xyz, vec3(-0.9689, 1.8758, 0.0415)),
    dot(xyz, vec3(0.0557, -0.2040, 1.0570))), 0.0);
  return vec3(toGamma(l.r), toGamma(l.g), toGamma(l.b));
}

vec2 sceneGrad(vec2 p) {
  return vec2(scene(p + vec2(1.0, 0.0)) - scene(p - vec2(1.0, 0.0)),
              scene(p + vec2(0.0, 1.0)) - scene(p - vec2(0.0, 1.0))) * 0.5;
}

float rimMask(float depth, float range, float hardness) {
  float x = 1.0 - depth / 1500.0 * pow(500.0 / max(range, 1.0), 2.0) + hardness;
  return clamp(pow(max(x, 0.0), 5.0), 0.0, 1.0);
}

vec3 hue(float a) {
  vec3 k = abs(fract(vec3(a / (2.0 * PI)) + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return clamp(k - 1.0, 0.0, 1.0);
}

vec3 sampleDispersed(vec2 off, float blurMix) {
  float kR = 1.0 + 0.02 * u_dispersion;
  float kB = 1.0 - 0.02 * u_dispersion;
  vec2 uvR = v_uv + off * kR;
  vec2 uvG = v_uv + off;
  vec2 uvB = v_uv + off * kB;
  vec3 sharp = vec3(texture(u_bg, uvR).r, texture(u_bg, uvG).g, texture(u_bg, uvB).b);
  vec3 soft = vec3(texture(u_blurred, uvR).r, texture(u_blurred, uvG).g, texture(u_blurred, uvB).b);
  return mix(sharp, soft, blurMix);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float d = scene(p);
  vec3 bg = texture(u_bg, v_uv).rgb;

  if (u_debug == 1) {
    float dc = d / u_dpr;
    vec3 c = dc > 0.0 ? vec3(0.9, 0.6, 0.3) : vec3(0.65, 0.85, 1.0);
    c *= 1.0 - exp(-0.03 * abs(dc));
    c *= 0.6 + 0.4 * smoothstep(-0.5, 0.5, cos(0.5 * abs(dc)));
    c = mix(c, vec3(1.0), 1.0 - smoothstep(0.5, 1.5, abs(dc)));
    o = vec4(c, 1.0);
    return;
  }

  if (d > 1.0) {
    o = vec4(bg, 1.0);
    return;
  }

  float depth = -d / u_dpr;
  vec2 g = sceneGrad(p);
  float gl = length(g);
  bool hasNormal = gl > 1e-5;
  vec2 n = hasNormal ? g / gl : vec2(0.0);
  float gw = clamp(gl, 0.0, 1.0);
  float nAng = hasNormal ? atan(n.y, n.x) : 0.0;

  float edge = 0.0;
  if (depth < u_thickness) {
    float x = clamp(1.0 - max(depth, 0.0) / u_thickness, 0.0, 1.0);
    float ti = asin(x * x);
    float tt = asin(clamp(sin(ti) / u_ior, -1.0, 1.0));
    edge = max(tan(ti - tt), 0.0);
  }

  float fr = rimMask(depth, u_fresnelRange, u_fresnelHardness);
  float gg = rimMask(depth, u_glareRange, u_glareHardness);
  float ang = (mod(nAng + 2.0 * PI, 2.0 * PI) - PI / 4.0 + u_glareAngle) * 2.0;
  bool farSide = (ang > PI * 1.5 && ang < PI * 3.5) || ang < -PI * 0.5;
  float ga = (0.5 + 0.5 * sin(ang)) * (farSide ? 1.2 * u_glareOpposite : 1.2) * u_glareStrength;
  ga = clamp(pow(max(ga, 0.0), 0.1 + u_glareConvergence * 2.0), 0.0, 1.0);

  if (u_debug == 2) { o = vec4(mix(bg, hue(nAng) * gw, step(d, 0.0)), 1.0); return; }
  if (u_debug == 3) { o = vec4(mix(bg, vec3(edge), step(d, 0.0)), 1.0); return; }
  if (u_debug == 4) { o = vec4(mix(bg, vec3(fr * u_fresnelStrength * 3.0, ga * gg, 0.0), step(d, 0.0)), 1.0); return; }

  vec3 col;
  if (edge <= 0.0) {
    col = texture(u_blurred, v_uv).rgb;
  } else {
    vec2 off = -n * gw * edge * u_refraction * 1414.2136 * u_dpr / u_res;
    col = sampleDispersed(off, u_blurEdge == 1 ? 1.0 : clamp(depth / u_thickness, 0.0, 1.0));
  }
  vec3 base = col;
  col = mix(col, u_tint.rgb, u_tint.a * 0.8);

  if (edge > 0.0) {
    vec3 fl = srgbToLch(mix(vec3(1.0), u_tint.rgb, u_tint.a * 0.5));
    fl.x = clamp(fl.x + 20.0 * fr * u_fresnelStrength, 0.0, 100.0);
    col = mix(col, lchToSrgb(fl), clamp(fr * u_fresnelStrength * 0.7 * gw, 0.0, 1.0));

    vec3 gc = srgbToLch(mix(base, u_tint.rgb, u_tint.a * 0.5));
    gc.x = clamp(gc.x + 150.0 * ga * gg, 0.0, 120.0);
    gc.y += 30.0 * ga * gg;
    col = mix(col, lchToSrgb(gc), clamp(ga * gg * gw, 0.0, 1.0));
  }

  col = mix(col, bg, smoothstep(-0.75, 0.75, d));
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  // ------------------------------------------------------------------ helpers

  function isSupported() {
    try {
      return !!document.createElement('canvas').getContext('webgl2');
    } catch (_) {
      return false;
    }
  }

  function clampNum(name, v) {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(`LiquidGlass: "${name}" must be a finite number`);
    const r = RANGES[name];
    return r ? Math.min(r[1], Math.max(r[0], n)) : n;
  }

  function normTint(v) {
    if (!Array.isArray(v) || v.length !== 4 || v.some((x) => !Number.isFinite(Number(x)))) {
      throw new TypeError('LiquidGlass: "tint" must be [r, g, b, a] with r,g,b 0-255 and a 0-1');
    }
    return [0, 1, 2].map((i) => Math.min(255, Math.max(0, Number(v[i])))).concat(Math.min(1, Math.max(0, Number(v[3]))));
  }

  function mergeParams(base, patch) {
    const out = Object.assign({}, base);
    for (const [k, v] of Object.entries(patch || {})) {
      if (!(k in DEFAULTS)) throw new TypeError(`LiquidGlass: unknown parameter "${k}"`);
      if (k === 'tint') out.tint = normTint(v);
      else if (k === 'shadowOffset') {
        if (!Array.isArray(v) || v.length !== 2) throw new TypeError('LiquidGlass: "shadowOffset" must be [x, y] in CSS px');
        out.shadowOffset = [clampNum('shadowOffset[0]', v[0]), clampNum('shadowOffset[1]', v[1])];
      } else if (k === 'blurEdge') out.blurEdge = !!v;
      else out[k] = clampNum(k, v);
    }
    return out;
  }

  function checkFit(fit) {
    if (!FITS.includes(fit)) throw new TypeError(`LiquidGlass: "fit" must be one of ${FITS.join(', ')}`);
    return fit;
  }

  function checkPosition(pos) {
    if (!Array.isArray(pos) || pos.length !== 2 || !pos.every((x) => Number.isFinite(Number(x)))) {
      throw new TypeError('LiquidGlass: "position" must be [x, y] fractions, e.g. [0.5, 0.5]');
    }
    return [Number(pos[0]), Number(pos[1])];
  }

  function parseColor(css) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillStyle = String(css);
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }

  // Returns { value, pct } from the element's computed top-left radius.
  function readCssRadius(el) {
    const first = (getComputedStyle(el).borderTopLeftRadius || '0').split(' ')[0];
    const n = parseFloat(first);
    if (!Number.isFinite(n)) return { value: 0, pct: false };
    return { value: n, pct: first.endsWith('%') };
  }

  function parseRadius(r, i) {
    if (r === undefined || r === 'auto') return 'auto';
    const n = typeof r === 'string' ? parseFloat(r) : Number(r);
    if (!Number.isFinite(n) || n < 0) throw new TypeError(`LiquidGlass: shape ${i}.radius must be "auto" or a non-negative number of CSS px`);
    return n;
  }

  // ------------------------------------------------------------------ factory

  function create(canvas, options) {
    if (typeof HTMLCanvasElement === 'undefined' || !(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError('LiquidGlass.create: first argument must be an HTMLCanvasElement');
    }
    const opts = Object.assign({ maxDpr: 2, fit: 'cover', position: [0.5, 0.5], backgroundColor: '#808080' }, options || {});
    const onError = typeof opts.onError === 'function' ? opts.onError : (e) => console.warn('[LiquidGlass]', e);
    const mq = (q) => typeof matchMedia === 'function' && matchMedia(q).matches;
    const reduceMotion = mq('(prefers-reduced-motion: reduce)');
    const reduceTransparency = mq('(prefers-reduced-transparency: reduce)');
    if (opts.preset !== undefined && !PRESETS[opts.preset]) throw new TypeError(`LiquidGlass: unknown preset "${opts.preset}"`);

    function buildParams(presetName, overrides) {
      let p = mergeParams(mergeParams(DEFAULTS, PRESETS[presetName || 'standard']), overrides);
      if (reduceTransparency) p = mergeParams(p, { blur: Math.max(p.blur, 16), tint: [p.tint[0], p.tint[1], p.tint[2], Math.max(p.tint[3], 0.6)] });
      return p;
    }

    let params = buildParams(opts.preset, opts.params);
    let fit = checkFit(opts.fit);
    let position = checkPosition(opts.position);
    const markFallback = () => {
      if (Array.isArray(opts.shapes)) opts.shapes.forEach((s) => { if (s && s.element instanceof Element) s.element.dataset.lg = 'fallback'; });
    };

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) {
      canvas.dataset.lg = 'unsupported';
      canvas.style.display = 'none';
      markFallback();
      onError(new Error('WebGL2 is not available; glass elements were marked data-lg="fallback"'));
      return null;
    }

    let halfFloat = false;
    let maxDim = 4096;
    let shapes = [];
    let programs = null;
    let quad = null;
    let targets = null;
    let bgTex = null;
    let bgInfo = { source: null, ready: false, dynamic: false, flipY: true, width: 1, height: 1, ownedVideo: null, token: null };
    let bgColor = parseColor(opts.backgroundColor);
    let raf = 0;
    let paused = false;
    let destroyed = false;
    let contextLost = false;
    let dirty = true;
    let lastSig = null;
    let lastTime = 0;
    let dpr = 1;
    let bufW = 1;
    let bufH = 1;
    const pointer = { cx: null, cy: null };
    let ro = null;

    // ---------------------------------------------------------------- GL setup

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error(`LiquidGlass shader compile failed: ${log}`);
      }
      return sh;
    }

    function program(fragSrc) {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.bindAttribLocation(p, 0, 'a_pos');
      gl.linkProgram(p);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(p);
        gl.deleteProgram(p);
        throw new Error(`LiquidGlass program link failed: ${log}`);
      }
      const loc = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        loc[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, info.name);
      }
      return { p, loc };
    }

    function makeTarget(w, h) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, halfFloat ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, halfFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE && halfFloat) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (!ok) {
        gl.deleteTexture(tex);
        gl.deleteFramebuffer(fbo);
        throw new Error(`LiquidGlass: framebuffer incomplete at ${w}x${h}`);
      }
      return { tex, fbo, w, h };
    }

    function freeTargets() {
      if (!targets) return;
      for (const t of Object.values(targets)) {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      }
      targets = null;
    }

    function initGL() {
      halfFloat = !!gl.getExtension('EXT_color_buffer_float');
      maxDim = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), ...gl.getParameter(gl.MAX_VIEWPORT_DIMS));
      programs = { bg: program(FRAG_BG), blur: program(FRAG_BLUR), main: program(FRAG_MAIN) };
      quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      bgTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, bgTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      targets = null;
      lastSig = null;
      dirty = true;
      if (bgInfo.ready) uploadBackground();
    }

    // ---------------------------------------------------------------- background

    // Returns true on success; on failure reports through onError and returns false.
    function uploadBackground() {
      const src = bgInfo.source;
      if (!src || contextLost) return false;
      try {
        gl.bindTexture(gl.TEXTURE_2D, bgTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        if (bgInfo.dynamic) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        } else {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        dirty = true;
        return true;
      } catch (e) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        bgInfo.ready = false;
        dirty = true;
        onError(new Error(`Background upload failed (cross-origin media needs CORS headers): ${e.message}`));
        return false;
      }
    }

    function sourceSize(src) {
      if (typeof HTMLVideoElement !== 'undefined' && src instanceof HTMLVideoElement) return [src.videoWidth, src.videoHeight];
      if (typeof HTMLImageElement !== 'undefined' && src instanceof HTMLImageElement) return [src.naturalWidth, src.naturalHeight];
      return [src.width, src.height];
    }

    function releaseOwnedVideo() {
      const v = bgInfo.ownedVideo;
      if (!v) return;
      v.pause();
      v.removeAttribute('src');
      v.load();
      v.remove();
    }

    function setBackground(source, bgOpts) {
      const o = bgOpts || {};
      if (o.fit !== undefined) fit = checkFit(o.fit);
      if (o.position !== undefined) position = checkPosition(o.position);
      if (o.color !== undefined) bgColor = parseColor(o.color);
      if (o.type !== undefined && o.type !== 'image' && o.type !== 'video') throw new TypeError('LiquidGlass: background "type" must be "image" or "video"');
      releaseOwnedVideo();
      const token = {};
      bgInfo = { source: null, ready: false, dynamic: false, flipY: true, width: 1, height: 1, ownedVideo: null, token };
      dirty = true;
      start();
      if (source == null) return Promise.resolve();

      let el = source;
      if (typeof source === 'string') {
        const asVideo = o.type ? o.type === 'video' : VIDEO_URL.test(source);
        if (asVideo) {
          el = document.createElement('video');
          el.crossOrigin = 'anonymous';
          el.muted = true;
          el.defaultMuted = true;
          el.loop = true;
          el.playsInline = true;
          el.preload = 'auto';
          el.setAttribute('muted', '');
          el.setAttribute('playsinline', '');
          el.setAttribute('aria-hidden', 'true');
          // In the document for WebKit; started by play() rather than the autoplay attribute, because
          // browsers pause attribute-autoplayed muted videos they consider invisible.
          el.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1';
          el.src = source;
          document.body.appendChild(el);
          bgInfo.ownedVideo = el;
        } else {
          el = new Image();
          el.crossOrigin = 'anonymous';
          el.decoding = 'async';
          el.src = source;
        }
      }
      const isVideo = typeof HTMLVideoElement !== 'undefined' && el instanceof HTMLVideoElement;
      const isImage = typeof HTMLImageElement !== 'undefined' && el instanceof HTMLImageElement;
      const isBitmap = typeof ImageBitmap !== 'undefined' && el instanceof ImageBitmap;

      const tryPlay = () => {
        const p = el.play();
        if (p && typeof p.catch === 'function') {
          p.catch((err) => {
            onError(new Error(`Background video could not autoplay (${err.name}); retrying on the next tap`));
            window.addEventListener('pointerdown', () => { el.play().catch((e2) => onError(e2)); }, { once: true });
          });
        }
      };

      const promise = new Promise((resolve, reject) => {
        let timer = 0;
        const fail = (err) => {
          clearTimeout(timer);
          if (bgInfo.token === token) dirty = true;
          reject(err);
        };
        const finish = () => {
          clearTimeout(timer);
          if (bgInfo.token !== token) return resolve();
          const [w, h] = sourceSize(el);
          if (!w || !h) return fail(new Error('Background has zero size'));
          Object.assign(bgInfo, { source: el, ready: true, dynamic: isVideo || !!o.live, flipY: !isBitmap, width: w, height: h });
          if (!contextLost && !uploadBackground()) {
            bgInfo.source = null;
            return reject(new Error('Background could not be uploaded to WebGL (see onError)'));
          }
          start();
          resolve();
        };
        if (isImage) {
          if (el.complete) {
            if (el.naturalWidth) finish();
            else fail(new Error(`Background image failed to load: ${el.currentSrc || el.src}`));
          } else {
            el.addEventListener('load', finish, { once: true });
            el.addEventListener('error', () => fail(new Error(`Background image failed to load: ${el.currentSrc || el.src}`)), { once: true });
          }
        } else if (isVideo) {
          if (el.preload === 'none') el.preload = 'auto';
          if (el.readyState >= 2) finish();
          else {
            el.addEventListener('loadeddata', finish, { once: true });
            el.addEventListener('error', () => fail(new Error(`Background video failed to load: ${el.currentSrc || el.src}`)), { once: true });
            timer = setTimeout(() => fail(new Error(`Background video did not load within ${VIDEO_TIMEOUT_MS / 1000} s (autoplay blocked, Low Power Mode, or unsupported codec)`)), VIDEO_TIMEOUT_MS);
            if (bgInfo.ownedVideo === el) el.load();
          }
          tryPlay();
        } else if (el && typeof el.width === 'number' && typeof el.height === 'number') {
          finish();
        } else {
          fail(new TypeError('Background must be a URL, <img>, <video>, <canvas>, ImageBitmap or OffscreenCanvas'));
        }
      });
      promise.catch((e) => onError(e));
      return promise;
    }

    function uvMap() {
      const ca = bufW / Math.max(1, bufH);
      const ta = bgInfo.width / Math.max(1, bgInfo.height);
      let sx = 1;
      let sy = 1;
      if (fit === 'cover') {
        if (ca > ta) sy = ta / ca; else sx = ca / ta;
      } else if (fit === 'contain') {
        if (ca > ta) sx = ca / ta; else sy = ta / ca;
      }
      const px = Math.min(1, Math.max(0, position[0]));
      const py = 1 - Math.min(1, Math.max(0, position[1]));
      const ox = (1 - sx) * px;
      const oy = (1 - sy) * py;
      return bgInfo.flipY ? [sx, sy, ox, oy] : [sx, -sy, ox, 1 - oy];
    }

    // ---------------------------------------------------------------- shapes

    function normShape(s, i) {
      if (!s || typeof s !== 'object') throw new TypeError(`LiquidGlass: shape ${i} must be an object`);
      const element = s.element || null;
      if (element && !(element instanceof Element)) throw new TypeError(`LiquidGlass: shape ${i}.element must be a DOM Element`);
      const follow = s.follow === 'pointer';
      if (s.follow !== undefined && !follow) throw new TypeError(`LiquidGlass: shape ${i}.follow only supports "pointer"`);
      if (!element && !follow && !(Number(s.width) > 0 && Number(s.height) > 0)) {
        throw new TypeError(`LiquidGlass: shape ${i} needs an element, follow: "pointer", or positive width/height`);
      }
      const width = Number(s.width) || 0;
      const height = Number(s.height) || 0;
      const shape = {
        element,
        follow,
        group: s.group === undefined ? '' : String(s.group),
        x: Number(s.x) || 0,
        y: Number(s.y) || 0,
        width: follow ? width || 160 : width,
        height: follow ? height || 160 : height,
        radius: parseRadius(s.radius, i),
        roundness: s.roundness === undefined ? null : clampNum('roundness', s.roundness),
        inset: Number(s.inset) || 0,
        stretch: s.stretch === undefined ? 10 : Math.max(0, Number(s.stretch) || 0),
        cssRadius: null,
        spring: null,
      };
      if (follow) {
        const cx = s.x !== undefined ? shape.x + shape.width / 2 : null;
        const cy = s.y !== undefined ? shape.y + shape.height / 2 : null;
        shape.spring = { x: cx, y: cy, vx: 0, vy: 0 };
      }
      return shape;
    }

    function setShapes(list) {
      if (!Array.isArray(list)) throw new TypeError('LiquidGlass.setShapes: expected an array');
      if (list.length > MAX_SHAPES) throw new RangeError(`LiquidGlass: at most ${MAX_SHAPES} shapes`);
      const next = list.map(normShape);
      shapes.forEach((s) => {
        if (s.element && !next.some((n) => n.element === s.element)) {
          delete s.element.dataset.lg;
          if (ro) ro.unobserve(s.element);
        }
      });
      next.forEach((s) => {
        if (!s.element) return;
        s.element.dataset.lg = 'glass';
        if (ro) ro.observe(s.element);
      });
      shapes = next;
      dirty = true;
    }

    function stepSprings(dt, cRect) {
      let active = false;
      const cw = cRect.width;
      const ch = cRect.height;
      const px = pointer.cx === null ? null : pointer.cx - cRect.left;
      const py = pointer.cy === null ? null : pointer.cy - cRect.top;
      for (const s of shapes) {
        if (!s.follow) continue;
        const sp = s.spring;
        if (sp.x === null) { sp.x = cw / 2; sp.y = ch / 2; }
        const tx = px === null ? sp.x : px;
        const ty = py === null ? sp.y : py;
        if (reduceMotion) {
          active = active || sp.x !== tx || sp.y !== ty;
          sp.x = tx; sp.y = ty; sp.vx = 0; sp.vy = 0;
          continue;
        }
        const tension = 170;
        const friction = 26;
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
        const h = dt / steps;
        for (let k = 0; k < steps; k++) {
          sp.vx += (tension * (tx - sp.x) - friction * sp.vx) * h;
          sp.vy += (tension * (ty - sp.y) - friction * sp.vy) * h;
          sp.x += sp.vx * h;
          sp.y += sp.vy * h;
        }
        if (Math.abs(tx - sp.x) < 0.05 && Math.abs(ty - sp.y) < 0.05 && Math.hypot(sp.vx, sp.vy) < 0.5) {
          sp.x = tx; sp.y = ty; sp.vx = 0; sp.vy = 0;
        } else {
          active = true;
        }
      }
      return active;
    }

    function collectShapes(cRect, sx, sy, H) {
      const entries = [];
      const groupIds = new Map();
      for (const s of shapes) {
        let x, y, w, h;
        if (s.element) {
          if (!s.element.isConnected) continue;
          if (typeof s.element.checkVisibility === 'function' && !s.element.checkVisibility({ visibilityProperty: true })) continue;
          const r = s.element.getBoundingClientRect();
          x = r.left - cRect.left; y = r.top - cRect.top; w = r.width; h = r.height;
          if (s.radius === 'auto' && s.cssRadius === null) s.cssRadius = readCssRadius(s.element);
        } else if (s.follow) {
          const sp = s.spring;
          const stretchX = 1 + ((Math.abs(sp.vx) / 1000) * s.stretch) / 100;
          const stretchY = 1 + ((Math.abs(sp.vy) / 1000) * s.stretch) / 100;
          w = s.width * Math.min(stretchX, 1.6);
          h = s.height * Math.min(stretchY, 1.6);
          x = sp.x - w / 2; y = sp.y - h / 2;
        } else {
          x = s.x; y = s.y; w = s.width; h = s.height;
        }
        x += s.inset; y += s.inset; w -= 2 * s.inset; h -= 2 * s.inset;
        if (!(w > 0.5 && h > 0.5)) continue;
        let radius;
        if (s.radius !== 'auto') radius = s.radius;
        else if (s.element) radius = s.cssRadius.pct ? (Math.min(w, h) * s.cssRadius.value) / 100 : s.cssRadius.value;
        else radius = Math.min(w, h) * 0.4;
        radius = Math.min(Math.max(0, radius), Math.min(w, h) / 2);
        const capsule = radius >= Math.min(w, h) / 2 - 0.5;
        let roundness = s.roundness;
        if (roundness === null) roundness = capsule || s.element ? 2 : params.roundness;
        if (!groupIds.has(s.group)) groupIds.set(s.group, groupIds.size);
        entries.push({ g: groupIds.get(s.group), cx: (x + w / 2) * sx, cy: H - (y + h / 2) * sy, hw: (w / 2) * sx, hh: (h / 2) * sy, r: radius * sx, n: roundness });
      }
      entries.sort((a, b) => a.g - b.g);
      const geo = new Float32Array(MAX_SHAPES * 4);
      const meta = new Float32Array(MAX_SHAPES * 4);
      entries.forEach((e, i) => {
        geo.set([e.cx, e.cy, e.hw, e.hh], i * 4);
        meta.set([e.r, e.n, e.g, 0], i * 4);
      });
      return { geo, meta, count: entries.length };
    }

    // ---------------------------------------------------------------- frame

    function resizeIfNeeded() {
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (!(cssW > 0 && cssH > 0)) return false;
      const want = Math.min(window.devicePixelRatio || 1, Math.max(0.25, Number(opts.maxDpr) || 2));
      dpr = Math.min(want, maxDim / Math.max(cssW, cssH));
      const w = Math.max(1, Math.min(maxDim, Math.round(cssW * dpr)));
      const h = Math.max(1, Math.min(maxDim, Math.round(cssH * dpr)));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (!gl.drawingBufferWidth || !gl.drawingBufferHeight) {
        // A freshly restored context can report an empty drawing buffer until the canvas is resized.
        canvas.width = w;
        canvas.height = h;
        if (!gl.drawingBufferWidth || !gl.drawingBufferHeight) return false;
      }
      bufW = gl.drawingBufferWidth;
      bufH = gl.drawingBufferHeight;
      if (!targets || targets.bg.w !== bufW || targets.bg.h !== bufH) {
        freeTargets();
        targets = { bg: makeTarget(bufW, bufH), a: makeTarget(bufW, bufH), b: makeTarget(bufW, bufH) };
        dirty = true;
      }
      return true;
    }

    function use(prog, fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, bufW, bufH);
      gl.useProgram(prog.p);
      return prog.loc;
    }

    function setCommon(L, sh) {
      gl.uniform2f(L.u_res, bufW, bufH);
      gl.uniform1f(L.u_dpr, dpr);
      gl.uniform4fv(L.u_shapes, sh.geo);
      gl.uniform4fv(L.u_shapeMeta, sh.meta);
      gl.uniform1i(L.u_count, sh.count);
      gl.uniform1f(L.u_merge, params.merge * dpr);
    }

    function bindTex(unit, tex, loc) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc, unit);
    }

    function draw(sh) {
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      let L = use(programs.bg, targets.bg.fbo);
      setCommon(L, sh);
      bindTex(0, bgTex, L.u_tex);
      gl.uniform1i(L.u_hasTex, bgInfo.ready ? 1 : 0);
      gl.uniform3fv(L.u_bgColor, bgColor);
      gl.uniform4fv(L.u_uvMap, uvMap());
      gl.uniform1f(L.u_shadowSpread, params.shadowSpread);
      gl.uniform1f(L.u_shadowStrength, params.shadowStrength / 100);
      gl.uniform2f(L.u_shadowOffset, params.shadowOffset[0] * dpr, -params.shadowOffset[1] * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      let blurred = targets.bg.tex;
      const radius = Math.min(MAX_BLUR_TAPS, Math.round(params.blur * dpr));
      if (radius > 1) {
        L = use(programs.blur, targets.a.fbo);
        bindTex(0, targets.bg.tex, L.u_tex);
        gl.uniform2f(L.u_texel, 0, 1 / bufH);
        gl.uniform1i(L.u_radius, radius);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        L = use(programs.blur, targets.b.fbo);
        bindTex(0, targets.a.tex, L.u_tex);
        gl.uniform2f(L.u_texel, 1 / bufW, 0);
        gl.uniform1i(L.u_radius, radius);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        blurred = targets.b.tex;
      }

      L = use(programs.main, null);
      setCommon(L, sh);
      bindTex(0, targets.bg.tex, L.u_bg);
      bindTex(1, blurred, L.u_blurred);
      const p = params;
      gl.uniform1f(L.u_thickness, p.thickness);
      gl.uniform1f(L.u_ior, p.ior);
      gl.uniform1f(L.u_refraction, p.refraction);
      gl.uniform1f(L.u_dispersion, p.dispersion);
      gl.uniform1f(L.u_fresnelRange, p.fresnelRange);
      gl.uniform1f(L.u_fresnelHardness, p.fresnelHardness / 100);
      gl.uniform1f(L.u_fresnelStrength, p.fresnelStrength / 100);
      gl.uniform1f(L.u_glareRange, p.glareRange);
      gl.uniform1f(L.u_glareHardness, p.glareHardness / 100);
      gl.uniform1f(L.u_glareStrength, p.glareStrength / 100);
      gl.uniform1f(L.u_glareConvergence, p.glareConvergence / 100);
      gl.uniform1f(L.u_glareOpposite, p.glareOpposite / 100);
      gl.uniform1f(L.u_glareAngle, (p.glareAngle * Math.PI) / 180);
      gl.uniform4f(L.u_tint, p.tint[0] / 255, p.tint[1] / 255, p.tint[2] / 255, p.tint[3]);
      gl.uniform1i(L.u_blurEdge, p.blurEdge ? 1 : 0);
      gl.uniform1i(L.u_debug, Math.round(p.debug));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      raf = 0;
      if (destroyed || paused || contextLost) return;
      raf = requestAnimationFrame(frame);
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;
      try {
        if (!resizeIfNeeded()) return;
        const cRect = canvas.getBoundingClientRect();
        const springing = stepSprings(dt, cRect);
        const sx = bufW / Math.max(1, cRect.width);
        const sy = bufH / Math.max(1, cRect.height);
        const sh = collectShapes(cRect, sx, sy, bufH);
        const src = bgInfo.ready && bgInfo.dynamic ? bgInfo.source : null;
        const isVideo = src && typeof HTMLVideoElement !== 'undefined' && src instanceof HTMLVideoElement;
        const live = !!src && (!isVideo || (!src.paused && !src.ended && src.readyState >= 2));
        if (live && !uploadBackground()) return;
        const sig = sh.count + '|' + Array.prototype.join.call(sh.geo.subarray(0, sh.count * 4), ',') + '|' +
          Array.prototype.join.call(sh.meta.subarray(0, sh.count * 4), ',') + '|' + bufW + 'x' + bufH;
        if (!dirty && !live && !springing && sig === lastSig) return;
        lastSig = sig;
        dirty = false;
        draw(sh);
      } catch (e) {
        cancelAnimationFrame(raf);
        raf = 0;
        onError(e);
      }
    }

    function start() {
      if (!raf && !destroyed && !paused && !contextLost) {
        lastTime = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    // ---------------------------------------------------------------- events

    const onPointer = (e) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
    };
    const onLost = (e) => {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {
      contextLost = false;
      try {
        initGL();
        start();
      } catch (e) {
        onError(e);
      }
    };
    ro = typeof ResizeObserver === 'function' ? new ResizeObserver((records) => {
      dirty = true;
      for (const rec of records) {
        for (const s of shapes) if (s.element === rec.target) s.cssRadius = null;
      }
    }) : null;

    function detach() {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (ro) ro.disconnect();
    }

    if (ro) ro.observe(canvas);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    try {
      if (gl.isContextLost()) {
        // Same canvas as a destroyed instance (e.g. React StrictMode remount): restore, then init on restore.
        contextLost = true;
        const entry = RELEASED.get(canvas);
        RELEASED.delete(canvas);
        if (entry) {
          if (entry.dispatched) entry.lose.restoreContext();
          else entry.pending = true; // restore once the browser has dispatched the lost event
        }
      } else {
        initGL();
      }
      setShapes(Array.isArray(opts.shapes) ? opts.shapes : []);
    } catch (e) {
      detach();
      canvas.dataset.lg = 'unsupported';
      canvas.style.display = 'none';
      markFallback();
      onError(e);
      return null;
    }
    canvas.dataset.lg = 'active';
    canvas.setAttribute('aria-hidden', 'true');
    const ready = opts.background != null ? setBackground(opts.background, { type: opts.backgroundType, live: opts.live }) : Promise.resolve();
    ready.catch(() => {});
    start();

    // ---------------------------------------------------------------- public API

    return {
      canvas,
      ready,
      setParams(patch) {
        params = mergeParams(params, patch);
        dirty = true;
        start();
        return this;
      },
      getParams() {
        return JSON.parse(JSON.stringify(params));
      },
      usePreset(name) {
        if (!PRESETS[name]) throw new TypeError(`LiquidGlass: unknown preset "${name}"`);
        params = buildParams(name, {});
        dirty = true;
        start();
        return this;
      },
      setShapes(list) {
        setShapes(list);
        start();
        return this;
      },
      setBackground(source, bgOpts) {
        return setBackground(source, bgOpts);
      },
      updateBackground() {
        if (bgInfo.ready) uploadBackground();
        start();
      },
      refresh() {
        shapes.forEach((s) => { s.cssRadius = null; });
        dirty = true;
        start();
      },
      pause() {
        paused = true;
        cancelAnimationFrame(raf);
        raf = 0;
      },
      resume() {
        paused = false;
        dirty = true;
        start();
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        cancelAnimationFrame(raf);
        raf = 0;
        detach();
        shapes.forEach((s) => { if (s.element) delete s.element.dataset.lg; });
        releaseOwnedVideo();
        if (!contextLost) {
          freeTargets();
          Object.values(programs || {}).forEach((pr) => gl.deleteProgram(pr.p));
          gl.deleteBuffer(quad);
          gl.deleteTexture(bgTex);
          const lose = gl.getExtension('WEBGL_lose_context');
          if (lose) {
            const entry = { lose, dispatched: false, pending: false };
            RELEASED.set(canvas, entry);
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              entry.dispatched = true;
              if (entry.pending) setTimeout(() => lose.restoreContext(), 0);
            }, { once: true });
            lose.loseContext();
          }
        }
        delete canvas.dataset.lg;
      },
    };
  }

  return Object.freeze({ VERSION, MAX_SHAPES, DEFAULTS, PRESETS, isSupported, create });
}));
