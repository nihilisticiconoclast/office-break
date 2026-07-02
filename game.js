'use strict';

/* ==========================================================================
   Office Break — Chat Descent
   An endless runner played inside a Teams-like chat window. Messages spawn
   at the bottom and scroll upward; the player descends by jumping from
   message to message while the boss gives chase from above.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Static data
   -------------------------------------------------------------------------- */

const CHANNELS = [
    { name: 'General', preview: 'You: brb, quick office break', active: true },
    { name: 'Marketing', preview: 'Patricia: new brand deck attached' },
    { name: 'Development', preview: 'Derek: prod is fine. probably.' },
    { name: 'HR Announcements', preview: 'Reminder: mandatory fun Friday' },
    { name: 'Random', preview: 'Tom: sent a GIF' },
    { name: 'Q3 Planning', preview: 'Priya: circling back on the roadmap' }
];

const COLLEAGUES = [
    { name: 'Patricia Hughes',  color: '#c239b3', status: 'online'  },
    { name: 'Derek Okafor',     color: '#0078d4', status: 'online'  },
    { name: 'Sandra Lim',       color: '#038387', status: 'away'    },
    { name: 'Marcus Webb',      color: '#ca5010', status: 'online'  },
    { name: 'Priya Raman',      color: '#8764b8', status: 'busy'    },
    { name: 'Tom Vandenberg',   color: '#498205', status: 'away'    },
    { name: 'Alice Nguyen',     color: '#e3008c', status: 'online'  },
    { name: 'Greg Fitzsimmons', color: '#986f0b', status: 'offline' }
];

const YOU = { name: 'You', color: '#6264a7' };

const CORPORATE_PHRASES = [
    "Let's circle back on this after the standup",
    "We need to leverage our cross-team synergies here",
    "Moving forward, let's align on the deliverables",
    "At the end of the day it's all about the KPIs",
    "This feels like low hanging fruit to me",
    "Quick win: we just boil the ocean a little",
    "Some blue sky thinking before EOD would be great",
    "Let's drill down into the actionable insights",
    "Key takeaway: we lack bandwidth for this",
    "The value proposition needs a paradigm shift",
    "Is this aligned with our core competencies?",
    "We need stakeholder buy-in before we socialize this",
    "Per my last email, this is still blocking me",
    "Can we get a v2 of the deck by EOD?",
    "Let's take this offline and sync later",
    "What's the ETA? I have a hard stop at 3",
    "Can I get a +1 on the proposal?",
    "This is a P0, all hands on deck",
    "I'll ping you after my one-on-one",
    "We should double-click on that in the retro",
    "Let's park that and put a pin in it",
    "Who owns this workstream going forward?",
    "Just looping in leadership for visibility",
    "Great energy in that meeting, team!"
];

const SHORT_REPLIES = [
    '+1', 'lol', 'sounds good', 'on it', 'ack', 'will do 👍', 'thanks!',
    'same tbh', 'brb, coffee', 'any update?', 'bump', 'noted', '^ this',
    'agreed', 'wait what', 'nice', '👀', 'yikes', 'ok ok ok', 'perfect'
];

const GIF_CAPTIONS = [
    'this is fine',
    'me waiting for the deploy',
    'Monday mood',
    'when the meeting could have been an email',
    'teamwork makes the dream work',
    'coffee first',
    'nailed it',
    'happy Friday everyone!!'
];

const CHART_TITLES = [
    'Q3 Revenue Projections.xlsx',
    'Customer Satisfaction Scores',
    'Sprint Velocity — final_v2_FINAL',
    'Market Share Analysis',
    'Resource Allocation FY26',
    'Bug Burndown (do not open)',
    'ROI Model v14'
];

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */

const CONFIG = {
    GRAVITY: 0.55,
    JUMP_VELOCITY: -12.5,
    MOVE_SPEED: 5.2,
    MOVE_ACCEL: 0.9,
    FRICTION: 0.72,

    SCROLL_SPEED_START: 0.75,
    SCROLL_SPEED_MAX: 2.6,
    SCROLL_RAMP: 0.009,          // speed gained per second of survival

    SPAWN_GAP_MIN: 85,           // vertical px scrolled between message spawns
    SPAWN_GAP_MAX: 130,

    SPAWN_DEPTH_BOOST: 0.9,      // up to +90% spawn rate when player is near the bottom
    SPAWN_TIME_SHRINK: 0.0015,   // spawn gaps shrink by this fraction per second
    SPAWN_SHRINK_FLOOR: 0.7,     // ...down to 70% of the base gap

    BOSS_DELAY_MS: 4000,         // grace period before the chase begins
    BOSS_RUN_SPEED: 2.2,         // ground speed at the start...
    BOSS_RUN_MAX: 4.0,           // ...ramping up to this
    BOSS_RAMP: 0.012,
    BOSS_ACCEL: 0.5,
    BOSS_WINDUP: 24,             // frames of raised-arms telegraph before a smash
    BOSS_SMASH_COOLDOWN: 70,     // frames between smashes
    BOSS_CATCHUP_EXTRA: 1.7,     // extra descent speed (over scroll) when off-screen above
    BOSS_STAIRS_FRAMES: 160,     // time out of play after falling off the bottom
    BOSS_SHOUT_MS: 2600,

    POINTS_PER_SECOND: 10
};

