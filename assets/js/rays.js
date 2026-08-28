/* ═══════════════════════════════════════════════════════════════════
   rays.js — the mirror-ball light burst behind the page.

   Original canvas rendering, not video: spokes of coloured facet-light
   thrown outward from the ball, drawn additively so they bloom where
   they overlap. Nothing to download, loops forever, and it costs a few
   kilobytes instead of a 4K stream.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var cv = document.getElementById('beams');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d', { alpha: false });
  if (!ctx) return;

  /* ── dial the whole effect from here ────────────────────────── */
  var CFG = {
    intensity: 1,        // 0 calm ... 1.6 nightclub
    spokes:    54,       // how many beams leave the ball
    segments:  30,       // facet blocks along each beam
    spin:      0.027,    // radians per second
    originX:   0.5,      // where the light comes from, as a fraction
    originY:   0.19      //   of the viewport (matches the hanging ball)
  };

  /* the ball's colours, weighted so the invitation's pink still leads */
  var PALETTE = [
    [255,  63, 164], [255,  63, 164], [226,  42, 139],
    [255,  92, 210], [120,  76, 255], [ 64, 196, 255],
    [ 74, 255, 214], [255, 208,  92], [255, 122,  56],
    [255,  70,  86], [246, 200, 232], [255, 255, 255]
  ];

  var TAU = Math.PI * 2;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var w = 0, h = 0, dpr = 1, diag = 0;
  var ORIGIN = { x: CFG.originX, y: CFG.originY };
  var spokes = [];
  var running = false, raf = null, t0 = 0;

  /* deterministic pseudo-random, so the layout is stable across resizes */
  function rnd(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function buildSpokes() {
    spokes = [];
    for (var i = 0; i < CFG.spokes; i++) {
      var a = rnd(i), b = rnd(i + 97), c = rnd(i + 211);
      spokes.push({
        angle:  (i / CFG.spokes) * TAU + (a - 0.5) * 0.06,
        colour: PALETTE[Math.floor(b * PALETTE.length)],
        reach:  0.95 + a * 0.75,      // how far down the beam runs
        width:  0.5 + c * 1.5,        // facet size multiplier
        phase:  a * TAU,              // flicker offset
        rate:   0.6 + b * 1.7,        // flicker speed
        skip:   0.25 + c * 0.4        // gap between facets
      });
    }
  }

  /* the light should leave the ball itself, not a guessed fraction of
     the viewport — the two drift apart badly on tall phone screens */
  function locate() {
    var b = document.querySelector('.hero__ball .ball');
    if (!b) return;
    var r = b.getBoundingClientRect();
    if (!r.width || !h) return;
    ORIGIN.x = (r.left + r.width / 2) / w;
    ORIGIN.y = (r.top + window.scrollY + r.height / 2) / h;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth;
    h = cv.clientHeight;
    cv.width  = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    diag = Math.sqrt(w * w + h * h) * 0.62;
    ctx.fillStyle = '#150610';
    ctx.fillRect(0, 0, w, h);
    locate();
  }

  function draw(time) {
    var secs = time / 1000;
    var ox = w * ORIGIN.x;
    var oy = h * ORIGIN.y;

    /* a translucent wash instead of a hard clear — the beams smear
       very slightly as they turn, which is what sells the motion */
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(21, 6, 16, 0.42)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';

    var spin = secs * CFG.spin;

    for (var i = 0; i < spokes.length; i++) {
      var s = spokes[i];
      var col = s.colour;

      /* each beam breathes on its own cycle */
      var pulse = 0.6 + 0.4 * Math.sin(secs * s.rate + s.phase);
      var far = diag * s.reach;

      /* one transform per beam: draw its facets along +x, then rotate
         the whole spoke into place so they point away from the ball */
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(s.angle + spin);

      for (var j = 1; j <= CFG.segments; j++) {
        var f = j / CFG.segments;                  // 0 -> 1 along the beam
        var r = far * Math.pow(f, 1.7);            // bunch facets near the ball
        if (r > diag * 1.5) break;

        /* skip some blocks so the beam reads as facets, not a solid line */
        if (rnd(i * 31 + j) < s.skip) continue;

        var thick = (1.8 + f * 9) * s.width;
        var len   = (4 + f * 40) * s.width;
        var a = (1 - f * 0.72) * pulse * CFG.intensity * 0.85;
        if (a <= 0.004) continue;

        ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a.toFixed(3) + ')';
        ctx.fillRect(r, -thick / 2, len, thick);
      }

      ctx.restore();
    }

    /* the bloom right at the ball */
    var glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, diag * 0.24);
    glow.addColorStop(0,   'rgba(255,150,220,' + (0.30 * CFG.intensity).toFixed(3) + ')');
    glow.addColorStop(0.5, 'rgba(226,42,139,'  + (0.10 * CFG.intensity).toFixed(3) + ')');
    glow.addColorStop(1,   'rgba(226,42,139,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  function frame(time) {
    if (!running) return;
    draw(time - t0);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    t0 = performance.now() - 4000;   // start mid-cycle, not from black
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  /* full blast over the invitation, then settle back so the text
     sections aren't competing with a strobing background */
  var FADE_TO = 0.14;
  function fade() {
    var span = window.innerHeight * 1.15;
    var k = Math.min(1, Math.max(0, window.scrollY / span));
    cv.style.opacity = (1 - k * (1 - FADE_TO)).toFixed(3);
  }
  window.addEventListener('scroll', fade, { passive: true });
  fade();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(); if (reduced) draw(6000); }, 150);
  });

  /* don't burn a phone battery rendering to a tab nobody is looking at */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  resize();
  buildSpokes();

  /* fonts settle after first paint and nudge the layout — re-measure */
  window.addEventListener('load', locate);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(locate);

  if (reduced) {
    /* one still frame, no animation */
    ctx.fillStyle = '#150610';
    ctx.fillRect(0, 0, w, h);
    draw(6000);
  } else {
    start();
  }

  /* let the console poke at it while tuning */
  window.Beams = {
    cfg: CFG,
    set: function (k, v) { CFG[k] = v; buildSpokes(); },
    render: function (t) { draw(t || 6000); },   // draw one frame by hand
    stop: stop,
    start: start
  };
})();
