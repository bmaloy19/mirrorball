/* ═══════════════════════════════════════════════════════════════════
   disco.js — an original 70's disco groove, synthesized in the browser.

   There are no audio files here and nothing is sampled: every sound is
   built at runtime out of oscillators and filtered noise, so the whole
   soundtrack costs zero bytes of download and carries no licensing.

   Four-on-the-floor kick, open hat on the "and", a funky octave bass,
   clav chanks on the sixteenths, and a string pad over the circle-of-
   fifths vamp disco was built on: Am7 - Dm7 - G7 - Cmaj7.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var BPM       = 116;   // classic disco tempo
  var STEPS     = 16;    // sixteenths per bar
  var BARS      = 4;
  var TOTAL     = STEPS * BARS;
  var LOOKAHEAD = 25;    // ms between scheduler ticks
  var AHEAD     = 0.22;  // seconds of audio scheduled in advance

  /* ── note names → hertz ─────────────────────────────────────── */
  var SEMI = { C:0, 'C#':1, D:2, 'D#':3, E:4, F:5, 'F#':6, G:7, 'G#':8, A:9, 'A#':10, B:11 };
  function midi(name) {
    var m = /^([A-G]#?)(-?\d+)$/.exec(name);
    return SEMI[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  }
  function hz(name, shift) {
    return 440 * Math.pow(2, (midi(name) + (shift || 0) - 69) / 12);
  }

  /* ── the vamp ───────────────────────────────────────────────── */
  var PROG = [
    { bass: 'A1', chord: ['A3', 'C4', 'E4', 'G4'], stab: ['C4', 'G4'] },  // Am7
    { bass: 'D2', chord: ['D3', 'F3', 'A3', 'C4'], stab: ['F3', 'C4'] },  // Dm7
    { bass: 'G1', chord: ['G3', 'B3', 'D4', 'F4'], stab: ['B3', 'F4'] },  // G7
    { bass: 'C2', chord: ['C3', 'E3', 'G3', 'B3'], stab: ['E3', 'B3'] }   // Cmaj7
  ];

  /* bass line, in sixteenths; `up` is semitones above the bar's root */
  var BASS = [
    { s: 0,  up: 0,  d: 0.16 },
    { s: 3,  up: 0,  d: 0.10 },
    { s: 6,  up: 12, d: 0.12 },
    { s: 8,  up: 0,  d: 0.14 },
    { s: 10, up: 0,  d: 0.09 },
    { s: 11, up: 7,  d: 0.09 },
    { s: 14, up: 12, d: 0.14 }
  ];

  var OPEN_HAT = [2, 6, 10, 14];        // the "and" of every beat
  var CHANK    = [2, 3, 6, 7, 10, 11, 14, 15];
  var SPARKLE  = ['E5', 'G5', 'A5', 'C6', 'A5', 'G5'];

  /* ── audio graph ────────────────────────────────────────────── */
  var ctx, master, dry, send, noiseBuf;
  var timer = null, step = 0, nextTime = 0, playing = false;

  function noise() {
    var len = ctx.sampleRate * 2;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function impulse(seconds, decay) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  function build() {
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;

    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -15;
    comp.knee.value = 26;
    comp.ratio.value = 3.6;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;

    dry = ctx.createGain();
    dry.gain.value = 1;

    var verb = ctx.createConvolver();
    verb.buffer = impulse(1.9, 2.6);
    send = ctx.createGain();
    send.gain.value = 0.26;

    dry.connect(master);
    send.connect(verb).connect(master);
    master.connect(comp).connect(ctx.destination);

    noiseBuf = noise();
    return true;
  }

  /* ── voices ─────────────────────────────────────────────────── */
  function env(g, t, peak, attack, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }

  function kick(t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(138, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.10);
    env(g, t, 0.92, 0.004, 0.32);
    o.connect(g).connect(dry);
    o.start(t); o.stop(t + 0.36);
  }

  function hat(t, open) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = 1.6;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7600;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 10800; bp.Q.value = 0.9;
    var g = ctx.createGain();
    var dur = open ? 0.26 : 0.042;
    env(g, t, open ? 0.15 : 0.075, 0.002, dur);
    src.connect(hp).connect(bp).connect(g);
    g.connect(dry);
    if (open) g.connect(send);
    src.start(t); src.stop(t + dur + 0.03);
  }

  function burst(t, peak, dur, freq, q) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = 1.1;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = freq; bp.Q.value = q;
    var g = ctx.createGain();
    env(g, t, peak, 0.002, dur);
    src.connect(bp).connect(g);
    g.connect(dry); g.connect(send);
    src.start(t); src.stop(t + dur + 0.03);
  }

  /* the disco clap: three fast slaps, then a short room tail */
  function clap(t) {
    burst(t,         0.20, 0.026, 1750, 1.0);
    burst(t + 0.011, 0.16, 0.024, 1750, 1.0);
    burst(t + 0.022, 0.13, 0.022, 1750, 1.0);
    burst(t + 0.032, 0.22, 0.155, 1450, 0.7);
  }

  function bass(t, freq, dur) {
    var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq;
    var sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freq / 2;
    var subG = ctx.createGain(); subG.gain.value = 0.42;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 8;
    lp.frequency.setValueAtTime(190, t);
    lp.frequency.exponentialRampToValueAtTime(1650, t + 0.028);
    lp.frequency.exponentialRampToValueAtTime(340, t + dur);
    var g = ctx.createGain();
    env(g, t, 0.46, 0.008, dur + 0.05);
    o.connect(lp); sub.connect(subG).connect(lp);
    lp.connect(g).connect(dry);
    o.start(t);   o.stop(t + dur + 0.09);
    sub.start(t); sub.stop(t + dur + 0.09);
  }

  /* muted clav / guitar chank on the offbeat sixteenths */
  function chank(t, freq) {
    var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = freq * 3.1; bp.Q.value = 3.4;
    var g = ctx.createGain();
    env(g, t, 0.085, 0.003, 0.075);
    o.connect(bp).connect(g);
    g.connect(dry); g.connect(send);
    o.start(t); o.stop(t + 0.11);
  }

  /* lush detuned string pad, one chord per bar */
  function strings(t, freqs, dur) {
    var g = ctx.createGain();
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.value = 2300; lp.Q.value = 0.6;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.055, t + 0.34);
    g.gain.setValueAtTime(0.055, t + dur * 0.62);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(g); g.connect(dry); g.connect(send);
    freqs.forEach(function (f) {
      [-6, 6].forEach(function (cents) {
        var o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = cents;
        o.connect(lp);
        o.start(t); o.stop(t + dur + 0.1);
      });
    });
  }

  function sparkle(t, freq) {
    var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    var g = ctx.createGain();
    env(g, t, 0.075, 0.004, 0.42);
    o.connect(g); g.connect(dry); g.connect(send);
    o.start(t); o.stop(t + 0.46);
  }

  /* ── the sequencer ──────────────────────────────────────────── */
  function play(n, t) {
    var bar  = Math.floor(n / STEPS);
    var s    = n % STEPS;
    var part = PROG[bar];

    if (s % 4 === 0) kick(t);
    if (s === 4 || s === 12) clap(t);

    if (OPEN_HAT.indexOf(s) > -1) hat(t, true);
    else if (s % 2 === 0)         hat(t, false);

    BASS.forEach(function (b) {
      if (b.s === s) bass(t, hz(part.bass, b.up), b.d);
    });

    if (CHANK.indexOf(s) > -1) {
      part.stab.forEach(function (note, i) { chank(t + i * 0.006, hz(note)); });
    }

    if (s === 0) strings(t, part.chord.map(function (nm) { return hz(nm); }), 60 / BPM * 4 * 0.98);

    /* a little bell figure over the last bar of the loop */
    if (bar === 3 && s >= 4 && s % 2 === 0) {
      var i = (s - 4) / 2;
      if (i < SPARKLE.length) sparkle(t, hz(SPARKLE[i]));
    }
  }

  function tick() {
    var stepDur = 60 / BPM / 4;
    while (nextTime < ctx.currentTime + AHEAD) {
      play(step, nextTime);
      nextTime += stepDur;
      step = (step + 1) % TOTAL;
    }
  }

  /* ── public API ─────────────────────────────────────────────── */
  var DiscoGroove = {
    supported: function () {
      return !!(global.AudioContext || global.webkitAudioContext);
    },

    playing: function () { return playing; },

    start: function () {
      if (playing) return;
      if (!ctx && !build()) return;
      if (ctx.state === 'suspended') ctx.resume();

      playing = true;
      step = 0;
      nextTime = ctx.currentTime + 0.08;

      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.1);

      tick();
      timer = setInterval(tick, LOOKAHEAD);
    },

    stop: function () {
      if (!playing || !ctx) return;
      playing = false;
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      clearInterval(timer);
      timer = null;
    },

    toggle: function () {
      if (playing) { this.stop(); return false; }
      this.start(); return true;
    }
  };

  global.DiscoGroove = DiscoGroove;
})(window);