/* --------------------------------------------------------------------------
   State
   -------------------------------------------------------------------------- */

const state = {
    canvas: null,
    ctx: null,
    W: 0,
    H: 0,

    running: false,
    gameOver: false,
    startTime: 0,
    lastFrame: 0,
    scrollSpeed: CONFIG.SCROLL_SPEED_START,
    scrolledSinceSpawn: 0,
    nextSpawnGap: 120,
    score: 0,
    best: 0,
    shake: 0,
    gameOverAt: 0,

    keys: {},
    jumpQueued: false,

    player: null,
    boss: null,
    messages: [],
    particles: []
};

/* --------------------------------------------------------------------------
   Boot / DOM setup
   -------------------------------------------------------------------------- */

function initials(name) {
    return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

function buildSidebar() {
    const channelList = document.getElementById('channel-list');
    CHANNELS.forEach(function (ch) {
        const li = document.createElement('li');
        if (ch.active) li.classList.add('active');
        li.innerHTML =
            '<div class="list-avatar" style="background:' + YOU.color + '">' + ch.name[0] + '</div>' +
            '<div class="item-text"><div class="item-name">' + ch.name + '</div>' +
            '<div class="item-preview">' + ch.preview + '</div></div>';
        channelList.appendChild(li);
    });

    const dmList = document.getElementById('dm-list');
    COLLEAGUES.forEach(function (c) {
        const li = document.createElement('li');
        li.innerHTML =
            '<div class="list-avatar round" style="background:' + c.color + '">' + initials(c.name) +
            '<span class="presence ' + c.status + '"></span></div>' +
            '<div class="item-text"><div class="item-name">' + c.name + '</div></div>';
        dmList.appendChild(li);
    });
}

function rotateTypingIndicator() {
    const el = document.getElementById('typing-name');
    setInterval(function () {
        const c = COLLEAGUES[Math.floor(Math.random() * COLLEAGUES.length)];
        el.textContent = c.name;
    }, 4000);
}

function resizeCanvas() {
    const area = document.getElementById('chat-area');
    state.W = state.canvas.width = area.clientWidth;
    state.H = state.canvas.height = area.clientHeight;
}

function boot() {
    state.canvas = document.getElementById('game-canvas');
    state.ctx = state.canvas.getContext('2d');
    state.best = parseInt(localStorage.getItem('office-break-best') || '0', 10);
    document.getElementById('best').textContent = state.best;

    buildSidebar();
    rotateTypingIndicator();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupInput();

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
}

/* --------------------------------------------------------------------------
   Input
   -------------------------------------------------------------------------- */

function setupInput() {
    document.addEventListener('keydown', function (e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].indexOf(e.code) !== -1) {
            e.preventDefault();
        }

        if (!state.running) {
            const startVisible = !document.getElementById('start-overlay').classList.contains('hidden');
            const overVisible = !document.getElementById('game-over').classList.contains('hidden');
            // Brief lockout so mashing jump at the moment of death doesn't
            // instantly restart the run.
            const settled = performance.now() - state.gameOverAt > 600;
            if (startVisible || (overVisible && settled && (e.code === 'Space' || e.code === 'Enter'))) {
                startGame();
            }
            return;
        }

        state.keys[e.code] = true;
        if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !e.repeat) {
            state.jumpQueued = true;
        }
    });

    document.addEventListener('keyup', function (e) {
        state.keys[e.code] = false;
    });
}

/* --------------------------------------------------------------------------
   Game lifecycle
   -------------------------------------------------------------------------- */

function startGame() {
    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');

    state.running = true;
    state.gameOver = false;
    state.startTime = performance.now();
    state.lastFrame = performance.now();
    state.scrollSpeed = CONFIG.SCROLL_SPEED_START;
    state.scrolledSinceSpawn = 0;
    state.nextSpawnGap = randRange(CONFIG.SPAWN_GAP_MIN, CONFIG.SPAWN_GAP_MAX);
    state.score = 0;
    state.shake = 0;
    state.keys = {};
    state.jumpQueued = false;
    state.messages = [];
    state.particles = [];

    state.player = {
        x: state.W / 2 - 14, y: 0,
        w: 28, h: 48,
        vx: 0, vy: 0,
        facing: 1,
        grounded: false,
        platform: null,
        animPhase: 0
    };

    state.boss = {
        x: state.W * 0.15 - 23, y: -10,
        w: 46, h: 76,
        vx: 0, vy: 0,
        grounded: false,
        platform: null,
        mode: 'normal',          // 'normal' | 'catchup' (off-screen above) | 'stairs' (fell off)
        chasing: false,
        runSpeed: CONFIG.BOSS_RUN_SPEED,
        windup: 0,
        stairsTimer: 0,
        smashCooldown: 0,
        smashPose: 0,
        shoutUntil: 0,
        bobPhase: 0
    };

    // Seed the screen with platforms: one right under the player, then a
    // trail of messages descending toward the bottom spawn zone.
    const startY = state.H * 0.55;
    const first = createMessage(startY);
    first.x = clamp(state.W / 2 - first.w / 2, 20, state.W - first.w - 20);
    state.messages.push(first);
    state.player.x = first.x + first.w / 2 - state.player.w / 2;
    state.player.y = first.y - state.player.h;
    state.player.grounded = true;
    state.player.platform = first;

    let y = startY + randRange(CONFIG.SPAWN_GAP_MIN, CONFIG.SPAWN_GAP_MAX);
    while (y < state.H + 60) {
        state.messages.push(createMessage(y));
        y += randRange(CONFIG.SPAWN_GAP_MIN, CONFIG.SPAWN_GAP_MAX);
    }

    requestAnimationFrame(gameLoop);
}

