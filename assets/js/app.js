/* ═══════════════════════════════════════════════════════════════════
   app.js — Sue is 60
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     EVERYTHING YOU'D WANT TO CHANGE LIVES HERE.
     ───────────────────────────────────────────────────────────── */
  var CONFIG = {
    honoree:  'Sue Kirke',
    startsAt: '2026-10-24T16:00:00-05:00',   // 4:00 pm, Jefferson IA (CDT)
    endsAt:   '2026-10-24T23:00:00-05:00',
    venue:    'Wild Rose Casino & Hotel, Jefferson, Iowa',

    // Who's keeping the guest list.
    host:      'Emily McLaughlin',
    hostFirst: 'Emily',
    hostPhone: '+17123580472',      // "Call instead", per the printed invite
    hostPhoneDisplay: '712.358.0472',

    /* ── Where RSVPs are delivered ────────────────────────────
       Every submission is emailed here. CHANGE THIS to whoever is
       actually keeping the list before the link goes out — it is
       currently pointed at a test inbox.

       Delivery runs through FormSubmit, which needs no account:
       the first submission to a new address sends that address a
       one-time activation link, and real RSVPs arrive after it is
       clicked. If the POST ever fails, the page falls back to
       opening a pre-written email so an answer is never lost.
       ───────────────────────────────────────────────────────── */
    rsvpEmail: 'bmaloy19@gmail.com',

    /* Override to post somewhere else entirely (Formspree, Basin,
       a Google Apps Script). null = build a FormSubmit endpoint
       from rsvpEmail above. */
    formEndpoint: null
  };

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══ toast ═══ */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-up');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-up'); }, 2600);
  }

  /* ═══ the secret gate ═══ */
  (function gate() {
    var el = $('#gate'), btn = $('#gate-btn');
    var KEY = 'sue60-secret-kept';
    var known;
    try { known = localStorage.getItem(KEY) === '1'; } catch (e) { known = false; }

    function open() {
      el.classList.add('is-open');
      document.body.classList.remove('is-locked');
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      setTimeout(function () { el.remove(); }, 800);
    }

    if (known) { el.remove(); return; }
    document.body.classList.add('is-locked');
    btn.addEventListener('click', open);
    setTimeout(function () { btn.focus(); }, 400);
  })();

  /* ═══ sticky top bar ═══ */
  (function topbar() {
    var bar = $('#topbar');
    var onScroll = function () {
      bar.classList.toggle('is-stuck', window.scrollY > window.innerHeight * 0.72);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ═══ scroll reveal ═══ */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (n) { io.observe(n); });
  })();

  /* ═══ countdown ═══ */
  (function countdown() {
    var target = new Date(CONFIG.startsAt).getTime();
    var cells = {
      days:  $('[data-cd=days]'),
      hours: $('[data-cd=hours]'),
      mins:  $('[data-cd=mins]'),
      secs:  $('[data-cd=secs]')
    };
    var sr = $('#cd-sr');
    var lastDays = null;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function tick() {
      var left = target - Date.now();

      if (left <= 0) {
        cells.days.textContent  = '00';
        cells.hours.textContent = '00';
        cells.mins.textContent  = '00';
        cells.secs.textContent  = '00';
        $('#cd-title').textContent = "It's tonight — go, go, go";
        sr.textContent = 'The party has started.';
        clearInterval(iv);
        return;
      }

      var s = Math.floor(left / 1000);
      var d = Math.floor(s / 86400);
      var h = Math.floor(s % 86400 / 3600);
      var m = Math.floor(s % 3600 / 60);

      cells.days.textContent  = String(d);
      cells.hours.textContent = pad(h);
      cells.mins.textContent  = pad(m);
      cells.secs.textContent  = pad(s % 60);

      /* announce only when the day rolls over — a per-second live
         region would talk over everything else on the page */
      if (d !== lastDays) {
        lastDays = d;
        sr.textContent = d + ' days until the party.';
      }
    }

    tick();
    var iv = setInterval(tick, 1000);
  })();

  /* ═══ add to calendar ═══ */
  (function calendar() {
    function stamp(d) {
      return d.getUTCFullYear() +
        pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
      function pad(n) { return n < 10 ? '0' + n : String(n); }
    }
    function esc(t) { return String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }

    $('#ics-btn').addEventListener('click', function () {
      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Sue is 60//Surprise Party//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:sue-kirke-60th-2026-10-24@sueis60.invalid',
        'DTSTAMP:' + stamp(new Date()),
        'DTSTART:' + stamp(new Date(CONFIG.startsAt)),
        'DTEND:'   + stamp(new Date(CONFIG.endsAt)),
        'SUMMARY:' + esc("Sue's Surprise 60th Birthday Party"),
        'LOCATION:' + esc(CONFIG.venue),
        'DESCRIPTION:' + esc(
          'Guest check-in 4:00 pm outside Lucky\'s Sports Grill. Surprise entry 4:30 pm. ' +
          'Concert doors 6:00 pm, Pet Rock (70\'s tribute band) at 7:00 pm. ' +
          'After-party in Lucky\'s. Please do not reveal the event to the guest of honor.'
        ),
        'END:VEVENT',
        'END:VCALENDAR'
      ];

      var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'sue-kirke-60th.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast('Calendar invite downloaded');
    });
  })();

  /* ═══ music ═══ */
  (function music() {
    var btn = $('#music'), label = $('#music-label');
    if (!window.DiscoGroove || !DiscoGroove.supported()) { btn.remove(); return; }

    btn.addEventListener('click', function () {
      var on = DiscoGroove.toggle();
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Stop the music' : "Play 70's music");
      label.textContent = on ? 'Playing' : 'Turn it up';
    });

    /* don't keep the groove running in a tab nobody's looking at */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && DiscoGroove.playing()) {
        DiscoGroove.stop();
        btn.setAttribute('aria-pressed', 'false');
        label.textContent = 'Turn it up';
      }
    });
  })();

  /* ═══ confetti ═══ */
  function confetti() {
    if (reduced) return;
    var wrap = document.createElement('div');
    wrap.className = 'confetti';
    var colors = ['#e22a8b', '#ff3fa4', '#f6c8dd', '#d9dce3', '#ffffff'];
    for (var i = 0; i < 70; i++) {
      var bit = document.createElement('i');
      bit.style.left = (Math.random() * 100) + '%';
      bit.style.background = colors[i % colors.length];
      bit.style.animationDuration = (2.2 + Math.random() * 1.9) + 's';
      bit.style.animationDelay = (Math.random() * 0.6) + 's';
      bit.style.opacity = 0.7 + Math.random() * 0.3;
      wrap.appendChild(bit);
    }
    document.body.appendChild(wrap);
    setTimeout(function () { wrap.remove(); }, 5200);
  }

  /* ═══ RSVP ═══ */
  (function rsvp() {
    var form   = $('#rsvp-form');
    var sent   = $('#sent');
    var posted = $('#posted');
    var party  = $('#party-field');

    $('#rsvp-host').textContent = CONFIG.host;

    /* one place to change the address; the endpoint follows it */
    function endpoint() {
      if (CONFIG.formEndpoint) return CONFIG.formEndpoint;
      if (CONFIG.rsvpEmail) return 'https://formsubmit.co/ajax/' + encodeURIComponent(CONFIG.rsvpEmail);
      return null;
    }

    /* "how many in your party" only matters if they're coming */
    $$('input[name=attending]').forEach(function (r) {
      r.addEventListener('change', function () {
        party.hidden = r.value !== 'yes';
      });
    });

    function fail(field, msg) {
      var wrap = field.closest('.field');
      wrap.classList.add('has-err');
      var err = $('.err', wrap);
      if (err) err.textContent = msg;
    }
    function clearErrors() {
      $$('.field').forEach(function (f) { f.classList.remove('has-err'); });
    }

    function read() {
      var attending = $('input[name=attending]:checked');
      return {
        name:      $('#f-name').value.trim(),
        attending: attending ? attending.value : '',
        party:     $('#f-party').value.trim() || '1',
        contact:   $('#f-contact').value.trim(),
        note:      $('#f-note').value.trim()
      };
    }

    function validate(d) {
      clearErrors();
      var ok = true;
      if (!d.name)      { fail($('#f-name'), 'We need a name for the list.'); ok = false; }
      if (!d.attending) { fail($('input[name=attending]'), 'Let us know either way.'); ok = false; }
      if (!d.contact)   { fail($('#f-contact'), 'A phone or email, so you can be confirmed.'); ok = false; }
      if (!ok) {
        var first = $('.field.has-err input, .field.has-err textarea');
        if (first) first.focus();
      }
      return ok;
    }

    function compose(d) {
      var out = ["RSVP — Sue's 60th, Oct 24"];
      out.push('Name: ' + d.name);
      out.push(d.attending === 'yes'
        ? 'Attending: YES (' + d.party + (d.party === '1' ? ' guest)' : ' guests)')
        : 'Attending: Sorry, cannot make it');
      out.push('Reach me at: ' + d.contact);
      if (d.note) out.push('Note: ' + d.note);
      return out.join('\n');
    }

    function mailtoHref(d, msg) {
      return 'mailto:' + CONFIG.rsvpEmail +
             '?subject=' + encodeURIComponent("Sue's 60th RSVP — " + d.name) +
             '&body=' + encodeURIComponent(msg);
    }

    function showHandoff(d) {
      var msg = compose(d);
      $('#sent-msg').textContent = msg;
      $('#btn-email').href = mailtoHref(d, msg);
      $('#btn-call').href  = 'tel:' + CONFIG.hostPhone;
      form.hidden = true;
      sent.hidden = false;
      sent.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });

      $('#btn-copy').onclick = function () {
        var done = function () { toast('Copied — paste it into an email'); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).then(done, legacyCopy);
        } else { legacyCopy(); }

        function legacyCopy() {
          var ta = document.createElement('textarea');
          ta.value = msg;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); }
          catch (e) { toast('Select the message above to copy it'); }
          ta.remove();
        }
      };
    }

    function post(d, btn) {
      btn.disabled = true;
      btn.textContent = 'Sending…';

      fetch(endpoint(), {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name:      d.name,
          Attending: d.attending === 'yes' ? 'YES' : 'No',
          Guests:    d.attending === 'yes' ? d.party : '0',
          'Reach them at': d.contact,
          Note:      d.note || '—',
          _subject:  "Sue's 60th RSVP — " + d.name +
                     (d.attending === 'yes' ? ' (yes)' : ' (regrets)'),
          _template: 'table',
          _captcha:  'false'
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json().catch(function () { return null; });
      }).then(function (j) {
        /* A 200 is not proof of delivery. FormSubmit answers 200 with
           success:"false" until the destination address has been
           activated, so trusting the status code alone would tell the
           guest they're on the list while the RSVP went nowhere. */
        if (j && typeof j.success !== 'undefined' && String(j.success) !== 'true') {
          throw new Error(j.message || 'not delivered');
        }
        form.hidden = true;
        posted.hidden = false;
        $('#posted-copy').textContent = d.attending === 'yes'
          ? 'Thank you — see you October 24th. Remember: not a word to Sue.'
          : "Thank you for letting us know — you'll be missed.";
        posted.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        if (d.attending === 'yes') confetti();
      }).catch(function () {
        /* couldn't deliver — fall back to opening a pre-written email
           rather than losing the guest's answer */
        toast("Couldn't send automatically — email it instead");
        showHandoff(d);
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'Send my RSVP';
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = read();
      if (!validate(d)) return;

      if (endpoint()) { post(d, $('button[type=submit]', form)); return; }

      showHandoff(d);
      if (d.attending === 'yes') confetti();
    });

    function backToForm() {
      sent.hidden = true;
      posted.hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      $('#f-name').focus();
    }
    $('#btn-edit').addEventListener('click', backToForm);
    $('#btn-edit-2').addEventListener('click', backToForm);
  })();

})();
