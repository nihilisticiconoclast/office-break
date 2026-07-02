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

### Rules

- Messages spawn at the bottom of the chat and scroll upward — standing still
  carries you toward the top. Keep jumping down onto lower messages.
- After a short grace period, the **boss** starts chasing you and smashes any
  message bubble he gets close to, destroying platforms.
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

- **Messages** are the platforms. Each one is a chat bubble with an avatar,
  sender name, timestamp, and one of three content types: corporate-speak
  text, a "GIF" (gradient card with a GIF badge), or an attached chart
  (mini bar chart card). Bubble size derives from its content, so platform
  widths vary naturally.
- **Player** is a small humanoid (head, torso, arms, legs) with a running
  animation on the ground and a tucked pose in the air. Movement uses
  acceleration + friction; jumping uses simple gravity with one-way platform
  collision (you can jump up through bubbles and land on top of them).
  While standing on a bubble you ride it upward with the scroll.
- **Boss** is a larger suited figure with a red tie and angry eyebrows. He
  hovers at the top during the grace period, then homes in on the player,
  smashing nearby messages into particle shards (with a little screen shake).
- **Difficulty** ramps over time: scroll speed and boss speed both increase
  as you survive.

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
