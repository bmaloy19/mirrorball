# mirrorball

Private one-page invitation site for a surprise birthday party. Static HTML/CSS/JS, no build step, deployed by GitHub Pages from `main` (custom domain in `CNAME`). `README.md` documents every section of the page.

## Privacy (public repo)
- **Never put names, dates or the venue in this file, the README, commit messages or issues.** GitHub indexes public repos; the site itself carries `noindex`. The real details live only in the `CONFIG` block of `assets/js/app.js` and in `index.html`.
- It's a surprise: nothing should make the page discoverable.

## Run
- `./serve.sh [port]` → http://localhost:8000 (uses `tools/preview.py`), or the `.claude/launch.json` preview config "sue60" (port 8123).

## How this project works
- **Client work:** change requests come from the party host and are relayed by Bryce. Treat them as settled. Implement fully, including knock-on changes (palette, assets, README), and flag what they cost rather than arguing taste.
- The invitation is the client's printed artwork used verbatim (`assets/img/invitation.png` + `-800` size). **Don't rebuild the card in HTML/CSS.** The page palette is sampled from that file.
- The envelope opening (`assets/js/envelope.js`, vendored GSAP) was ported from `~/code/SaveTheDate`. Read that project when touching the animation.
- RSVPs are emailed from the form; a "Call instead" button offers the phone number from the printed card.