function endGame(reason) {
    state.running = false;
    state.gameOver = true;
    state.gameOverAt = performance.now();
    const final = Math.floor(state.score);
    if (final > state.best) {
        state.best = final;
        localStorage.setItem('office-break-best', String(final));
        document.getElementById('best').textContent = final;
    }
    document.getElementById('game-over-reason').textContent = reason;
    document.getElementById('final-score').textContent = final;
    document.getElementById('game-over').classList.remove('hidden');
}

/* --------------------------------------------------------------------------
   Messages (platforms)
   -------------------------------------------------------------------------- */

function randRange(min, max) {
    return min + Math.random() * (max - min);
}

function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Size classes create the platform variety: short quips are narrow ledges,
// long rambles are wide floors, GIFs are chunky square blocks. Your own
// replies skew short (you're busy escaping).
function pickMessageContent(own) {
    const roll = Math.random();
    if (own) {
        if (roll < 0.55) return { type: 'text', size: 'short', text: pick(SHORT_REPLIES) };
        if (roll < 0.85) return { type: 'text', size: 'medium', text: pick(CORPORATE_PHRASES) };
        return { type: 'gif', size: 'media', text: pick(GIF_CAPTIONS) };
    }
    if (roll < 0.28) return { type: 'text', size: 'short', text: pick(SHORT_REPLIES) };
    if (roll < 0.60) return { type: 'text', size: 'medium', text: pick(CORPORATE_PHRASES) };
    if (roll < 0.78) {
        let text = pick(CORPORATE_PHRASES) + '. ' + pick(CORPORATE_PHRASES);
        if (Math.random() < 0.35) text += '. ' + pick(CORPORATE_PHRASES);
        return { type: 'text', size: 'long', text: text };
    }
    if (roll < 0.90) return { type: 'gif', size: 'media', text: pick(GIF_CAPTIONS) };
    return { type: 'chart', size: 'media', text: pick(CHART_TITLES) };
}

