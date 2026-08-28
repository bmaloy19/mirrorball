# Sue is 60 — Let's Celebrate

A one-page site for **Sue Kirke's surprise 60th**, with an RSVP form and a 70's
disco soundtrack. Static — no backend, no build step, deploys straight from this
repo to GitHub Pages.

**Live:** https://bmaloy19.github.io/SueIs60/

- **Saturday, October 24, 2026**
- Wild Rose Casino & Hotel — Jefferson, Iowa
- RSVPs are **emailed** from the form; the printed invitation also says to call or text Emily McLaughlin · 712.358.0472
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

## How the RSVP works right now

**Submissions are emailed.** The guest fills in the form, hits send, and the RSVP
arrives as an email — no app to open, nothing for them to remember to do.

### What the guest does

1. Fills in the form: **name**, **yes/no**, **party size** (only appears if they
   said yes), **phone or email**, and an optional note.
2. Hits **Send my RSVP**.
3. Gets a *"You're on the list"* confirmation (and confetti, if they're coming).

That's it. Delivery is automatic.

### What lands in the inbox

Subject: `Sue's 60th RSVP — Jane Doe (yes)` — or `(regrets)` — with a table:

| Field | |
|---|---|
| Name | Jane Doe |
| Attending | YES |
| Guests | 2 |
| Reach them at | 515-555-0100 |
| Note | Bringing a gluten-free guest. |

### How delivery works

Posts through **FormSubmit**, which needs no account. Set one value in
[`assets/js/app.js`](assets/js/app.js):

```js
rsvpEmail: 'bmaloy19@gmail.com',
```

**A new address must be activated once.** The first submission to it makes
FormSubmit email that address an *"Activate Form"* link; real RSVPs only start
arriving after someone clicks it. Until then the page correctly refuses to claim
success — see below.

To post somewhere else instead (Formspree, Basin, a Google Apps Script bound to a
Sheet), set `formEndpoint` and `rsvpEmail` is ignored for delivery.

### If delivery fails

The page never tells a guest they're on the list unless the RSVP actually went
through. FormSubmit answers **HTTP 200 with `success:"false"`** for an
unactivated address, so a plain status-code check would confirm an RSVP that
went nowhere; the code checks the response body, not just the status.

On any failure — no network, unactivated address, provider error — it falls back
to the old handoff panel: **Email it** (opens a pre-written email), **Copy
message**, or **Call instead** (`712.358.0472`, per the printed invitation). An
answer is never silently dropped.

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

The site is a public URL and carries a phone number — see
[Open items](#open-items) for what that means and how to change it.

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

## Open items

### Waiting on information

| Item | Current state | What it needs |
|---|---|---|
| **Street address** | Links to a Maps *search* for "Wild Rose Casino & Hotel Jefferson Iowa" | The real street address, pasted into the Where card in `index.html` |
| **Party end time** | The calendar file guesses **11:00 pm** | The actual end time → `CONFIG.endsAt` in `app.js` |
| **Photos of Sue** | None on the page | Pictures. A hero shot or a small gallery would lift this more than anything else on this list |
| **RSVP address** | Pointed at a **test inbox** (`bmaloy19@gmail.com`) and awaiting activation | Click the FormSubmit *"Activate Form"* email, then change `rsvpEmail` to whoever really keeps the list before the link goes out |

### Waiting on your eyes

- ~~The music~~ — **approved, no changes wanted.**
- **How the background reads in motion.** Everything static about it is verified:
  the beams originate exactly on the ball at every screen size, the colours and
  brightness are right, and a single frame stands on its own. What is *not*
  verified is the animation — whether the rotation reads as a gentle turn, is too
  slow to notice, or pulls focus from the text. The preview pane reports the tab
  as hidden, which stops `requestAnimationFrame`, so frames had to be drawn by
  hand to screenshot. Currently `0.027` rad/s, about four minutes per revolution.
  `Beams.set('spin', 0.04)` in the browser console tries a faster setting live.

### Consequences of being live

- **The site is public and carries Emily's phone number.** `noindex` plus
  `robots.txt` keep it out of search results, and the "Shhhh" gate stops an
  accidental open from spilling the page — but it's a guessable URL on the open
  internet. Setting a `formEndpoint` and deleting `hostPhone` / `hostPhoneDisplay`
  removes the number entirely.
- **The repo is public**, which a free GitHub account requires for Pages. Note that
  making it private later would *not* hide the site — Pages sites are public
  regardless of repo visibility.
- **To take it down fast:** `gh api -X DELETE repos/bmaloy19/SueIs60/pages`

### Deliberately not done

- **Real 70's records.** The soundtrack is synthesized precisely so nothing
  copyrighted ships here. Actual songs would need a licensed Spotify or Apple Music
  embed — see [The music](#the-music).
- **The reference video as a background.** Rebuilt in canvas rather than
  downloaded, for the reasons in [The background](#the-background).
