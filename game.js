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

    BOSS_DELAY_MS: 4000,         // grace period before the chase begins
    BOSS_SPEED: 1.35,
    BOSS_SPEED_MAX: 2.7,
    BOSS_RAMP: 0.008,
    BOSS_SMASH_RANGE: 120,
    BOSS_SMASH_COOLDOWN: 75,     // frames
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
    lastSpawnCX: 0,
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
        chasing: false,
        speed: CONFIG.BOSS_SPEED,
        smashCooldown: 0,
        smashPose: 0,
        shoutUntil: 0,
        bobPhase: 0
    };

    // Seed the screen with platforms: one right under the player, then a
    // trail of messages descending toward the bottom spawn zone.
    state.lastSpawnCX = state.W / 2;
    const startY = state.H * 0.55;
    const first = createMessage(startY);
    first.x = clamp(state.W / 2 - first.w / 2, 20, state.W - first.w - 20);
    state.lastSpawnCX = first.x + first.w / 2;
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

function pickMessageContent() {
    const roll = Math.random();
    if (roll < 0.6) {
        return { type: 'text', text: CORPORATE_PHRASES[Math.floor(Math.random() * CORPORATE_PHRASES.length)] };
    }
    if (roll < 0.8) {
        return { type: 'gif', text: GIF_CAPTIONS[Math.floor(Math.random() * GIF_CAPTIONS.length)] };
    }
    return { type: 'chart', text: CHART_TITLES[Math.floor(Math.random() * CHART_TITLES.length)] };
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
    const own = Math.random() < 0.18;
    const sender = own ? YOU : COLLEAGUES[Math.floor(Math.random() * COLLEAGUES.length)];
    const content = pickMessageContent();

    const bodyFont = '14px "Segoe UI", sans-serif';
    const maxTextWidth = clamp(state.W * 0.35, 170, 300);
    const lines = wrapText(content.text, maxTextWidth, bodyFont);

    let textWidth = 0;
    state.ctx.font = bodyFont;
    lines.forEach(function (l) {
        textWidth = Math.max(textWidth, state.ctx.measureText(l).width);
    });
    state.ctx.font = 'bold 12px "Segoe UI", sans-serif';
    const headerWidth = state.ctx.measureText(sender.name + '   ' + gameClock()).width;

    const pad = 12;
    const hasMedia = content.type !== 'text';
    const mediaH = hasMedia ? 64 : 0;
    const w = clamp(Math.max(textWidth, headerWidth, hasMedia ? 190 : 0) + pad * 2, 150, state.W * 0.55);
    const h = pad + 16 + lines.length * 18 + (hasMedia ? mediaH + 8 : 0) + pad - 4;

    // Horizontal placement wanders relative to the previous spawn so each
    // message stays reachable from the one above it (max jump reach while
    // falling one gap is ~280px of steering). Leave room for the avatar on
    // the left and a margin on the right.
    const minX = 64;
    const maxX = Math.max(minX + 1, state.W - w - 24);
    const cx = clamp(state.lastSpawnCX + randRange(-270, 270),
        minX + w / 2, maxX + w / 2);
    const x = clamp(cx - w / 2, minX, maxX);
    state.lastSpawnCX = x + w / 2;

    return {
        x: x, y: y, w: w, h: h, prevY: y,
        sender: sender,
        own: own,
        type: content.type,
        lines: lines,
        time: gameClock(),
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

    // Spawn new messages from the bottom as distance accumulates
    state.scrolledSinceSpawn += scroll;
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

    b.speed = Math.min(CONFIG.BOSS_SPEED_MAX, CONFIG.BOSS_SPEED + elapsedSec * CONFIG.BOSS_RAMP);

    // Home in on the player. The boss ignores gravity and scrolling — he
    // floats down through the chat with pure managerial fury.
    const dx = (p.x + p.w / 2) - (b.x + b.w / 2);
    const dy = (p.y + p.h / 2) - (b.y + b.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    b.x += (dx / dist) * b.speed * t;
    b.y += (dy / dist) * b.speed * 0.85 * t;

    // Smash the nearest message within reach
    if (b.smashCooldown > 0) b.smashCooldown -= t;
    if (b.smashPose > 0) b.smashPose -= t;

    if (b.smashCooldown <= 0) {
        const bx = b.x + b.w / 2;
        const by = b.y + b.h / 2;
        let bestIdx = -1;
        let bestDist = CONFIG.BOSS_SMASH_RANGE;
        for (let i = 0; i < state.messages.length; i++) {
            const m = state.messages[i];
            const mx = clamp(bx, m.x, m.x + m.w);
            const my = clamp(by, m.y, m.y + m.h);
            const d = Math.sqrt((bx - mx) * (bx - mx) + (by - my) * (by - my));
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        if (bestIdx !== -1) {
            smashMessage(bestIdx);
            b.smashCooldown = CONFIG.BOSS_SMASH_COOLDOWN;
            b.smashPose = 18;
        }
    }

    // Caught the player? (slightly forgiving hitbox)
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

    // Sender + timestamp
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#424242';
    ctx.fillText(m.sender.name, m.x + pad, m.y + pad + 8);
    const nameW = ctx.measureText(m.sender.name).width;
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#8a8a8a';
    ctx.fillText(m.time, m.x + pad + nameW + 8, m.y + pad + 8);

    // Body text
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#242424';
    for (let i = 0; i < m.lines.length; i++) {
        ctx.fillText(m.lines[i], m.x + pad, m.y + pad + 26 + i * 18);
    }

    // Media block
    if (m.type !== 'text') {
        const my = m.y + pad + 16 + m.lines.length * 18 + 4;
        const mw = m.w - pad * 2;

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
    const bob = Math.sin(b.bobPhase) * 3;
    const angry = b.chasing;

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
    if (b.smashPose > 0) {
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
    if (b.smashPose > 0) {
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