function wrapText(text, maxWidth, font) {
    const ctx = state.ctx;
    ctx.font = font;
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
        const test = line ? line + ' ' + words[i] : words[i];
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function gameClock() {
    // In-game time starts at 9:03 AM and runs fast — roughly ten office
    // minutes per real minute.
    const elapsed = state.running ? (performance.now() - state.startTime) / 1000 : 0;
    let mins = 9 * 60 + 3 + Math.floor(elapsed / 6);
    const h = Math.floor(mins / 60) % 12 || 12;
    const m = mins % 60;
    return h + ':' + (m < 10 ? '0' : '') + m + (mins < 12 * 60 ? ' AM' : ' PM');
}

function createMessage(y) {
    const own = Math.random() < 0.28;
    const sender = own ? YOU : COLLEAGUES[Math.floor(Math.random() * COLLEAGUES.length)];
    const content = pickMessageContent(own);

    const bodyFont = '14px "Segoe UI", sans-serif';
    let maxTextWidth;
    switch (content.size) {
        case 'short':  maxTextWidth = 140; break;
        case 'long':   maxTextWidth = clamp(state.W * 0.42, 260, 440); break;
        default:       maxTextWidth = clamp(state.W * 0.30, 170, 280); break;
    }
    const lines = wrapText(content.text, maxTextWidth, bodyFont);

    let textWidth = 0;
    state.ctx.font = bodyFont;
    lines.forEach(function (l) {
        textWidth = Math.max(textWidth, state.ctx.measureText(l).width);
    });
    // Own messages show only a timestamp, so short replies stay narrow
    state.ctx.font = 'bold 12px "Segoe UI", sans-serif';
    const headerWidth = own
        ? state.ctx.measureText(gameClock()).width
        : state.ctx.measureText(sender.name + '   ' + gameClock()).width;

    const pad = 12;
    const hasMedia = content.type !== 'text';
    // GIFs/images are chunky squares; charts are wider cards
    const mediaW = content.type === 'gif' ? 150 + Math.random() * 60
        : content.type === 'chart' ? 190 : 0;
    const mediaH = content.type === 'gif' ? mediaW * 0.85
        : content.type === 'chart' ? 80 : 0;
    const w = clamp(Math.max(textWidth, headerWidth, mediaW) + pad * 2, 96, state.W * 0.75);
    const h = pad + 16 + lines.length * 18 + (hasMedia ? mediaH + 8 : 0) + pad - 4;

    // Teams-style alignment: your replies hug the right edge, everyone
    // else's hug the left (past the avatar). Width variety is what creates
    // the jumpable levels; a little jitter keeps the columns from being
    // perfectly flush.
    const x = own
        ? clamp(state.W - 24 - w - Math.random() * 70, 64, state.W - 24 - w)
        : 64 + Math.random() * 90;

    return {
        x: x, y: y, w: w, h: h, prevY: y,
        sender: sender,
        own: own,
        type: content.type,
        lines: lines,
        time: gameClock(),
        mediaW: mediaW,
        mediaH: mediaH,
        // Pre-rolled visuals so media doesn't flicker between frames
        gifHue: Math.floor(Math.random() * 360),
        bars: [0.4, 0.75, 0.55, 0.9, 0.65].map(function (b) { return b * (0.6 + Math.random() * 0.5); })
    };
}

function spawnFromBottom() {
    state.messages.push(createMessage(state.H + 12));
}

function smashMessage(index) {
    const m = state.messages[index];
    // Shards of the smashed bubble
    for (let i = 0; i < 14; i++) {
        state.particles.push({
            x: m.x + Math.random() * m.w,
            y: m.y + Math.random() * m.h,
            vx: (Math.random() - 0.5) * 7,
            vy: -Math.random() * 5 - 1,
            size: 3 + Math.random() * 7,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3,
            life: 1,
            color: Math.random() < 0.5 ? '#ffffff' : (m.own ? '#c5cbee' : '#e0e0e0')
        });
    }
    state.messages.splice(index, 1);
    state.shake = 9;
}

/* --------------------------------------------------------------------------
   Update
   -------------------------------------------------------------------------- */

function updateWorld(t, elapsedSec) {
    // Difficulty ramp
    state.scrollSpeed = Math.min(CONFIG.SCROLL_SPEED_MAX,
        CONFIG.SCROLL_SPEED_START + elapsedSec * CONFIG.SCROLL_RAMP);

    // Scroll every message upward
    const scroll = state.scrollSpeed * t;
    for (let i = 0; i < state.messages.length; i++) {
        state.messages[i].prevY = state.messages[i].y;
        state.messages[i].y -= scroll;
    }

    // Spawn new messages from the bottom as distance accumulates. The rate
    // rises the deeper the player pushes (more platforms where they're
    // needed) and the gaps themselves shrink slowly over time.
    const depth = clamp((state.player.y + state.player.h) / state.H, 0, 1);
    const timeShrink = Math.max(CONFIG.SPAWN_SHRINK_FLOOR, 1 - elapsedSec * CONFIG.SPAWN_TIME_SHRINK);
    state.scrolledSinceSpawn += scroll * (1 + depth * CONFIG.SPAWN_DEPTH_BOOST) / timeShrink;
    if (state.scrolledSinceSpawn >= state.nextSpawnGap) {
        state.scrolledSinceSpawn = 0;
        state.nextSpawnGap = randRange(CONFIG.SPAWN_GAP_MIN, CONFIG.SPAWN_GAP_MAX);
        spawnFromBottom();
    }

    // Drop messages that scrolled off the top
    for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].y + state.messages[i].h < -40) {
            state.messages.splice(i, 1);
        }
    }
}

function updatePlayer(t) {
    const p = state.player;
    const prevBottom = p.y + p.h;

    // Horizontal movement
    let ax = 0;
    if (state.keys.ArrowLeft || state.keys.KeyA) ax -= CONFIG.MOVE_ACCEL;
    if (state.keys.ArrowRight || state.keys.KeyD) ax += CONFIG.MOVE_ACCEL;
    if (ax !== 0) {
        p.vx = clamp(p.vx + ax * t, -CONFIG.MOVE_SPEED, CONFIG.MOVE_SPEED);
        p.facing = ax > 0 ? 1 : -1;
    } else {
        p.vx *= Math.pow(CONFIG.FRICTION, t);
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }
    p.x = clamp(p.x + p.vx * t, 0, state.W - p.w);

    // Still standing on the same platform?
    if (p.grounded) {
        const m = p.platform;
        const stillThere = m && state.messages.indexOf(m) !== -1 &&
            p.x + p.w > m.x + 2 && p.x < m.x + m.w - 2;
        if (stillThere) {
            p.y = m.y - p.h;       // ride the platform upward
            p.vy = 0;
        } else {
            p.grounded = false;
            p.platform = null;
        }
    }

    // Jump
    if (state.jumpQueued) {
        state.jumpQueued = false;
        if (p.grounded) {
            p.vy = CONFIG.JUMP_VELOCITY;
            p.grounded = false;
            p.platform = null;
        }
    }

    // Gravity + landing
    if (!p.grounded) {
        p.vy += CONFIG.GRAVITY * t;
        p.y += p.vy * t;

        if (p.vy >= 0) {
            const newBottom = p.y + p.h;
            for (let i = 0; i < state.messages.length; i++) {
                const m = state.messages[i];
                if (p.x + p.w > m.x + 2 && p.x < m.x + m.w - 2 &&
                    prevBottom <= m.prevY + 1 && newBottom >= m.y - 1) {
                    p.y = m.y - p.h;
                    p.vy = 0;
                    p.grounded = true;
                    p.platform = m;
                    break;
                }
            }
        }
    }

    // Run-cycle animation
    if (p.grounded && Math.abs(p.vx) > 0.4) {
        p.animPhase += Math.abs(p.vx) * 0.045 * t;
    } else if (!p.grounded) {
        p.animPhase += 0.06 * t;
    } else {
        p.animPhase = 0;
    }

    // Lose conditions tied to the player
    if (p.y > state.H + 30) {
        endGame('You fell out of the chat.');
    } else if (p.y + p.h < 6) {
        endGame('You got scrolled into the archive.');
    }
}

