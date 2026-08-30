# mirrorball

A private one-page invitation site for a surprise birthday party.

> **Names, dates and the venue are deliberately kept out of this README.** GitHub
> indexes public repos, so anything written here is searchable in a way the site
> itself is not — the page carries `noindex`. The real details live in the
> `CONFIG` block in [`assets/js/app.js`](assets/js/app.js) and in `index.html`.

The invitation arrives inside an envelope you open. Static — no backend, no
build step, deploys straight from this repo to GitHub Pages.

**Live:** https://bmaloy19.github.io/mirrorball/

- RSVPs are **emailed** from the form; the printed invitation also offers a phone
  number, wired to the **Call instead** button
- **It's a surprise.** Please don't reveal it to the guest of honour.

---

## The page, top to bottom

1. **The envelope.** A stamped, sealed envelope covering the whole screen —
   nothing else is reachable until someone deliberately opens it. Tap to turn it
   over, tap the wax seal, and the invitation rises out and settles into the
   page. It also does the old "Shhhh" gate's job: nobody opens the link beside
   the guest of honour and gets the whole thing on screen. See
   [The envelope](#the-envelope).
2. **The invitation.** The printed card itself, as artwork — see
   [The invitation](#the-invitation). It is the same element that came out of
   the envelope, not a second copy.
3. **Countdown** to 4:00 pm on the 24th.
4. **The Evening.** The run of show as a timeline. The 4:30 surprise is the one
   marker that glows.
5. **RSVP.** See below.
6. **Footer** — the date, venue and the reminder that it's a secret.

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

Subject: `<event> RSVP — Jane Doe (yes)` — or `(regrets)` — with a table:

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
message**, or **Call instead** (the number in `CONFIG`, per the printed
invitation). An
answer is never silently dropped.

---

## The invitation

`assets/img/invitation.png` **is** the printed invitation, not a rendering of
one. The first version rebuilt it in CSS and guessed at the type; the script,
the 60 and SUE KIRKE are set in faces we don't have, so it was never going to be
exact and the client wanted exact.

Two renditions, picked by `srcset`: 1200×1680 (126 KB) and 800×1120 (73 KB),
both resampled from the 1500×2100 original and reduced to a 128-colour palette.
It is nearly all flat colour, so that is visually lossless and about a third
off the file size.

**The words are still in the page.** Artwork carries no text, so `.invite__text`
inside the card repeats them — hidden the way `.sr` is, read out by screen
readers, and the `<h1>` the document needs. If the image ever fails to load,
`app.js` un-hides it and the hero shows a plain framed invitation instead of an
empty box.

The page's palette is **sampled from this file** rather than eyeballed:
`--pink: #da3c8b` and `--pink-soft: #efc7ce` are literally the two colours of
its checkerboard. Everything else is built from those, so the site and the card
are the same pink instead of two that nearly match.

**To swap in a new version of the invitation**, drop the replacement in and
regenerate both sizes; nothing else needs to change unless its proportions do
(the card is laid out at the image's aspect ratio, via the `width`/`height`
attributes).

### The fonts

Now moot for the card, which is why the type left over is so short: **EB
Garamond** sets the whole page, **Great Vibes** the envelope's script, and
**Playfair Display** the two digits on the wax seal. Jost and the other Playfair
weights went with the CSS card.

---

## The envelope

The opening sequence lives in [`assets/js/envelope.js`](assets/js/envelope.js)
and runs on [GSAP](https://gsap.com) (vendored at `assets/js/gsap.min.js`, no
build step, no CDN). It is the same three-beat sequence as the McKenna save-the-
date, re-dressed in this suite's pink:

1. **The stamped front.** Return address, two perforated stamps — a big 60 and
   the card's checkerboard — and a Jefferson postmark. Tap and it turns over.
2. **The back.** Tap the wax seal: it snaps off, the flap swings open to show a
   checkerboard lining, and the card rises out through the mouth *lying on its
   side*, the way a portrait card really sits in a landscape envelope.
3. **The hand-off.** The card stands up, flies to its place in the hero, and the
   page underneath unlocks.

**There is only ever one invitation.** The card starts in `#card-home` in the
hero, is moved into the envelope on load, and is handed back at the end — so the
final flight lands on the real element rather than dissolving a copy into it.
`#card-home` holds the card's height while it is away, which is what lets the
landing box be measured before the card arrives in it.

Both the envelope and the card at rest are laid out at the same `--card-w`
(top of `styles.css`), so the hand-off is a pure transform with nothing to
reflow. The envelope is derived from it — change `--card-w` and both follow.

### If anything goes wrong

The envelope covers the page from the first paint, so the surprise never flashes
up before it lands. That makes it the one piece that could strand a guest, so
there are two ways out:

- **No JavaScript at all** — the overlay is `display:none` until an inline
  `<head>` script adds `.js`, so it never appears. The plain page does.
- **JavaScript, but `envelope.js` didn't run** (404, blocked, an old browser
  that threw) — `envelope.js` sets `.envelope-ready` as soon as it wires itself
  up, and `app.js` loads immediately after and checks for it. Missing means the
  overlay comes straight off, with a console warning.

Nobody ends up on a screen they can't open, which matters because the RSVP is
behind it.

### Reduced motion

With "reduce motion" on, both taps still work but land instantly — no turn, no
flap, no flight.

---

## Run it locally

```bash
./serve.sh
```

Serves the folder and opens http://localhost:8000. `python3` ships with macOS, so
there's nothing to install. Pass a port if 8000 is taken: `./serve.sh 9000`.

It sends `Cache-Control: no-store` ([`tools/preview.py`](tools/preview.py)).
Plain `python3 -m http.server` doesn't, and a browser holding a stale
`styles.css` makes every edit look like it did nothing.

Go through the server rather than double-clicking `index.html` — over `file://`
the browser blocks the fonts.

To check it on your phone on the same wifi: `ipconfig getifaddr en0`, then open
`http://<that-ip>:8000`.

---

## Deploy

Already set up: the repo is https://github.com/bmaloy19/mirrorball and Pages serves
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
assets/css/styles.css   tokens, envelope, checkerboard, layout
assets/js/envelope.js   the three-beat envelope opening
assets/js/gsap.min.js   GSAP 3.13, vendored — drives the envelope
assets/js/app.js        CONFIG + countdown, form, .ics, reveals
assets/fonts/           EB Garamond (page), Great Vibes (envelope script),
                        Playfair Display 900 (the wax seal) — self-hosted woff2
assets/img/             the invitation artwork, favicon + apple touch icon
tools/preview.py        the local server, with caching switched off
serve.sh                local preview
```

The page is set in **EB Garamond** throughout. The invitation used to be the
exception, re-declaring three faces on `.card--invite`; it is artwork now, so
that exception is gone — see [The fonts](#the-fonts).

Design tokens live at the top of `styles.css`. Four worth knowing if you edit:

- **`--card-w` sizes two things.** The card at rest in the hero *and* the card
  inside the envelope, and the envelope is derived from it. That shared width is
  what makes the hand-off a pure transform — don't set either one separately.
- **`--pink` and `--pink-soft` are sampled from the artwork.** Don't nudge them
  by eye — they are what keeps the page and the card the same pink. `--pink-ink`
  exists because white on `--pink` is 4.2:1, a shade under AA for the buttons'
  small caps; solid fills carrying white text use it instead.
- **`.foil` is pink, everywhere.** It used to be silver on the dark page, with
  the cream card overriding it. On blush, silver disappears, so the pink
  gradient is now the only one — and it only ever runs *darker* than `--pink`,
  so the sweep can't dip below contrast mid-animation.
- **`[hidden]{display:none !important}` is load-bearing.** Several components are
  `display:grid`, which would otherwise beat the `hidden` attribute.
- **`.tint` is not decoration, and it belongs to the envelope screen only.**
  Two off-viewport strips that exist so iOS has a solid colour to tint its
  toolbars from — it samples the page edges and skips gradients, so the bars go
  white without them. They sit above the envelope overlay (unlike the McKenna
  original, where nothing covers the edges): at `z-index:0` the bars were white
  on the envelope and pink on every screen after it. But they are also scoped
  to that screen, because on the page they made things worse — `body` sets
  `background-attachment:fixed`, iOS ignores it, so the wash gets sized to the
  whole document and the bottom strip no longer matches anything, reading as a
  bar across the page. The overlay is `position:fixed`, so its wash really is
  viewport-sized and the strips stay invisible. Their colours track the two
  ends of that wash, and the overlay has to keep using it.

---

## Open items

### Waiting on information

| Item | Current state | What it needs |
|---|---|---|
| **Party end time** | The calendar file guesses **11:00 pm** | The actual end time → `CONFIG.endsAt` in `app.js` |
| **Photos of the guest of honour** | None on the page | Pictures. A hero shot or a small gallery would lift this more than anything else on this list |
| **RSVP address** | Pointed at a **test inbox** (`bmaloy19@gmail.com`) and awaiting activation | Click the FormSubmit *"Activate Form"* email, then set `rsvpEmail` to whoever really keeps the list and delete `testInbox` |
| **Who the form names** | The form names `listKeeper` to guests while delivery goes to the test inbox | Keep `listKeeper` and `rsvpEmail` describing the same person. A console warning fires while they disagree |

### Waiting on your eyes

- **The envelope opening.** New this round — worth watching on a phone as well
  as a laptop.
- **How the printed card sits on the page** now that it is the real artwork and
  the palette has been pulled from it.

### Consequences of being live

- **The site is public and carries a personal phone number.** The envelope stops
  an accidental open from spilling the page — nothing shows until someone works
  through two taps — but it's a guessable URL on the open internet. Setting `rsvpEmail` and deleting `hostPhone` / `hostPhoneDisplay`
  removes the number entirely.
- **Keeping it out of Google** is handled by the `noindex` meta tag, and
  `robots.txt` deliberately **allows** crawling so that tag can actually be read.
  Blocking crawlers would be worse: one that can't fetch the page never sees the
  noindex, and Google will still list a bare URL it found linked elsewhere.
- **The repo is a bigger exposure than the site.** Public GitHub repos are
  indexed by Google in a way the site itself is not. The repo name, description
  and this README have all been made anonymous for that reason — keep them that
  way. Anything identifying belongs in the page or in `CONFIG`, not here.
- **The repo is still called `mirrorball`,** which no longer describes anything on
  the page. Renaming it changes the Pages URL, so any link already sent out would
  break — worth doing only before the invitations go out, not after.
- **The repo is public**, which a free GitHub account requires for Pages. Note that
  making it private later would *not* hide the site — Pages sites are public
  regardless of repo visibility.
- **To take it down fast:** `gh api -X DELETE repos/bmaloy19/mirrorball/pages`

### Removed in the second round, at the client's request

- **The music.** `disco.js` synthesized a 70's groove from oscillators at
  runtime. Gone, along with the mirror-ball toggle that governed it.
- **The mirror ball** and its canvas light burst (`ball.js`, `rays.js`). The
  page was dark to make them read; it is light pink now, which is what made the
  retheme a rewrite of the palette rather than a tweak.

Both are in the history if they are ever wanted back:
`git show 231f18b:assets/js/disco.js`.
