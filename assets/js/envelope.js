/* ============================================================
   envelope.js — Sue is 60

   The invitation arrives the way a paper one does. Three beats:

     1. the stamped front — tap turns the envelope over
     2. the back          — tap breaks the seal, the flap opens and the
                            card rises out lying on its side
     3. the hand-off      — the card stands up, flies to its place in the
                            hero and the page underneath is unlocked

   The card in the envelope IS the hero card: it starts in #card-home,
   is moved into the envelope on load, and is handed back at the end.
   Nothing is duplicated, so there is only ever one invitation on the page.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var opener   = $('opener');
  var scene    = $('scene');
  var flipper  = $('flipper');
  var faceFront= $('faceFront');
  var envelope = $('envelope');
  var flap     = $('flap');
  var lining   = document.querySelector('.env__lining');
  var seal     = $('seal');
  var cue      = $('cue');
  var cardSlot = $('cardSlot');
  var cardHome = $('card-home');
  var card     = $('card');

  if (!opener || !card || !cardHome || !cardSlot) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch   = window.matchMedia('(hover: none)').matches;
  var VERB    = touch ? 'Tap' : 'Click';

  var state = 'front';        // front -> flipping -> back -> opening -> done
  var flapBehind  = false;
  var showingBack = false;
  var seatScale   = 1;

  /* ── the card moves into the envelope ─────────────────────
     #card-home keeps the card's height while it is away, so the hero
     underneath is laid out correctly and the landing box can be measured
     before the card is handed back to it. */
  document.documentElement.classList.add('envelope-ready');   // reveals .opener
  cardSlot.appendChild(card);
  document.body.classList.add('is-locked');
  window.scrollTo(0, 0);

  cue.textContent = VERB + ' to turn it over';

  /* ══ beat 1 — turn the envelope over ══ */

  function flipOver() {
    if (state !== 'front') return;
    state = 'flipping';
    setCue(VERB + ' the seal to open');

    if (reduced || !window.gsap) { settleFlip(); return; }

    gsap.timeline({ onComplete: settleFlip })
      .to(flipper, {
        rotateY: 180,
        duration: 1.05,
        ease: 'power2.inOut',
        onUpdate: function () {
          // past vertical the front is facing away, so the back takes over.
          // backface-visibility can't be relied on to do this — a face with a
          // composited child stops being culled — so the swap is written out.
          var back = gsap.getProperty(flipper, 'rotateY') >= 90;
          if (back !== showingBack) {
            showingBack = back;
            flipper.classList.toggle('show-back', back);
          }
        }
      }, 0)
      // a touch of lift makes the turn feel like a hand doing it
      .to(flipper, { scale: 1.045, duration: 0.5,  ease: 'power2.out' }, 0)
      .to(flipper, { scale: 1,     duration: 0.55, ease: 'power2.in'  }, 0.5);
  }

  /* Drop out of 3D once the turn is finished. The back face carries its own
     rotateY(180); combined with the flipper's 180 that is a full turn, so
     zeroing both together leaves the geometry identical while handing the
     flap back a plain 2D context with ordinary z-index stacking. */
  function settleFlip() {
    if (window.gsap) gsap.set(flipper, { clearProps: 'transform' });
    showingBack = true;
    flipper.classList.add('show-back', 'is-flat');
    faceFront.style.display = 'none';
    state = 'back';
    seatCard();
  }

  /* ══ beat 2 — break the seal, open, draw the card up and out ══ */

  function openEnvelope() {
    if (state !== 'back') return;
    state = 'opening';
    seal.setAttribute('disabled', '');
    // a running CSS animation outranks inline styles, so the keyframes have
    // to be switched off before GSAP can fade the cue
    cue.style.animation = 'none';

    if (reduced || !window.gsap) { finish(true); return; }

    /* How far the card is drawn up out of the mouth. 64% of the envelope reads
       best, but on a short window that pushes the top of the card off screen —
       lying on its side its vertical extent is its WIDTH — so it is capped at
       whatever headroom there actually is. */
    var env  = envelope.getBoundingClientRect();
    var half = (card.offsetWidth * seatScale) / 2;
    var rise = Math.min(
      envelope.offsetHeight * 0.64,
      Math.max(0, env.top + env.height / 2 - half - 14)
    );

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: function () { finish(false); } })
      .to(cue, { opacity: 0, y: 6, duration: 0.3 }, 0)
      .to(seal, { scale: 0.68, opacity: 0, rotation: -16, duration: 0.45, ease: 'power2.in' }, 0)

      // the script is printed on the flap; it would read mirrored once the
      // flap swings past vertical, so it goes before that happens
      .to('.env__script', { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.2)
      .set(lining, { opacity: 1 }, 0.2)
      .to(flap, {
        rotateX: -180,
        duration: 0.95,
        ease: 'power2.inOut',
        onUpdate: function () {
          // once past vertical the flap belongs behind the envelope; only
          // write on the actual crossing, not every tick
          var behind = gsap.getProperty(flap, 'rotateX') < -90;
          if (behind !== flapBehind) {
            flapBehind = behind;
            flap.style.zIndex = behind ? '0' : '8';
          }
        }
      }, 0.2)

      // …and the card rises out through the mouth the flap just opened. It
      // stays lying on its side the whole way and only stands up once it has
      // cleared the envelope, during the settle.
      .to(cardSlot, { y: -rise, duration: 0.9, ease: 'power2.out' }, 0.95);
  }

  /* The card lies on its side inside the landscape envelope, exactly as a
     portrait card really sits in one. Rotated 90deg its HEIGHT spans the
     envelope's width and its WIDTH spans the height, so it has to be fitted
     against both axes. It stands upright again during the final settle. */
  function seatCard() {
    // hold the hero's shape open while the card is inside the envelope
    cardHome.style.height = card.offsetHeight + 'px';
    if (!window.gsap || state === 'done' || state === 'opening') return;
    seatScale = Math.min(
      0.9,
      (envelope.offsetWidth  * 0.86) / card.offsetHeight,
      (envelope.offsetHeight * 0.82) / card.offsetWidth
    );
    gsap.set(cardSlot, {
      xPercent: -50, yPercent: -50,
      x: 0, y: 0,
      rotation: 90,
      scale: seatScale,
      transformOrigin: '50% 50%'
    });
  }

  /* ══ beat 3 — hand the card off to the page ══
     The card is lifted out of the envelope into the overlay itself (so it
     stops being stacked under the envelope's front panel), flown to the box
     #card-home is holding open for it, and only then dropped into the page.
     Measuring the landing box first and animating in viewport coordinates
     avoids re-parenting mid-flight. */

  function land() {
    cardHome.appendChild(card);
    cardHome.style.height = '';
    cardSlot.remove();
    if (window.gsap) gsap.set(card, { clearProps: 'transform' });
    opener.classList.add('is-gone');
    document.body.classList.remove('is-locked');
    state = 'done';
    document.documentElement.classList.add('is-opened');
    window.dispatchEvent(new CustomEvent('invite:open'));
  }

  function finish(instant) {
    var last = cardHome.getBoundingClientRect();

    if (instant || !window.gsap) { land(); return; }

    // where the card is right now, in viewport coordinates
    var env  = envelope.getBoundingClientRect();
    var curY = gsap.getProperty(cardSlot, 'y') || 0;
    var fromX = env.left + env.width  / 2;
    var fromY = env.top  + env.height / 2 + curY;

    opener.appendChild(cardSlot);
    cardSlot.classList.add('is-out');
    gsap.set(cardSlot, {
      xPercent: -50, yPercent: -50,
      x: fromX, y: fromY,
      rotation: 90, scale: seatScale,
      transformOrigin: '50% 50%'
    });

    gsap.timeline({ onComplete: land })
      .to(scene, {
        opacity: 0, y: 26, scale: 0.94, duration: 0.5, ease: 'power2.in',
        onComplete: function () { scene.style.display = 'none'; }
      }, 0)
      .to(cardSlot, {
        x: last.left + last.width  / 2,
        y: last.top  + last.height / 2,
        rotation: 0, scale: 1,
        duration: 1.05,
        ease: 'power3.inOut'
      }, 0)
      // the blush ground of the overlay fades into the page's own
      .to(opener, { opacity: 0, duration: 0.45, ease: 'power2.in' }, 0.6);
  }

  /* ── wiring ── */

  seatCard();
  window.addEventListener('resize', seatCard);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(seatCard);

  /* The card is an image with width/height set, so its box is known before the
     bytes land — but if the image fails, app.js swaps in the text version and
     the card changes height. Re-seat on either outcome. */
  var img = $('invite-img');
  if (img && !img.complete) {
    img.addEventListener('load',  seatCard);
    img.addEventListener('error', function () { setTimeout(seatCard, 0); });
  }

  flipper.addEventListener('click', function (e) {
    if (state === 'front') { flipOver(); return; }
    if (state === 'back' && !e.target.closest('.card')) openEnvelope();
  });
  seal.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'back') openEnvelope();
  });

  function setCue(text) {
    if (!window.gsap || reduced) { cue.textContent = text; return; }
    gsap.to(cue, {
      opacity: 0, duration: 0.25,
      onComplete: function () {
        cue.textContent = text;
        gsap.to(cue, { opacity: 0.85, duration: 0.3 });
      }
    });
  }

})();
