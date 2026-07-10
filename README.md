# Office Break

A break… from the office.

**Office Break** is a browser-based endless runner played inside a chat app
that looks suspiciously like Microsoft Teams. You've slipped out of a meeting;
the boss has noticed. Descend the endless scroll of corporate messages, ride
the bubbles like platforms, and stay ahead of managerial fury for as long as
you can.

## How to play

Open `index.html` in a browser (no build step, no dependencies) and click
**Start descending**, or serve it locally:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Controls

| Key | Action |
| --- | --- |
| `←` / `→` (or `A` / `D`) | Move left / right |
| `Space` (or `↑` / `W`) | Jump |
| `↓` (or `S`) | Drop through the platform you're standing on |
| `X` (or `Shift`) | Drop a finished report as a boss decoy |
| `P` / `Esc` | Pause (also auto-pauses when the window loses focus) |
| `R` | Restart |
| `M` | Mute / unmute |

On touch devices, on-screen buttons appear automatically: ◀ ▶ ⬇ to move
and drop (bottom-left), ⬆ to jump (bottom-right), and 📄 to deploy a
report when one is ready.

Pick your escapist on the start screen — six avatars, remembered between
sessions.

The start screen offers three difficulties — **Chill**, **Standard**, and
**Crunch** — which scale the scroll speed, the boss's pace, and how fast
both ramp up. Your choice is remembered. After a run you can copy a
shareable score line from the game-over card, and the game honors
`prefers-reduced-motion` (no screen shake or pulsing outlines).

### Leaderboard

Land a top-10 score and you'll get the arcade treatment: enter three
initials (type, use the on-screen ▲▼ arrows, or arrow keys + `Enter`) and
join the **TOP OFFICE ESCAPISTS** board on the game-over card.

Where the scores live depends on how the game is running — the client
auto-detects, in this order:

1. **A live API server** (`LEADERBOARD_URL`, or same-origin `/api/scores`
   when a bundled server hosts the game): shared board with instant,
   friction-free submissions. Two implementations ship in `server/`:
   `main.ts` for **Deno Deploy** (recommended — free, never sleeps, and
   its KV storage is durable, so the board never resets) and `index.js`
   for Node/Render (free tier has an ephemeral disk, so the board resets
   on restarts unless you attach a paid persistent disk).
2. **GitHub-only mode** (no server needed — recommended with GitHub
   Pages): the board is `scores.json` **committed to this repo**, so it
   never resets. Submitting opens a prefilled GitHub issue; the
   `Leaderboard` GitHub Action validates it, commits the entry to
   `scores.json`, and closes the issue (takes about a minute; submitting
   requires a GitHub account). Until it merges, your score shows on the
   board marked ⏳ pending. Configure via `GITHUB_REPO` at the top of
   `game.js` (already set to this repo).
3. **Local fallback** (no server, no network): a this-browser-only board
   in `localStorage`, labeled as such.

#### Deno Deploy (recommended: online, persistent, no friction)

