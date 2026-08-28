# Sue is 60 — Let's Celebrate

A one-page site for **Sue Kirke's surprise 60th**, with an RSVP form and a 70's
disco soundtrack. Static — no backend, no build step, deploys straight from this
repo to GitHub Pages.

**Live:** https://bmaloy19.github.io/SueIs60/

- **Saturday, October 24, 2026**
- Wild Rose Casino & Hotel — Jefferson, Iowa
- RSVP to Emily McLaughlin · 712.358.0472
- **It's a surprise.** Please don't reveal it to the guest of honor.

---

## The page, top to bottom

1. **The secret gate.** A full-screen "Shhhh…" splash before anything else, so
   nobody opens the link next to Sue and gets the whole thing on screen. Tapping
   *I can keep a secret* remembers the choice (localStorage), so it only appears
   once per browser. It sets the tone; it isn't security.
2. **The invitation.** A near-copy of the printed card — checkerboard frame,
   script headline, the big 60 — under a hanging mirror ball with light rays.
3. **Countdown** to 4:00 pm on the 24th.
4. **The Evening.** The run of show as a timeline. The 4:30 surprise is the one
   marker that glows.
5. **Where.** Wild Rose, the Lucky's check-in note, a Maps link, and a nudge to
   book a room.
6. **RSVP.** See below.
7. **Footer** crediting White Willow Events.

---

## How the RSVP actually works

The printed invitation says to **call or text Emily**, so by default the form does
exactly that — it just does the typing for you. Guests fill in name, yes/no, party
size, contact and notes; on submit the page composes the message and hands off to
**Text it** (a pre-filled SMS), **Copy message**, or **Call instead**.

That means it works the moment it's deployed, with no accounts and no service to
sign up for. The trade-off: **nothing is stored on the site.** Emily's phone is
still the guest list.

### Collecting RSVPs online instead

If you'd rather they land in an inbox or a dashboard, open
[`assets/js/app.js`](assets/js/app.js) and set one value at the top:

```js
formEndpoint: 'https://formspree.io/f/xxxxxxx'
```

The form then POSTs there as JSON and shows a "You're on the list" confirmation.
Nothing else needs to change, and if the request fails it falls back to the text
handoff so an answer is never lost. Any endpoint that accepts a JSON POST works —
Formspree, Basin, a Google Apps Script web app.

Everything else worth editing is in that same `CONFIG` block: names, phone, dates,
venue.

---

## The background

The mirror-ball light burst behind the page is drawn in canvas
([`assets/js/rays.js`](assets/js/rays.js)) — spokes of coloured facet-light
thrown outward from the ball, drawn additively so they bloom where they cross.
It's an original rendering, about 4KB, and it loops forever.

This started from a 10-hour 4K "spinning disco ball" video on YouTube. Three
reasons it isn't that video:

- **Downloading it isn't ours to do.** It's someone else's copyrighted work, and
  republishing it here would be redistributing it. (10 hours of 4K also blows
  past Pages' 100MB per-file cap.)
- **Embedding it is legal but bad here.** iOS routinely refuses inline autoplay,
  you inherit YouTube branding and end-cards, it streams 4K behind the text, and
  the page breaks the day that channel takes the video down.
- **Canvas wins on every practical axis** — no network, no licensing, seamless
  loop, works on any phone, and the intensity is tunable so the invitation stays
  readable.

If you ever do want real footage, the legal route is a free-licensed loop from
Pexels or Pixabay (both allow commercial use), self-hosted as a short seamless
clip — not a YouTube rip.

### Tuning it

The beams run at full strength over the invitation and fade to 14% as you scroll,
so the text sections aren't fighting a strobing background. Everything is dialable
from the `CFG` block at the top of `rays.js` — `intensity`, `spokes`, `segments`,
`spin`. The origin is measured from the ball element itself each layout, so it
stays locked to it at every screen size.

From the browser console, live:

```js
Beams.set('intensity', 1.4)   // brighter
Beams.set('spokes', 80)       // denser
Beams.stop()                  // kill it
```

It renders one still frame and stops if the visitor has "reduce motion" on, and
pauses entirely when the tab is in the background.

## The music

`assets/js/disco.js` is a small disco engine, not an audio file. Every sound —
four-on-the-floor kick, the open hat on the "and", the octave bassline, clav
chanks, string pad, clap — is built at runtime from oscillators and filtered
noise over an Am7–Dm7–G7–Cmaj7 vamp at 116 BPM.

It's an original loop, so there's **no licensing question and nothing to
download**. It never autoplays (browsers block that anyway) — it's behind the
mirror-ball button in the corner, and it stops when the tab goes to the
background.

If you want actual 70's records instead, that needs a licensed embed (a Spotify
or Apple Music playlist iframe); dropping MP3s of real songs into the repo would
not be legal to publish.

---

## Run it locally

```bash
./serve.sh
```

Serves the folder and opens http://localhost:8000. `python3` ships with macOS, so
there's nothing to install. Pass a port if 8000 is taken: `./serve.sh 9000`.

Go through the server rather than double-clicking `index.html` — over `file://`
the browser blocks the fonts.

To check it on your phone on the same wifi: `ipconfig getifaddr en0`, then open
`http://<that-ip>:8000`.

---

## Deploy

Already set up: the repo is https://github.com/bmaloy19/SueIs60 and Pages serves
`main` from the root. No Action needed — it's plain files, so **every push to
`main` redeploys**, usually within a minute.

```bash
git push
```

### About the link being public

GitHub Pages sites are public URLs — anyone with the link can open it. Two things
lean against that mattering:

- `robots.txt` and a `noindex` meta tag keep it out of search results, so it
  shouldn't surface by searching Sue's name.
- The secret gate means an accidental open doesn't spill the whole page.

It's still an unlisted public page with **Emily's phone number on it**. If that's
a concern, the fix is to switch to a `formEndpoint` (above) and delete
`hostPhone` / `hostPhoneDisplay` from the config — the form stops needing it.

---

## Structure

```
index.html              markup, all content
assets/css/styles.css   tokens, disco ball, checkerboard, layout
assets/js/app.js        CONFIG + gate, countdown, form, .ics, music toggle
assets/js/rays.js       the canvas mirror-ball light burst
assets/js/disco.js      the synthesized 70's groove
assets/fonts/           Playfair Display, Great Vibes, Jost (self-hosted woff2)
assets/img/             favicon + apple touch icon
serve.sh                local preview
```

Design tokens live at the top of `styles.css`. Two rules worth knowing if you edit:
the cream invitation card overrides `.foil` to a **pink** gradient (silver foil
disappears on white), and `[hidden]{display:none !important}` is load-bearing —
several components are `display:grid`, which would otherwise beat the `hidden`
attribute.

---

## Known gaps

- **The street address is not on the page.** It links to a Maps *search* for
  "Wild Rose Casino & Hotel Jefferson Iowa" rather than assert an address that
  might be wrong. Worth pasting the real one in.
- **The end time on the calendar file is a guess** (11:00 pm). Fix `endsAt` in
  `CONFIG` if the room is booked to a specific hour.
- **No photos of Sue.** A hero photo or a small gallery would lift it a lot —
  needs pictures.
- **The background is a stylisation, not a copy** of the reference video — same
  idea (ball plus radiating facet-light), rendered rather than filmed. Say if you
  want it busier, slower, or in different colours.
- **The music hasn't been heard on real speakers yet** — it was verified to build
  and run without errors, and the pitches check out, but give it a listen and say
  if you want it funkier, slower, or quieter.
