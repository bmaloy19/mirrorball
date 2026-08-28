/* ═══════════════════════════════════════════════════════════════════
   ball.js — the mirror ball, drawn as an actual sphere.

   The CSS version tiled a flat grid across a circle, which reads as
   graph paper rather than a ball: real facets compress hard toward the
   rim and catch the light one at a time. So each tile here is a genuine
   quad on a sphere — its four corners are placed by latitude and
   longitude, projected, shaded off its own normal, and given the odd
   sharp glint as the ball turns.

   One rAF loop drives every ball on the page.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DEG = Math.PI / 180;

  /* key light, up and to the left — matches where the page's glow sits */
  var LX = -0.46, LY = -0.56, LZ = 0.69;

  var SILVER = [214, 221, 233];
  var PINK   = [232,  60, 150];

  /* scattered facets catch the coloured beams in the room, the way the
     real thing picks up whatever the lighting rig is doing */
  var ROOM = [
    [255,  63, 164], [120,  76, 255], [ 64, 196, 255],
    [ 74, 255, 214], [255, 208,  92], [255, 122,  56]
  ];

  var balls = [];
  var raf = null, running = false;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rnd(seed) {
    var x = Math.sin(seed * 91.7 + 43.1) * 28657.13;
    return x - Math.floor(x);
  }

  function attach(el) {
    var cv = document.createElement('canvas');
    cv.className = 'ball__canvas';
    cv.setAttribute('aria-hidden', 'true');
    el.appendChild(cv);
    el.classList.add('is-rendered');

    var b = {
      el: el,
      cv: cv,
      ctx: cv.getContext('2d'),
      bands: 0, cols: 0,
      w: 0, h: 0, dpr: 1,
      seed: balls.length * 37.7
    };
    size(b);
    balls.push(b);
    return b;
  }

  function size(b) {
    var r = b.el.getBoundingClientRect();
    if (!r.width) return;
    b.dpr = Math.min(window.devicePixelRatio || 1, 2);
    b.w = r.width;
    b.h = r.height;
    b.cv.width  = Math.round(b.w * b.dpr);
    b.cv.height = Math.round(b.h * b.dpr);
    b.ctx.setTransform(b.dpr, 0, 0, b.dpr, 0, 0);

    /* denser tiling on the big ones, cheaper on the small */
    b.bands = b.w > 100 ? 20 : (b.w > 44 ? 14 : 10);
    b.cols  = b.bands * 2;
  }

  function draw(b, t) {
    var ctx = b.ctx;
    var R = b.w / 2, cx = R, cy = R;

    ctx.clearRect(0, 0, b.w, b.h);

    /* the dark body showing between facets is what makes them read as
       separate mirrors rather than a painted grid */
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#191320';
    ctx.fill();
    ctx.save();
    ctx.clip();

    var rot = t * 0.16 + b.seed;
    var dLat = 180 / b.bands, dLon = 360 / b.cols;

    for (var j = 0; j < b.bands; j++) {
      var la0 = (-90 + j * dLat) * DEG;
      var la1 = la0 + dLat * DEG;
      var cla0 = Math.cos(la0), sla0 = Math.sin(la0);
      var cla1 = Math.cos(la1), sla1 = Math.sin(la1);

      for (var i = 0; i < b.cols; i++) {
        var lo0 = (i * dLon) * DEG + rot;
        var lo1 = lo0 + dLon * DEG;

        /* facet centre — skip anything on the far side */
        var mla = (la0 + la1) / 2, mlo = (lo0 + lo1) / 2;
        var cm = Math.cos(mla);
        var nx = cm * Math.sin(mlo), ny = -Math.sin(mla), nz = cm * Math.cos(mlo);
        if (nz <= 0.06) continue;

        var slo0 = Math.sin(lo0), clo0 = Math.cos(lo0);
        var slo1 = Math.sin(lo1), clo1 = Math.cos(lo1);

        /* shrink each facet toward its centre so the dark body shows
           through as the seam between mirrors */
        var k = 0.86;
        function px(c, s) { return cx + R * (c * s); }

        var x1 = cla0 * slo0, y1 = -sla0;
        var x2 = cla0 * slo1, y2 = -sla0;
        var x3 = cla1 * slo1, y3 = -sla1;
        var x4 = cla1 * slo0, y4 = -sla1;
        var mx = (x1 + x2 + x3 + x4) / 4, my = (y1 + y2 + y3 + y4) / 4;

        ctx.beginPath();
        ctx.moveTo(cx + R * (mx + (x1 - mx) * k), cy + R * (my + (y1 - my) * k));
        ctx.lineTo(cx + R * (mx + (x2 - mx) * k), cy + R * (my + (y2 - my) * k));
        ctx.lineTo(cx + R * (mx + (x3 - mx) * k), cy + R * (my + (y3 - my) * k));
        ctx.lineTo(cx + R * (mx + (x4 - mx) * k), cy + R * (my + (y4 - my) * k));
        ctx.closePath();

        /* lambert + a tight specular, then the occasional hard glint */
        var diff = nx * LX + ny * LY + nz * LZ;
        if (diff < 0) diff = 0;

        var hz = LZ + 1, hlen = Math.sqrt(LX * LX + LY * LY + hz * hz);
        var spec = (nx * LX + ny * LY + nz * hz) / hlen;
        spec = spec > 0 ? Math.pow(spec, 48) : 0;

        var id = j * b.cols + i;
        var g = Math.sin(t * (0.7 + rnd(id) * 2.4) + rnd(id + 13) * 8);
        var glint = g > 0.965 ? (g - 0.965) / 0.035 : 0;

        /* every facet is a mirror pointed somewhere slightly different,
           so neighbours differ sharply — smooth shading alone reads matte */
        var vary = 0.42 + rnd(id + 7) * 1.16;

        var lum = 0.19 + 1.02 * diff * vary + 1.9 * spec + 1.15 * glint;
        if (lum > 1.75) lum = 1.75;

        /* facets turned away from the key light pick up the room's pink */
        var tint = (1 - diff) * 0.52;
        var r  = SILVER[0] * (1 - tint) + PINK[0] * tint;
        var gg = SILVER[1] * (1 - tint) + PINK[1] * tint;
        var bb = SILVER[2] * (1 - tint) + PINK[2] * tint;

        /* a minority of facets take a colour from the room, kept low so
           it reads as reflected light rather than confetti */
        var rm = rnd(id + 29);
        if (rm > 0.72) {
          var rc = ROOM[id % ROOM.length];
          var m = (rm - 0.72) / 0.28 * 0.32;
          r  = r  * (1 - m) + rc[0] * m;
          gg = gg * (1 - m) + rc[1] * m;
          bb = bb * (1 - m) + rc[2] * m;
        }

        r *= lum; gg *= lum; bb *= lum;

        ctx.fillStyle = 'rgb(' + (r > 255 ? 255 : r | 0) + ',' +
                                 (gg > 255 ? 255 : gg | 0) + ',' +
                                 (bb > 255 ? 255 : bb | 0) + ')';
        ctx.fill();
      }
    }

    /* seat it in the round: darken the limb, lift the lit shoulder */
    var sh = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.36, R * 0.05, cx, cy, R);
    sh.addColorStop(0,    'rgba(255,255,255,.16)');
    sh.addColorStop(0.55, 'rgba(255,255,255,0)');
    sh.addColorStop(0.88, 'rgba(0,0,0,.24)');
    sh.addColorStop(1,    'rgba(0,0,0,.48)');
    ctx.fillStyle = sh;
    ctx.fillRect(0, 0, b.w, b.h);

    ctx.restore();
  }

  /* app.js removes the gate once someone clicks through it; drop any
     ball that has left the page rather than holding the detached node
     and re-testing it forever */
  function prune() {
    for (var i = balls.length - 1; i >= 0; i--) {
      if (!balls[i].el.isConnected) balls.splice(i, 1);
    }
  }

  function visible(b) {
    if (!b.el.isConnected || b.el.offsetParent === null) return false;
    var r = b.el.getBoundingClientRect();
    return r.bottom > -60 && r.top < window.innerHeight + 60;
  }

  function frame(now) {
    if (!running) return;
    var t = now / 1000;
    prune();
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      if (!b.w) { size(b); continue; }
      if (visible(b)) draw(b, t);
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  /* the 24px one in the music button stays CSS — canvas buys nothing there */
  function scan() {
    document.querySelectorAll('.ball:not(.ball--xs):not(.is-rendered)').forEach(attach);
  }

  scan();
  if (reduced) {
    balls.forEach(function (b) { draw(b, 3.1); });
  } else {
    start();
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      balls.forEach(size);
      if (reduced) balls.forEach(function (b) { draw(b, 3.1); });
    }, 150);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  window.MirrorBall = {
    rescan: scan,
    render: function (t) {
      prune();
      balls.forEach(function (b) { if (!b.w) size(b); draw(b, t || 3.1); });
    },
    stop: stop,
    start: start,
    count: function () { return balls.length; }
  };
})();