function updateBoss(t, now, elapsedSec) {
    const b = state.boss;
    const p = state.player;

    b.bobPhase += 0.05 * t;

    if (!b.chasing) {
        if (now - state.startTime > CONFIG.BOSS_DELAY_MS) {
            b.chasing = true;
            b.shoutUntil = now + CONFIG.BOSS_SHOUT_MS;
        }
        return;
    }

    b.runSpeed = Math.min(CONFIG.BOSS_RUN_MAX, CONFIG.BOSS_RUN_SPEED + elapsedSec * CONFIG.BOSS_RAMP);
    if (b.smashCooldown > 0) b.smashCooldown -= t;
    if (b.smashPose > 0) b.smashPose -= t;

    // Fell off the bottom of the chat: he's out of play for a moment, then
    // re-enters from the top and works his way back down.
    if (b.mode === 'stairs') {
        b.stairsTimer -= t;
        if (b.stairsTimer <= 0) {
            b.mode = 'catchup';
            b.y = Math.min(p.y, 0) - state.H * 0.4;
            b.x = clamp(p.x + (Math.random() < 0.5 ? -180 : 180), 0, state.W - b.w);
            b.vx = 0;
            b.vy = 0;
        }
        return;
    }
    if (b.y > state.H + 50) {
        b.mode = 'stairs';
        b.stairsTimer = CONFIG.BOSS_STAIRS_FRAMES;
        b.grounded = false;
        b.platform = null;
        b.windup = 0;
        return;
    }

    // Carried off the top (the scroll took him): rampage back down through
    // the chat toward the player, smashing anything in the way.
    if (b.mode !== 'catchup' && b.y + b.h < -30) {
        b.mode = 'catchup';
        b.grounded = false;
        b.platform = null;
        b.windup = 0;
    }

    if (b.mode === 'catchup') {
        const dx = (p.x + p.w / 2) - (b.x + b.w / 2);
        b.x += clamp(dx * 0.05, -1.6, 1.6) * t;
        b.y += (state.scrollSpeed + CONFIG.BOSS_CATCHUP_EXTRA) * t;
        // Rubber band: never fall more than ~1.2 screens behind, so the
        // threat always comes back eventually.
        b.y = Math.max(b.y, p.y - state.H * 1.2);
        // Smash straight through messages on the way down
        if (b.smashCooldown <= 0) {
            for (let i = 0; i < state.messages.length; i++) {
                const m = state.messages[i];
                if (b.x + b.w > m.x && b.x < m.x + m.w &&
                    b.y + b.h > m.y && b.y < m.y + m.h) {
                    smashMessage(i);
                    b.smashCooldown = 25;
                    b.smashPose = 14;
                    break;
                }
            }
        }
        if (b.y > 30) {
            b.mode = 'normal';
            b.vy = Math.max(b.vy, 1);
        }
        checkBossCatch();
        return;
    }

    /* --- Normal mode: same platform physics as the player --- */

    const prevBottom = b.y + b.h;
    const dx = (p.x + p.w / 2) - (b.x + b.w / 2);

    // Mid-windup he plants his feet and raises his arms — the telegraph —
    // then smashes the platform he's standing on and drops through.
    if (b.windup > 0) {
        b.windup -= t;
        b.vx *= Math.pow(0.6, t);
        if (b.windup <= 0 && b.grounded && b.platform) {
            const idx = state.messages.indexOf(b.platform);
            if (idx !== -1) smashMessage(idx);
            b.grounded = false;
            b.platform = null;
            b.smashCooldown = CONFIG.BOSS_SMASH_COOLDOWN;
            b.smashPose = 16;
        }
    } else {
        const dir = dx > 6 ? 1 : dx < -6 ? -1 : 0;
        // Very little steering in the air — he's a manager, not a missile.
        // A falling boss commits to his line and can be sidestepped.
        const accel = CONFIG.BOSS_ACCEL * (b.grounded ? 1 : 0.22);
        if (dir !== 0) {
            b.vx = clamp(b.vx + dir * accel * t, -b.runSpeed, b.runSpeed);
        } else if (b.grounded) {
            b.vx *= Math.pow(0.8, t);
        }
    }
    b.x = clamp(b.x + b.vx * t, 0, state.W - b.w);

    // Ride the platform he's standing on (the scroll carries him up too)
    if (b.grounded) {
        const m = b.platform;
        const stillThere = m && state.messages.indexOf(m) !== -1 &&
            b.x + b.w > m.x + 2 && b.x < m.x + m.w - 2;
        if (stillThere) {
            b.y = m.y - b.h;
            b.vy = 0;
        } else {
            b.grounded = false;
            b.platform = null;
        }
    }

    if (b.grounded && b.windup <= 0 && b.smashCooldown <= 0) {
        if (p.y > b.y + b.h + 20 && b.platform !== p.platform) {
            // Player is below: smash through the floor to follow
            b.windup = CONFIG.BOSS_WINDUP;
        } else if (p.y + p.h < b.y - 60 && Math.abs(dx) < 220) {
            // Player is above and close: jump after them
            b.vy = CONFIG.JUMP_VELOCITY * 0.95;
            b.grounded = false;
            b.platform = null;
            b.smashCooldown = 30;
        }
    }

    // Gravity + one-way landing, mirroring the player
    if (!b.grounded) {
        b.vy += CONFIG.GRAVITY * t;
        b.y += b.vy * t;
        if (b.vy >= 0) {
            const newBottom = b.y + b.h;
            for (let i = 0; i < state.messages.length; i++) {
                const m = state.messages[i];
                if (b.x + b.w > m.x + 2 && b.x < m.x + m.w - 2 &&
                    prevBottom <= m.prevY + 1 && newBottom >= m.y - 1) {
                    b.y = m.y - b.h;
                    b.vy = 0;
                    b.grounded = true;
                    b.platform = m;
                    break;
                }
            }
        }
    }

    checkBossCatch();
}