One deployment hosts the game *and* a leaderboard that never resets
(Deno KV is durable storage, and free projects don't sleep):

1. Go to [dash.deno.com](https://dash.deno.com) and sign in with GitHub.
2. **New Project → Import from GitHub** → pick this repo.
3. Set the entrypoint to `server/main.ts` (no framework preset, no build
   step) and deploy.
4. Play at `https://<project>.deno.dev` — that's it. Scores submit
   instantly in-game (no GitHub account needed) and survive restarts and
   redeploys. Pushing to `main` auto-redeploys.

If you'd rather keep playing from GitHub Pages, set `LEADERBOARD_URL` in
`game.js` to your `https://<project>.deno.dev` URL and push.

Run it locally with:
`deno run --allow-net --allow-read --unstable-kv server/main.ts`

#### GitHub-only setup (persistent, free)

Nothing extra to deploy — everything is in the repo:

1. Enable GitHub Pages (Settings → Pages → Deploy from a branch →
   `main` / root). That's it.
2. Play at `https://<your-username>.github.io/office-break/`. Top-10
   scores prompt for initials, then a **"Post score to the global
   board"** button opens the prefilled issue; press *Create* and the bot
   does the rest. The board updates once Pages redeploys (~1 minute).

Notes: GitHub Actions must be allowed on the repo (they are by default),
and since anyone with a GitHub account can open an issue, treat it like
any public arcade board — the Action enforces the format and score caps,
but not honesty. If you also deploy the Render server, the server board
takes precedence on that deployment.

#### Deploying the leaderboard server (Render)

The server is zero-dependency Node (`server/index.js`) and also serves the
game itself, so one free Render service gives you both:

1. In Render: **New → Web Service**, connect this repo (or use **New →
   Blueprint**, which reads `render.yaml`).
2. Settings (already in `render.yaml`): runtime **Node**, build command
   none, start command `npm start`.
3. Deploy. The game is playable at your service URL (e.g.
   `https://office-break.onrender.com`) with a shared leaderboard at
   `/api/scores` — nothing to configure.
4. Optional: if you keep playing from GitHub Pages instead, set
   `LEADERBOARD_URL` in `game.js` to that Render URL and push.

Caveats: on Render's **free** plan the filesystem is ephemeral, so the
board resets when the service redeploys or restarts (free services also
sleep after idle — first request takes ~30s to wake). For a permanent
board, attach a persistent disk mounted at `/data` (paid plans); the
server uses it automatically. The API validates entries (1–3 characters
A–Z/0–9, sane score range) and rate-limits submissions per IP.

### Playing on mobile

The game is a static page, so the easiest way to get it on your phone is
GitHub Pages:

1. On GitHub go to **Settings → Pages**.
2. Under *Build and deployment*, choose **Deploy from a branch**, pick
   `main` and `/ (root)`, and save.
3. After a minute the game is live at
   `https://<your-username>.github.io/office-break/` — open that on your
   phone and play. Add it to your home screen for a full-screen feel.

For a quick local test on the same Wi-Fi instead: run
`python3 -m http.server 8000` in the repo and open
`http://<your-computer's-ip>:8000` on the phone.

### Rules

- Messages spawn at the bottom of the chat and scroll upward — standing still
  carries you toward the top. Keep jumping down onto lower messages.
- After a short grace period, the **boss** drops into the chat. He plays by
  the same rules you do: he runs along message bubbles, rides the scroll,
  jumps, and smashes through the platform under his feet (after a raised-arms
  telegraph) to descend after you. In the air he can barely steer, so a
  falling boss can be sidestepped.
- Outrun him downward and he gets carried off the top — a banner shows how
  far behind he is (that's you winning). He rampages back down through the
  messages, so he's never gone for good. Bait him off the bottom edge and
  he's out of play for a few seconds while he takes the stairs.
- Messages arrive faster the deeper you push and the longer you survive.
- Grab the occasional **☕ coffee** riding a message for six seconds of
  caffeine: faster running, springier jumps, and one mid-air double jump
  (refreshed on every landing while it lasts).
- Collect a **📄 document** and ten seconds later your *report is
  finished* — drop it with `X` and the boss can't resist: he beelines to
  the report and reads it for five seconds while you escape ("TL;DR.").
- Watch for the **project manager**: every now and then Paula Marsh
  rides in on her own message. She can't leave it, but she paces along
  it to follow you — touch her and you're trapped in a "quick sync" for
  a moment, which is a long time with a boss overhead.
- **Hilda Rowe from HR** also patrols her own policy-reminder messages,
  slowly. Touch her while carrying a report and it's confiscated —
  proper channels, please.
- The **intern** scurries across platforms in headphones, dropping
  coffee and documents behind them. Friendly. Wishes you luck.
- The rare **🔕 Do Not Disturb** pickup makes you invisible to
  management for 5 seconds — bosses hunt your last known position and
  the PM loses track of you entirely.
- **Reply-all storms** hit every minute or so: the chat floods with
  tiny one-liner ledges and scrolls faster for six chaotic seconds.
- **Incoming calls** cover part of your view with a ringing call card:
  decline with `C` (or the ✕), let it ring out, or answer it and lose
  2.5 seconds to a meeting that could have been an email.
- The boss **escalates**: tie loosened at 750 points, sleeves rolled up
  at 1,500, and at 2,500 the skip-level manager joins the chase.
- **Combo descent**: chain landings on lower platforms to build a score
  multiplier (up to ×3). Hovering is safe; descending pays.
- **📅 Daily challenge** (start screen): the layout is seeded from
  today's date so everyone plays the identical chat; daily scores are
  tagged on the leaderboard.
- Every run ends with a generated **performance review**, a lo-fi
  synth loop plays while you work, and there are **12 achievements**
  to unlock along the way.
- The game ends when:
  - the boss catches you,
  - you fall off the bottom of the chat, or
  - you get carried off the top (scrolled into the archive).
- Score is awarded for survival time (10 points/second). Your best score is
  saved in `localStorage`.

## Design

### Visual design (Teams-inspired)

The page is laid out like a Teams client, built with plain HTML/CSS:

- **Title bar** — purple app chrome with a fake search box and your avatar.
- **App rail** — Activity / Chat / Teams / Calendar / Calls / Files icons.
- **Sidebar** — pinned channels (General, Marketing, Development, …) and a
  list of colleagues with initial avatars and presence dots, populated from
  data in `game.js`.
- **Chat header** — channel title, tabs, and the live score / best score.
- **Chat area** — a `<canvas>` where the game runs.
- **Composer** — decorative message input with icons, send button, and an
  animated "X is typing…" indicator.

### Game world

Everything inside the chat area is rendered on the canvas each frame:

- **Messages** are the platforms, laid out like a real Teams thread:
  colleagues' messages anchor to the left edge (with avatar, name, and
  timestamp), while *your* replies anchor to the right (tinted purple, time
  only). Content comes in size classes — short quips ("+1", "lol") make
  narrow ledges, single corporate phrases make medium bubbles, multi-phrase
  rambles make wide floors, GIFs are chunky square cards, and charts are
  mid-width attachment cards. The mix of alignment and size is what creates
  the jumpable levels. Two special types spice up the descent:
  - **Urgent messages** (red bar, pulsing outline) scroll ~1.65× faster
    than everything else — they tailgate the message above (never
    overlapping) and carry you up quicker if you stand on them.
  - **Meeting invites** are extra-wide calendar cards with Accept/Decline
    buttons — the most generous platforms in the game and natural bridges
    between the left and right columns.
- **Player** is a small humanoid (head, torso, arms, legs) with a running
  animation on the ground and a tucked pose in the air. Movement uses
  acceleration + friction; jumping uses simple gravity with one-way platform
  collision (you can jump up through bubbles and land on top of them).
  While standing on a bubble you ride it upward with the scroll.
- **Boss** is a larger suited figure with a red tie and angry eyebrows. He
  waits at the top during the grace period, then drops in and chases under
  the same platform physics as the player: gravity, one-way landings, and
  riding the scroll. When you're below him he telegraphs (arms up), smashes
  the bubble he's standing on into particle shards, and falls through after
  you. If the scroll carries him off the top he enters a catch-up rampage
  back down (rubber-banded to ~1.2 screens behind, with an on-screen
  distance badge); if he falls off the bottom he's out of play briefly
  before re-entering from the top.
- **Difficulty** ramps over time: scroll speed and boss speed increase as
  you survive, and message spawn gaps shrink both with elapsed time and
  with how deep the player is holding.
- **Feel & polish**: coyote time and jump buffering, landing squash and
  dust, screen shake on smashes, a danger vignette near the top, synthesized
  sound effects (mutable, no assets), Teams-style milestone toasts every
  250 points, boss one-liners ("DENIED."), run stats on the game-over card,
  and haptic buzz on supported phones. Rendering is high-DPI aware and each
  bubble is cached to an offscreen canvas for smooth mobile performance.

### Code layout

| File | Purpose |
| --- | --- |
| `index.html` | Teams UI shell: title bar, rail, sidebar, chat column, overlays |
| `style.css` | Teams-inspired styling (light theme, `#6264a7` purple) |
| `game.js` | All game logic: data, config, physics, boss AI, canvas rendering |

`game.js` is organized into sections: static data (colleagues, channels,
corporate phrases), configuration constants, DOM setup, input handling,
message/platform factory, per-frame update functions (world scroll, player
physics, boss AI, particles), and canvas drawing. The main loop normalizes
timing to 60 fps units so gameplay speed is framerate-independent.
