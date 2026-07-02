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
| `P` / `Esc` | Pause (also auto-pauses when the window loses focus) |
| `R` | Restart |
| `M` | Mute / unmute |

On touch devices, on-screen buttons appear automatically: ◀ ▶ to move
(bottom-left) and ⬆ to jump (bottom-right).

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