function checkBossCatch() {
    const b = state.boss;
    const p = state.player;
    const inset = 8;
    if (p.x + p.w > b.x + inset && p.x < b.x + b.w - inset &&
        p.y + p.h > b.y + inset && p.y < b.y + b.h - inset) {
        endGame('The boss caught you. Back to your desk.');
    }
}

function updateParticles(t) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx * t;
        pt.y += pt.vy * t;
        pt.vy += 0.25 * t;
        pt.rot += pt.vr * t;
        pt.life -= 0.025 * t;
        if (pt.life <= 0) state.particles.splice(i, 1);
    }
}

/* --------------------------------------------------------------------------
   Drawing
   -------------------------------------------------------------------------- */

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawMessage(m) {
    const ctx = state.ctx;
    const pad = 12;

    // Avatar (decorative — the bubble is the platform)
    if (!m.own) {
        ctx.fillStyle = m.sender.color;
        ctx.beginPath();
        ctx.arc(m.x - 22, m.y + 16, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials(m.sender.name), m.x - 22, m.y + 17);
    }

    // Bubble
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.10)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = m.own ? '#e8ebfa' : '#ffffff';
    roundRect(ctx, m.x, m.y, m.w, m.h, 6);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Sender + timestamp (own messages show just the time, like Teams)
    if (m.own) {
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillStyle = '#8a8a8a';
        ctx.fillText(m.time, m.x + pad, m.y + pad + 8);
    } else {
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.fillStyle = '#424242';
        ctx.fillText(m.sender.name, m.x + pad, m.y + pad + 8);
        const nameW = ctx.measureText(m.sender.name).width;
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillStyle = '#8a8a8a';
        ctx.fillText(m.time, m.x + pad + nameW + 8, m.y + pad + 8);
    }

    // Body text
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#242424';
    for (let i = 0; i < m.lines.length; i++) {
        ctx.fillText(m.lines[i], m.x + pad, m.y + pad + 26 + i * 18);
    }

    // Media block
    if (m.type !== 'text') {
        const my = m.y + pad + 16 + m.lines.length * 18 + 4;
        const mw = m.mediaW;

        if (m.type === 'gif') {
            const grad = ctx.createLinearGradient(m.x + pad, my, m.x + pad + mw, my + m.mediaH);
            grad.addColorStop(0, 'hsl(' + m.gifHue + ', 70%, 62%)');
            grad.addColorStop(1, 'hsl(' + ((m.gifHue + 70) % 360) + ', 70%, 48%)');
            roundRect(ctx, m.x + pad, my, mw, m.mediaH, 4);
            ctx.fillStyle = grad;
            ctx.fill();
            // Little sparkle
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = '22px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✦', m.x + pad + mw / 2, my + m.mediaH / 2 + 8);
            ctx.textAlign = 'left';
            // GIF badge
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            roundRect(ctx, m.x + pad + 6, my + m.mediaH - 22, 34, 16, 3);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px "Segoe UI", sans-serif';
            ctx.fillText('GIF', m.x + pad + 14, my + m.mediaH - 10);
        } else {
            // Chart card
            roundRect(ctx, m.x + pad, my, mw, m.mediaH, 4);
            ctx.fillStyle = '#fafafa';
            ctx.fill();
            ctx.strokeStyle = '#e1e1e1';
            ctx.lineWidth = 1;
            ctx.stroke();
            const barW = Math.min(18, (mw - 40) / m.bars.length - 6);
            for (let i = 0; i < m.bars.length; i++) {
                const bh = m.bars[i] * (m.mediaH - 22);
                ctx.fillStyle = i % 2 === 0 ? '#6264a7' : '#9ea2d0';
                ctx.fillRect(m.x + pad + 14 + i * (barW + 6), my + m.mediaH - 8 - bh, barW, bh);
            }
            ctx.fillStyle = '#8a8a8a';
            ctx.font = '9px "Segoe UI", sans-serif';
            ctx.fillText('📊 ' + '▸', m.x + pad + mw - 24, my + 14);
        }
    }
}

function drawPlayer() {
    const ctx = state.ctx;
    const p = state.player;
    const running = p.grounded && Math.abs(p.vx) > 0.4;
    const swing = running ? Math.sin(p.animPhase) : 0;

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y);
    if (p.facing < 0) ctx.scale(-1, 1);

    ctx.lineCap = 'round';

    const skin = '#e8b48f';
    const shirt = '#2d8c6e';
    const pants = '#33445c';

    // Legs (drawn first, behind torso)
    const hipY = 34;
    ctx.strokeStyle = pants;
    ctx.lineWidth = 6;
    if (!p.grounded) {
        // Jump pose: legs split, knees bent
        ctx.beginPath();
        ctx.moveTo(-3, hipY); ctx.lineTo(-9, hipY + 9); ctx.lineTo(-7, hipY + 15);
        ctx.moveTo(3, hipY);  ctx.lineTo(8, hipY + 7);  ctx.lineTo(12, hipY + 13);
        ctx.stroke();
    } else if (running) {
        ctx.beginPath();
        ctx.moveTo(-2, hipY); ctx.lineTo(-2 + swing * 9, hipY + 14);
        ctx.moveTo(2, hipY);  ctx.lineTo(2 - swing * 9, hipY + 14);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(-4, hipY); ctx.lineTo(-4, hipY + 14);
        ctx.moveTo(4, hipY);  ctx.lineTo(4, hipY + 14);
        ctx.stroke();
    }

    // Back arm
    ctx.strokeStyle = shirt;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (!p.grounded) {
        ctx.moveTo(-5, 20); ctx.lineTo(-12, 12);
    } else {
        ctx.moveTo(-5, 19); ctx.lineTo(-5 - swing * 8, 30);
    }
    ctx.stroke();

    // Torso
    ctx.fillStyle = shirt;
    roundRect(ctx, -8, 15, 16, 20, 4);
    ctx.fill();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, 8, 7.5, 0, Math.PI * 2);
    ctx.fill();
    // Hair
    ctx.fillStyle = '#4a3222';
    ctx.beginPath();
    ctx.arc(0, 6.5, 7.5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    // Eye (facing direction)
    ctx.fillStyle = '#242424';
    ctx.beginPath();
    ctx.arc(3.5, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Front arm
    ctx.strokeStyle = shirt;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (!p.grounded) {
        ctx.moveTo(5, 20); ctx.lineTo(13, 11);
    } else {
        ctx.moveTo(5, 19); ctx.lineTo(5 + swing * 8, 30);
    }
    ctx.stroke();

    ctx.restore();
}

function drawBoss(now) {
    const ctx = state.ctx;
    const b = state.boss;
    if (b.mode === 'stairs') return;   // out of play, off the bottom
    const bob = b.grounded ? 0 : Math.sin(b.bobPhase) * 2;
    const angry = b.chasing;
    const armsUp = b.smashPose > 0 || b.windup > 0;

    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + bob);

    ctx.lineCap = 'round';

    const suit = '#2b2b33';
    const skinTone = angry ? '#e89a7e' : '#e8b48f';

    // Legs
    ctx.strokeStyle = '#1e1e24';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-7, 52); ctx.lineTo(-8, 74);
    ctx.moveTo(7, 52);  ctx.lineTo(8, 74);
    ctx.stroke();

    // Arms — raised overhead when smashing, reaching forward when chasing
    ctx.strokeStyle = suit;
    ctx.lineWidth = 8;
    ctx.beginPath();
    if (armsUp) {
        ctx.moveTo(-12, 28); ctx.lineTo(-20, 6);
        ctx.moveTo(12, 28);  ctx.lineTo(20, 6);
    } else if (angry) {
        const reach = Math.sin(b.bobPhase * 2) * 3;
        ctx.moveTo(-12, 28); ctx.lineTo(-22, 40 + reach);
        ctx.moveTo(12, 28);  ctx.lineTo(22, 38 - reach);
    } else {
        // Arms crossed-ish while waiting
        ctx.moveTo(-12, 30); ctx.lineTo(0, 38);
        ctx.moveTo(12, 30);  ctx.lineTo(0, 38);
    }
    ctx.stroke();

    // Fists
    if (armsUp) {
        ctx.fillStyle = skinTone;
        ctx.beginPath();
        ctx.arc(-20, 6, 5, 0, Math.PI * 2);
        ctx.arc(20, 6, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Torso (suit jacket)
    ctx.fillStyle = suit;
    roundRect(ctx, -14, 22, 28, 32, 5);
    ctx.fill();
    // Shirt + tie
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.moveTo(-5, 23); ctx.lineTo(5, 23); ctx.lineTo(0, 36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c4314b';
    ctx.beginPath();
    ctx.moveTo(-2, 24); ctx.lineTo(2, 24); ctx.lineTo(3, 40); ctx.lineTo(0, 44); ctx.lineTo(-3, 40);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(0, 11, 11, 0, Math.PI * 2);
    ctx.fill();
    // Balding gray hair (sides only)
    ctx.fillStyle = '#9a9a9a';
    ctx.beginPath();
    ctx.arc(-8, 8, 4, 0, Math.PI * 2);
    ctx.arc(8, 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(0, 9, 8, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyebrows + eyes
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (angry) {
        ctx.moveTo(-8, 6);  ctx.lineTo(-2, 9);
        ctx.moveTo(8, 6);   ctx.lineTo(2, 9);
    } else {
        ctx.moveTo(-8, 7);  ctx.lineTo(-2, 7);
        ctx.moveTo(8, 7);   ctx.lineTo(2, 7);
    }
    ctx.stroke();
    ctx.fillStyle = '#242424';
    ctx.beginPath();
    ctx.arc(-5, 11, 1.8, 0, Math.PI * 2);
    ctx.arc(5, 11, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Frown
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 20, 4, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Steam of fury
    if (angry) {
        ctx.fillStyle = 'rgba(196, 49, 75, ' + (0.5 + Math.sin(b.bobPhase * 3) * 0.3) + ')';
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💢', -16, -4);
    }

    ctx.restore();

    // Shout bubble when the chase begins
    if (b.chasing && now < b.shoutUntil) {
        const text = 'GET BACK TO WORK!';
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        const tw = ctx.measureText(text).width;
        const bx = clamp(b.x + b.w / 2 - tw / 2 - 10, 6, state.W - tw - 26);
        const by = b.y - 34;
        roundRect(ctx, bx, by, tw + 20, 24, 10);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#c4314b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#c4314b';
        ctx.textAlign = 'left';
        ctx.fillText(text, bx + 10, by + 16);
    }
}

function drawParticles() {
    const ctx = state.ctx;
    for (let i = 0; i < state.particles.length; i++) {
        const pt = state.particles[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#d0d0d0';
        ctx.lineWidth = 0.5;
        ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
        ctx.strokeRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
        ctx.restore();
    }
}

function drawCountdown(now) {
    // Grace-period warning before the boss activates
    const remaining = CONFIG.BOSS_DELAY_MS - (now - state.startTime);
    if (remaining > 0 && !state.boss.chasing) {
        const ctx = state.ctx;
        const text = 'The boss noticed you left… ' + Math.ceil(remaining / 1000);
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        const tw = ctx.measureText(text).width;
        roundRect(ctx, state.W / 2 - tw / 2 - 14, 12, tw + 28, 28, 14);
        ctx.fillStyle = 'rgba(70, 71, 117, 0.92)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(text, state.W / 2, 31);
        ctx.textAlign = 'left';
    }
}

function drawBossIndicator() {
    const b = state.boss;
    if (!b.chasing) return;
    const ctx = state.ctx;

    let text = null;
    let color = '#c4314b';
    let px = state.W / 2;

    if (b.mode === 'stairs') {
        text = 'The boss fell! He’s taking the stairs…';
        color = '#498205';
    } else if (b.y + b.h < 0) {
        const dist = Math.round(-(b.y + b.h));
        text = '▲ Boss · ' + Math.max(1, Math.round(dist / 12)) + 'm behind';
        color = dist > 250 ? '#498205' : '#c4314b';
        px = clamp(b.x + b.w / 2, 90, state.W - 90);
    }
    if (!text) return;

    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    const tw = ctx.measureText(text).width;
    roundRect(ctx, px - tw / 2 - 12, 10, tw + 24, 24, 12);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(text, px, 26);
    ctx.textAlign = 'left';
}

function draw(now) {
    const ctx = state.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, state.W, state.H);

    // Screen shake when the boss smashes something
    if (state.shake > 0) {
        state.shake--;
        ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    }

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-10, -10, state.W + 20, state.H + 20);

    for (let i = 0; i < state.messages.length; i++) {
        drawMessage(state.messages[i]);
    }
    drawParticles();
    drawPlayer();
    drawBoss(now);
    drawCountdown(now);
    drawBossIndicator();
}

/* --------------------------------------------------------------------------
   Main loop
   -------------------------------------------------------------------------- */

function gameLoop(now) {
    if (!state.running) return;

    // Normalize to 60fps units so speed is framerate-independent; cap the
    // step so a background tab doesn't teleport everything on return.
    const t = Math.min(now - state.lastFrame, 50) / 16.667;
    state.lastFrame = now;
    const elapsedSec = (now - state.startTime) / 1000;

    updateWorld(t, elapsedSec);
    updatePlayer(t);
    if (state.running) updateBoss(t, now, elapsedSec);
    updateParticles(t);

    state.score = elapsedSec * CONFIG.POINTS_PER_SECOND;
    document.getElementById('score').textContent = Math.floor(state.score);

    draw(now);

    if (state.running) requestAnimationFrame(gameLoop);
}

window.addEventListener('load', boot);
