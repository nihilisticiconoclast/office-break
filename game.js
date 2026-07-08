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

const URGENT_MESSAGES = [
    'URGENT: prod is down!!',
    'Client escalation — need eyes NOW',
    'Where are you?? The demo started',
    'CEO is asking about the numbers',
    'Need this in the next 5 minutes',
    'Call me. Now.',
    'The printer is on fire (not a drill)',
    'Legal needs a response ASAP'
];

const MEETING_TITLES = [
    'Q3 Sync (mandatory)',
    '1:1 with your manager',
    'Sprint Retro — no escape',
    'All Hands: Exciting Updates',
    'Pre-planning for the planning meeting',
    'Performance Review',
    'Emergency standup',
    'Workshop: Synergy Alignment'
];

const MEETING_TIMES = [
    'Today 3:00 PM – 3:30 PM',
    'Tomorrow 9:00 AM – 11:00 AM',
    'Friday 4:30 PM – 5:00 PM',
    'Today 12:00 PM (yes, lunch)'
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

const BOSS_QUOTES = ['DENIED.', 'CANCELLED.', 'NOT APPROVED.', 'SEEN. IGNORED.', 'REJECTED.', 'NO.'];

const REACTION_EMOJI = ['👍', '❤️', '😂', '😮', '🎉', '💯'];

const MILESTONE_FLAVOR = [
    'Inbox zero energy',
    'Promotion pending…',
    'Your calendar fears you',
    'HR has been notified (positively)',
    'Certified meeting dodger',
    'Out of office, in the zone',
    'The intern is taking notes'
];

/* --------------------------------------------------------------------------
   Leaderboard — remote when a server is reachable, localStorage otherwise.

   Set LEADERBOARD_URL to your deployed server (e.g. the Render URL) when
   the game is hosted elsewhere (GitHub Pages). Leave it empty when the
   game is served BY server/index.js — same-origin /api/scores is tried
   automatically — or to fall back to a local, this-browser-only board.
   -------------------------------------------------------------------------- */

const LEADERBOARD_URL = '';   // e.g. 'https://office-break.onrender.com'

// GitHub-only board: scores.json lives in this repo and a GitHub Action
// records submissions (players post them as prefilled issues). Set to
// '' to disable. Used when no live API server is reachable.
const GITHUB_REPO = 'nihilisticiconoclast/office-break';

const Leaderboard = {
    mode: null,     // 'remote' | 'local'
    base: '',

    resolveBase: function () {
        if (LEADERBOARD_URL) return LEADERBOARD_URL.replace(/\/+$/, '');
        if (location.protocol === 'http:' || location.protocol === 'https:') return '';
        return null;  // opened via file:// with no server configured
    },

    top: async function () {
        if (this.mode !== 'local') {
            const base = this.resolveBase();
            if (base !== null) {
                try {
                    const res = await fetch(base + '/api/scores',
                        { signal: AbortSignal.timeout(4000) });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && Array.isArray(data.scores)) {
                            this.mode = 'remote';
                            this.base = base;
                            return data.scores;
                        }
                    }
                } catch (err) { /* fall through to local */ }
            }
            const gh = await this.githubScores();
            if (gh !== null) {
                this.mode = 'github';
                return this.mergeWithPending(gh);
            }
            this.mode = 'local';
        }
        if (this.mode === 'github') {
            const gh = await this.githubScores();
            if (gh !== null) return this.mergeWithPending(gh);
        }
        return this.localScores();
    },

    // Fetch the committed scores.json — same-origin first (GitHub Pages of
    // this repo), then the raw.githubusercontent fallback (works anywhere).
    githubScores: async function () {
        if (!GITHUB_REPO) return null;
        const urls = [];
        if (location.protocol === 'http:' || location.protocol === 'https:') {
            urls.push('scores.json?t=' + Date.now());
        }
        urls.push('https://raw.githubusercontent.com/' + GITHUB_REPO + '/main/scores.json?t=' + Date.now());
        for (let i = 0; i < urls.length; i++) {
            try {
                const res = await fetch(urls[i], { signal: AbortSignal.timeout(4000), cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) return data;
                }
            } catch (err) { /* try next */ }
        }
        return null;
    },

    // Local entries wait as "pending" until the Action merges them upstream
    mergeWithPending: function (remote) {
        let pending = this.localScores();
        const kept = pending.filter(function (p) {
            return !remote.some(function (r) {
                return r.initials === p.initials && r.score === p.score;
            });
        });
        if (kept.length !== pending.length) {
            localStorage.setItem('office-break-lb', JSON.stringify(kept));
        }
        const merged = remote.concat(kept.map(function (p) {
            const copy = Object.assign({}, p);
            copy.pending = true;
            return copy;
        }));
        merged.sort(function (a, b) { return b.score - a.score; });
        return merged.slice(0, 20);
    },

    issueUrl: function (initials, score) {
        const title = '🏆 Score: ' + initials + ' ' + score + ' (' + state.diff + ')';
        const body = 'Automated leaderboard submission from Office Break. ' +
            'Just press "Create" — a bot records the score and closes this issue.';
        return 'https://github.com/' + GITHUB_REPO + '/issues/new?title=' +
            encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
    },

    localScores: function () {
        try {
            const list = JSON.parse(localStorage.getItem('office-break-lb') || '[]');
            return Array.isArray(list) ? list : [];
        } catch (err) {
            return [];
        }
    },

    submit: async function (initials, score) {
        const entry = {
            initials: initials,
            score: score,
            diff: state.diff,
            date: new Date().toISOString().slice(0, 10)
        };
        if (this.mode === 'github') {
            const list = this.localScores();
            list.push(entry);
            list.sort(function (a, b) { return b.score - a.score; });
            localStorage.setItem('office-break-lb', JSON.stringify(list.slice(0, 50)));
            this.lastIssueUrl = this.issueUrl(entry.initials, entry.score);
            const gh = await this.githubScores();
            return this.mergeWithPending(gh || []);
        }
        if (this.mode === 'remote') {
            try {
                const res = await fetch(this.base + '/api/scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry),
                    signal: AbortSignal.timeout(4000)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.scores)) return data.scores;
                }
            } catch (err) { /* degrade to local below */ }
            this.mode = 'local';
        }
        const list = this.localScores();
        list.push(entry);
        list.sort(function (a, b) { return b.score - a.score; });
        const kept = list.slice(0, 50);
        localStorage.setItem('office-break-lb', JSON.stringify(kept));
        return kept;
    }
};

/* --------------------------------------------------------------------------
   Sound — tiny WebAudio synth, no assets
   -------------------------------------------------------------------------- */

const Sound = {
    ctx: null,
    muted: false,

    ensure: function () {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (err) { /* audio unavailable */ }
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    tone: function (freq, dur, type, vol, slide) {
        if (this.muted || !this.ctx) return;
        const t0 = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type || 'square';
        o.frequency.setValueAtTime(freq, t0);
        if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
        g.gain.setValueAtTime(vol || 0.07, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t0);
        o.stop(t0 + dur + 0.02);
    },

    noise: function (dur, vol) {
        if (this.muted || !this.ctx) return;
        const n = Math.floor(this.ctx.sampleRate * dur);
        const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.value = vol || 0.1;
        src.connect(g);
        g.connect(this.ctx.destination);
        src.start();
    },

    jump: function () { this.tone(300, 0.12, 'square', 0.045, 520); },
    land: function () { this.noise(0.05, 0.06); },
    smash: function () { this.noise(0.18, 0.15); this.tone(160, 0.16, 'sawtooth', 0.05, 60); },
    shout: function () { this.tone(150, 0.3, 'sawtooth', 0.08, 95); },
    over: function () {
        const s = this;
        s.tone(330, 0.25, 'triangle', 0.08, 220);
        setTimeout(function () { s.tone(220, 0.4, 'triangle', 0.08, 150); }, 200);
    },
    best: function () {
        const s = this;
        [523, 659, 784].forEach(function (f, i) {
            setTimeout(function () { s.tone(f, 0.18, 'triangle', 0.07); }, i * 120);
        });
    },

    toggleMute: function () {
        this.muted = !this.muted;
        localStorage.setItem('office-break-muted', this.muted ? '1' : '0');
        document.getElementById('mute-btn').textContent = this.muted ? '🔇' : '🔊';
    }
};

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */

const CONFIG = {
    GRAVITY: 0.55,
    JUMP_VELOCITY: -12.5,
    MOVE_SPEED: 5.2,
    MOVE_ACCEL: 0.9,
    FRICTION: 0.72,
    COYOTE_FRAMES: 7,            // jump grace after walking off an edge
    JUMP_BUFFER_FRAMES: 8,       // press jump slightly before landing and it still counts

    SCROLL_SPEED_START: 0.75,
    SCROLL_SPEED_MAX: 2.6,
    SCROLL_RAMP: 0.009,          // speed gained per second of survival

    SPAWN_AIR_MIN: 30,           // clear air between one message's bottom and the next one's top
    SPAWN_AIR_MAX: 78,

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

const DIFFICULTY = {
    chill:    { scroll: 0.85, boss: 0.85, ramp: 0.7 },
    standard: { scroll: 1,    boss: 1,    ramp: 1 },
    crunch:   { scroll: 1.15, boss: 1.15, ramp: 1.4 }
};

const REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    paused: false,
    pausedAt: 0,
    startTime: 0,
    lastFrame: 0,
    scrollSpeed: CONFIG.SCROLL_SPEED_START,
    nextSpawnGap: 50,
    score: 0,
    best: 0,
    shake: 0,
    gameOverAt: 0,

    keys: {},
    jumpQueued: false,
    diff: 'standard',
    enteringInitials: false,
    lbToken: 0,

    player: null,
    boss: null,
    messages: [],
    particles: [],
    pickups: [],
    buffTimer: 0
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
    // Render at device resolution so text stays crisp on retina/mobile,
    // while all game logic keeps working in CSS pixels.
    state.dpr = window.devicePixelRatio || 1;
    state.W = area.clientWidth;
    state.H = area.clientHeight;
    state.canvas.width = Math.round(state.W * state.dpr);
    state.canvas.height = Math.round(state.H * state.dpr);
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
    document.getElementById('resume-btn').addEventListener('click', togglePause);

    state.diff = localStorage.getItem('office-break-diff') || 'standard';
    document.querySelectorAll('.diff-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.diff === state.diff);
        btn.addEventListener('click', function () {
            state.diff = btn.dataset.diff;
            localStorage.setItem('office-break-diff', state.diff);
            document.querySelectorAll('.diff-btn').forEach(function (b) {
                b.classList.toggle('active', b === btn);
            });
        });
    });

    document.getElementById('share-btn').addEventListener('click', function () {
        const text = 'I scored ' + Math.floor(state.score) +
            ' in Office Break \ud83d\udcbc\ud83c\udfc3 before the boss got me. Beat that.';
        const btn = document.getElementById('share-btn');
        function done() {
            btn.textContent = 'Copied \u2713';
            setTimeout(function () { btn.textContent = 'Copy score \ud83d\udccb'; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { btn.textContent = text; });
        } else {
            btn.textContent = text;
        }
    });

    document.getElementById('initials-ok').addEventListener('click', confirmInitials);
    document.getElementById('lb-github-submit').addEventListener('click', function () {
        if (Leaderboard.lastIssueUrl) window.open(Leaderboard.lastIssueUrl, '_blank');
    });
    document.querySelectorAll('.initial-slot').forEach(function (slot, i) {
        slot.querySelector('.init-char').addEventListener('click', function () {
            lbEntry.slot = i;
            renderInitialsUI();
        });
        slot.querySelector('.init-up').addEventListener('click', function () {
            lbEntry.slot = i;
            cycleInitial(1);
        });
        slot.querySelector('.init-down').addEventListener('click', function () {
            lbEntry.slot = i;
            cycleInitial(-1);
        });
    });

    Sound.muted = localStorage.getItem('office-break-muted') === '1';
    document.getElementById('mute-btn').textContent = Sound.muted ? '🔇' : '🔊';
    document.getElementById('mute-btn').addEventListener('click', function () {
        Sound.ensure();
        Sound.toggleMute();
    });
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
            if (state.enteringInitials) {
                handleInitialsKey(e);
                return;
            }
            const startVisible = !document.getElementById('start-overlay').classList.contains('hidden');
            const overVisible = !document.getElementById('game-over').classList.contains('hidden');
            // Brief lockout so mashing jump at the moment of death doesn't
            // instantly restart the run.
            const settled = performance.now() - state.gameOverAt > 600;
            if (startVisible || (overVisible && settled &&
                (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyR'))) {
                startGame();
            }
            return;
        }

        if ((e.code === 'KeyP' || e.code === 'Escape') && !e.repeat) {
            togglePause();
            return;
        }
        if (e.code === 'KeyR' && !e.repeat) {
            startGame();
            return;
        }
        if (e.code === 'KeyM' && !e.repeat) {
            Sound.toggleMute();
            return;
        }
        if (state.paused) return;

        state.keys[e.code] = true;
        if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !e.repeat) {
            state.jumpQueued = true;
        }
    });

    // Auto-pause when the window loses focus (meeting incoming, probably)
    window.addEventListener('blur', function () {
        if (state.running && !state.paused) togglePause();
    });
    // ...and when the tab is hidden (mobile app switch doesn't always blur)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden && state.running && !state.paused) togglePause();
    });

    setupTouchControls();
}

function setupTouchControls() {
    function bind(id, down, up) {
        const el = document.getElementById(id);
        el.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            try { el.setPointerCapture(e.pointerId); } catch (err) { /* no-op */ }
            down();
        });
        ['pointerup', 'pointercancel'].forEach(function (ev) {
            el.addEventListener(ev, function (e) {
                e.preventDefault();
                if (up) up();
            });
        });
        el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }

    bind('tc-left',
        function () { state.keys.ArrowLeft = true; },
        function () { state.keys.ArrowLeft = false; });
    bind('tc-right',
        function () { state.keys.ArrowRight = true; },
        function () { state.keys.ArrowRight = false; });
    bind('tc-jump',
        function () { if (state.running && !state.paused) state.jumpQueued = true; },
        null);
}

// A tiny buzz on Android when something breaks; silently ignored elsewhere
function haptic(ms) {
    if (navigator.vibrate) {
        try { navigator.vibrate(ms); } catch (err) { /* no-op */ }
    }

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
    document.getElementById('pause-overlay').classList.add('hidden');

    Sound.ensure();
    state.enteringInitials = false;
    state.lbToken++;
    state.running = true;
    state.gameOver = false;
    state.paused = false;
    state.stats = { hops: 0, smashed: 0 };
    state.lastMilestone = 0;
    state.channelStage = 0;
    setActiveChannel(0);
    state.startTime = performance.now();
    state.lastFrame = performance.now();
    state.scrollSpeed = CONFIG.SCROLL_SPEED_START;
    state.nextSpawnGap = randRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
    state.score = 0;
    state.shake = 0;
    state.keys = {};
    state.jumpQueued = false;
    state.messages = [];
    state.particles = [];
    state.pickups = [];
    state.buffTimer = 0;

    state.player = {
        x: state.W / 2 - 14, y: 0,
        w: 28, h: 48,
        vx: 0, vy: 0,
        facing: 1,
        grounded: false,
        platform: null,
        animPhase: 0,
        coyote: 0,
        jumpBuffer: 0,
        squash: 0
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

    let y = first.y + first.h + randRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
    while (y < state.H + 60) {
        const m = createMessage(y);
        state.messages.push(m);
        y = m.y + m.h + randRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
    }

    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (!state.running) return;
    if (!state.paused) {
        state.paused = true;
        state.pausedAt = performance.now();
        state.keys = {};
        document.getElementById('pause-overlay').classList.remove('hidden');
    } else {
        // Shift every wall-clock anchor forward so the pause doesn't count
        const delta = performance.now() - state.pausedAt;
        state.startTime += delta;
        state.boss.shoutUntil += delta;
        state.lastFrame = performance.now();
        state.paused = false;
        document.getElementById('pause-overlay').classList.add('hidden');
    }
}

function endGame(reason) {
    state.running = false;
    state.gameOver = true;
    state.gameOverAt = performance.now();
    haptic(120);
    const final = Math.floor(state.score);
    const isNewBest = final > state.best && state.best > 0;
    if (final > state.best) {
        state.best = final;
        localStorage.setItem('office-break-best', String(final));
        document.getElementById('best').textContent = final;
    }
    if (isNewBest) { Sound.best(); } else { Sound.over(); }
    document.getElementById('new-best').classList.toggle('hidden', !isNewBest);
    document.getElementById('game-over-reason').textContent = reason;
    document.getElementById('final-score').textContent = final;
    document.getElementById('go-stats').textContent =
        state.stats.hops + ' messages hopped · ' + state.stats.smashed + ' smashed by the boss';
    document.getElementById('game-over').classList.remove('hidden');
    showLeaderboardFlow(final);
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
    if (roll < 0.24) return { type: 'text', size: 'short', text: pick(SHORT_REPLIES) };
    if (roll < 0.52) return { type: 'text', size: 'medium', text: pick(CORPORATE_PHRASES) };
    if (roll < 0.68) {
        let text = pick(CORPORATE_PHRASES) + '. ' + pick(CORPORATE_PHRASES);
        if (Math.random() < 0.35) text += '. ' + pick(CORPORATE_PHRASES);
        return { type: 'text', size: 'long', text: text };
    }
    if (roll < 0.80) return { type: 'gif', size: 'media', text: pick(GIF_CAPTIONS) };
    if (roll < 0.88) return { type: 'chart', size: 'media', text: pick(CHART_TITLES) };
    if (roll < 0.94) {
        // Urgent messages rise through the chat faster than everything else
        return { type: 'text', size: 'medium', text: pick(URGENT_MESSAGES), urgent: true };
    }
    // Meeting invites: wide card, the most generous platform in the game
    return { type: 'invite', size: 'invite', text: pick(MEETING_TITLES), meetTime: pick(MEETING_TIMES) };
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

    // Meeting invites are their own wide-card layout
    if (content.type === 'invite') {
        const w = clamp(state.W * 0.6 + Math.random() * state.W * 0.12, 300, state.W * 0.8);
        const h = 88;
        const x = clamp(64 + Math.random() * Math.max(1, state.W - w - 100), 24, Math.max(24, state.W - w - 24));
        return {
            x: x, y: y, w: w, h: h, prevY: y,
            sender: sender,
            own: false,
            type: 'invite',
            lines: [content.text],
            meetTime: content.meetTime,
            time: gameClock(),
            speedMult: 1,
            mediaW: 0,
            mediaH: 0,
            gifHue: 0,
            bars: []
        };
    }

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
        urgent: !!content.urgent,
        speedMult: content.urgent ? 1.65 : 1,
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
    const m = createMessage(state.H + 12);
    state.messages.push(m);
    // Occasionally a coffee rides in on a message. One on screen at a time,
    // and not while you're already caffeinated.
    if (Math.random() < 0.09 && state.pickups.length === 0 && state.buffTimer <= 0) {
        state.pickups.push({ m: m, ox: 20 + Math.random() * Math.max(10, m.w - 40) });
    }
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
    haptic(30);
    Sound.smash();
    if (state.stats) state.stats.smashed++;
    if (state.boss && Math.random() < 0.35) {
        state.boss.quote = pick(BOSS_QUOTES);
        state.boss.quoteUntil = performance.now() + 1200;
    }
}

/* --------------------------------------------------------------------------
   Update
   -------------------------------------------------------------------------- */

function updateWorld(t, elapsedSec) {
    // Difficulty ramp
    const diff = DIFFICULTY[state.diff] || DIFFICULTY.standard;
    state.scrollSpeed = Math.min(CONFIG.SCROLL_SPEED_MAX,
        (CONFIG.SCROLL_SPEED_START + elapsedSec * CONFIG.SCROLL_RAMP * diff.ramp) * diff.scroll);

    // Scroll every message upward. Urgent messages climb faster than the
    // rest, but are clamped just beneath the message above them so nothing
    // ever overlaps — they push up the queue, tailgating like they talk.
    const scroll = state.scrollSpeed * t;
    state.messages.sort(function (a, b) { return a.y - b.y; });
    let aboveBottom = -Infinity;
    for (let i = 0; i < state.messages.length; i++) {
        const m = state.messages[i];
        m.prevY = m.y;
        m.y -= scroll * (m.speedMult || 1);
        if ((m.speedMult || 1) > 1 && m.y < aboveBottom + 4) {
            m.y = aboveBottom + 4;
        }
        aboveBottom = m.y + m.h;
    }

    // Spawn a new message once the previous one's bottom edge has scrolled
    // far enough up to leave clear air beneath it — messages never overlap,
    // whatever their height. The required air shrinks the deeper the player
    // pushes (more platforms where they're needed) and slowly over time.
    const depth = clamp((state.player.y + state.player.h) / state.H, 0, 1);
    const timeShrink = Math.max(CONFIG.SPAWN_SHRINK_FLOOR, 1 - elapsedSec * CONFIG.SPAWN_TIME_SHRINK);
    let lowestBottom = -Infinity;
    for (let i = 0; i < state.messages.length; i++) {
        lowestBottom = Math.max(lowestBottom, state.messages[i].y + state.messages[i].h);
    }
    const airNeeded = state.nextSpawnGap * timeShrink / (1 + depth * CONFIG.SPAWN_DEPTH_BOOST);
    if (lowestBottom + airNeeded <= state.H + 12) {
        state.nextSpawnGap = randRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
        spawnFromBottom();
    }

    // Drop messages that scrolled off the top
    for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].y + state.messages[i].h < -40) {
            state.messages.splice(i, 1);
        }
    }

    // Ambient reactions: now and then someone thumbs-ups a message and the
    // emoji floats up off the bubble
    if (Math.random() < 0.009 * t && state.messages.length) {
        const m = pick(state.messages);
        if (m.y > 20 && m.y < state.H - 20) {
            state.particles.push({
                x: m.x + m.w - 14,
                y: m.y + 2,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.7 - Math.random() * 0.4,
                size: 0, rot: 0, vr: 0,
                life: 1,
                emoji: pick(REACTION_EMOJI)
            });
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
    const maxSpeed = CONFIG.MOVE_SPEED * (state.buffTimer > 0 ? 1.35 : 1);
    if (ax !== 0) {
        p.vx = clamp(p.vx + ax * t, -maxSpeed, maxSpeed);
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
            p.coyote = CONFIG.COYOTE_FRAMES;   // brief grace to still jump
        }
    } else if (p.coyote > 0) {
        p.coyote -= t;
    }

    // Jump — buffered, with coyote grace
    if (state.jumpQueued) {
        state.jumpQueued = false;
        p.jumpBuffer = CONFIG.JUMP_BUFFER_FRAMES;
    }
    if (p.jumpBuffer > 0) {
        const canGround = p.grounded || p.coyote > 0;
        const canAir = !canGround && state.buffTimer > 0 && p.airJump > 0;
        if (canGround || canAir) {
            if (canAir) p.airJump--;
            p.vy = CONFIG.JUMP_VELOCITY * (state.buffTimer > 0 ? 1.12 : 1);
            Sound.jump();
            spawnDust(p.x + p.w / 2, p.y + p.h, 3);
            p.grounded = false;
            p.platform = null;
            p.coyote = 0;
            p.jumpBuffer = 0;
        } else {
            p.jumpBuffer -= t;
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
                    if (p.vy > 6) {
                        p.squash = clamp(p.vy, 6, 14);
                        spawnDust(p.x + p.w / 2, m.y, 5);
                        Sound.land();
                    }
                    if (m !== p.lastLanding) {
                        p.lastLanding = m;
                        state.stats.hops++;
                    }
                    if (state.buffTimer > 0) p.airJump = 1;
                    p.y = m.y - p.h;
                    p.vy = 0;
                    p.grounded = true;
                    p.platform = m;
                    p.coyote = 0;
                    break;
                }
            }
        }
    }
    if (p.squash > 0) p.squash -= t * 1.5;

    // Run-cycle animation
    if (p.grounded && Math.abs(p.vx) > 0.4) {
        p.animPhase += Math.abs(p.vx) * 0.045 * t;
    } else if (!p.grounded) {
        p.animPhase += 0.06 * t;
    } else {
        p.animPhase = 0;
    }

    // Coffee pickups ride their message; grab one for a caffeine buff
    for (let i = state.pickups.length - 1; i >= 0; i--) {
        const pk = state.pickups[i];
        if (state.messages.indexOf(pk.m) === -1) {
            state.pickups.splice(i, 1);
            continue;
        }
        const cx = pk.m.x + pk.ox;
        const cy = pk.m.y - 12;
        if (p.x + p.w > cx - 11 && p.x < cx + 11 &&
            p.y + p.h > cy - 12 && p.y < cy + 12) {
            state.pickups.splice(i, 1);
            state.buffTimer = 360;   // ~6 seconds
            p.airJump = 1;
            Sound.tone(660, 0.1, 'triangle', 0.06, 990);
            showToast('☕ Coffee!', 'Speed up + one mid-air jump');
        }
    }
    if (state.buffTimer > 0) {
        state.buffTimer -= t;
        if (state.buffTimer <= 0) p.airJump = 0;
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
            Sound.shout();
        }
        return;
    }

    const bdiff = DIFFICULTY[state.diff] || DIFFICULTY.standard;
    b.runSpeed = Math.min(CONFIG.BOSS_RUN_MAX,
        (CONFIG.BOSS_RUN_SPEED + elapsedSec * CONFIG.BOSS_RAMP * bdiff.ramp) * bdiff.boss);
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

function spawnDust(x, y, n) {
    for (let i = 0; i < n; i++) {
        state.particles.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y - 2,
            vx: (Math.random() - 0.5) * 2.4,
            vy: -Math.random() * 1.4,
            size: 2 + Math.random() * 3,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.2,
            life: 0.7,
            color: '#c9c9c9',
            dust: true
        });
    }
}

function updateParticles(t) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx * t;
        pt.y += pt.vy * t;
        if (!pt.emoji) pt.vy += (pt.dust ? 0.05 : 0.25) * t;   // reactions just float
        pt.rot += pt.vr * t;
        pt.life -= (pt.emoji ? 0.012 : pt.dust ? 0.045 : 0.025) * t;
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

function paintMessage(ctx, m, x, y) {
    const pad = 12;

    // Avatar (decorative — the bubble is the platform)
    if (!m.own) {
        ctx.fillStyle = m.sender.color;
        ctx.beginPath();
        ctx.arc(x - 22, y + 16, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials(m.sender.name), x - 22, y + 17);
    }

    // Bubble
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.10)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = m.urgent ? '#fdf3f4' : (m.own ? '#e8ebfa' : '#ffffff');
    roundRect(ctx, x, y, m.w, m.h, 6);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Meeting invite: wide calendar card with RSVP buttons
    if (m.type === 'invite') {
        ctx.fillStyle = '#6264a7';
        ctx.fillRect(x, y + 5, 4, m.h - 10);
        ctx.font = '18px "Segoe UI", sans-serif';
        ctx.fillText('📅', x + pad, y + 26);
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        ctx.fillStyle = '#242424';
        ctx.fillText(m.lines[0], x + pad + 28, y + 22);
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillStyle = '#616161';
        ctx.fillText(m.sender.name + ' invited you · ' + m.time, x + pad + 28, y + 38);
        ctx.fillStyle = '#8a8a8a';
        ctx.fillText(m.meetTime, x + pad + 28, y + 52);
        // Accept / Decline
        roundRect(ctx, x + pad + 28, y + 60, 64, 20, 3);
        ctx.fillStyle = '#6264a7';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.fillText('Accept', x + pad + 42, y + 74);
        roundRect(ctx, x + pad + 100, y + 60, 64, 20, 3);
        ctx.strokeStyle = '#c8c8c8';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#616161';
        ctx.fillText('Decline', x + pad + 113, y + 74);
        return;
    }

    // Urgent: red accent bar and bang, like an IMPORTANT! flag
    if (m.urgent) {
        ctx.fillStyle = '#c4314b';
        ctx.fillRect(x, y + 5, 4, m.h - 10);
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        ctx.fillText('❗', x + m.w - 20, y + pad + 9);
    }

    // Sender + timestamp (own messages show just the time, like Teams)
    if (m.own) {
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillStyle = '#8a8a8a';
        ctx.fillText(m.time, x + pad, y + pad + 8);
    } else {
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.fillStyle = m.urgent ? '#c4314b' : '#424242';
        ctx.fillText(m.sender.name, x + pad, y + pad + 8);
        const nameW = ctx.measureText(m.sender.name).width;
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillStyle = '#8a8a8a';
        ctx.fillText(m.time, x + pad + nameW + 8, y + pad + 8);
    }

    // Body text
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#242424';
    for (let i = 0; i < m.lines.length; i++) {
        ctx.fillText(m.lines[i], x + pad, y + pad + 26 + i * 18);
    }

    // Media block
    if (m.type !== 'text') {
        const my = y + pad + 16 + m.lines.length * 18 + 4;
        const mw = m.mediaW;

        if (m.type === 'gif') {
            const grad = ctx.createLinearGradient(x + pad, my, x + pad + mw, my + m.mediaH);
            grad.addColorStop(0, 'hsl(' + m.gifHue + ', 70%, 62%)');
            grad.addColorStop(1, 'hsl(' + ((m.gifHue + 70) % 360) + ', 70%, 48%)');
            roundRect(ctx, x + pad, my, mw, m.mediaH, 4);
            ctx.fillStyle = grad;
            ctx.fill();
            // Little sparkle
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = '22px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✦', x + pad + mw / 2, my + m.mediaH / 2 + 8);
            ctx.textAlign = 'left';
            // GIF badge
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            roundRect(ctx, x + pad + 6, my + m.mediaH - 22, 34, 16, 3);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px "Segoe UI", sans-serif';
            ctx.fillText('GIF', x + pad + 14, my + m.mediaH - 10);
        } else {
            // Chart card
            roundRect(ctx, x + pad, my, mw, m.mediaH, 4);
            ctx.fillStyle = '#fafafa';
            ctx.fill();
            ctx.strokeStyle = '#e1e1e1';
            ctx.lineWidth = 1;
            ctx.stroke();
            const barW = Math.min(18, (mw - 40) / m.bars.length - 6);
            for (let i = 0; i < m.bars.length; i++) {
                const bh = m.bars[i] * (m.mediaH - 22);
                ctx.fillStyle = i % 2 === 0 ? '#6264a7' : '#9ea2d0';
                ctx.fillRect(x + pad + 14 + i * (barW + 6), my + m.mediaH - 8 - bh, barW, bh);
            }
            ctx.fillStyle = '#8a8a8a';
            ctx.font = '9px "Segoe UI", sans-serif';
            ctx.fillText('📊 ' + '▸', x + pad + mw - 24, my + 14);
        }
    }
}

// Each bubble is rendered once into an offscreen canvas at creation time,
// then blitted per frame — much cheaper than re-laying-out text and shadows
// sixty times a second, especially on mobile.
const CACHE_PAD_L = 44, CACHE_PAD_T = 8, CACHE_PAD_R = 10, CACHE_PAD_B = 12;

function renderMessageCache(m) {
    const cw = m.w + CACHE_PAD_L + CACHE_PAD_R;
    const ch = m.h + CACHE_PAD_T + CACHE_PAD_B;
    const dpr = state.dpr || 1;
    const cnv = document.createElement('canvas');
    cnv.width = Math.ceil(cw * dpr);
    cnv.height = Math.ceil(ch * dpr);
    const cctx = cnv.getContext('2d');
    cctx.scale(dpr, dpr);
    paintMessage(cctx, m, CACHE_PAD_L, CACHE_PAD_T);
    m.cacheW = cw;
    m.cacheH = ch;
    return cnv;
}

function drawMessage(m) {
    if (!m.cache) m.cache = renderMessageCache(m);
    state.ctx.drawImage(m.cache, m.x - CACHE_PAD_L, m.y - CACHE_PAD_T, m.cacheW, m.cacheH);
    if (m.urgent) {
        // Live pulsing outline so urgent messages read as urgent at a glance
        const a = REDUCED_MOTION ? 0.55 : 0.4 + 0.3 * Math.sin(performance.now() / 170);
        const ctx = state.ctx;
        ctx.strokeStyle = 'rgba(196, 49, 75, ' + a + ')';
        ctx.lineWidth = 2;
        roundRect(ctx, m.x, m.y, m.w, m.h, 6);
        ctx.stroke();
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
    if (p.squash > 0) {
        // Squash on landing, anchored at the feet
        const s = p.squash * 0.014;
        ctx.translate(0, p.h);
        ctx.scale(1 + s, 1 - s);
        ctx.translate(0, -p.h);
    }

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

    // Quick one-liner when he smashes something
    if (b.quote && now < b.quoteUntil && !(b.chasing && now < b.shoutUntil)) {
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        const qw = ctx.measureText(b.quote).width;
        const qx = clamp(b.x + b.w / 2 - qw / 2 - 8, 6, state.W - qw - 22);
        const qy = b.y - 26;
        roundRect(ctx, qx, qy, qw + 16, 20, 9);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#c4314b';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#c4314b';
        ctx.textAlign = 'left';
        ctx.fillText(b.quote, qx + 8, qy + 14);
    }

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
        if (pt.emoji) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, pt.life * 1.4));
            ctx.font = '15px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(pt.emoji, pt.x, pt.y);
            ctx.restore();
            continue;
        }
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

function drawPickups(now) {
    const ctx = state.ctx;
    for (let i = 0; i < state.pickups.length; i++) {
        const pk = state.pickups[i];
        const bobble = REDUCED_MOTION ? 0 : Math.sin(now / 260 + pk.ox) * 3;
        ctx.font = '20px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☕', pk.m.x + pk.ox, pk.m.y - 8 + bobble);
        ctx.textAlign = 'left';
    }
    // Caffeine HUD pill while the buff is live
    if (state.buffTimer > 0) {
        const secs = Math.ceil(state.buffTimer / 60);
        const text = '☕ ' + secs + 's · double jump';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        const tw = ctx.measureText(text).width;
        roundRect(ctx, 12, 12, tw + 20, 24, 12);
        ctx.fillStyle = 'rgba(73, 130, 5, 0.92)';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(text, 22, 29);
    }
}

function drawDangerVignette() {
    // Red glow bleeding in from the top as the scroll pulls you toward the
    // archive — the closer you are, the hotter it gets.
    const p = state.player;
    if (!p || p.y > 110) return;
    const a = clamp((110 - p.y) / 110, 0, 1) * 0.32;
    const g = state.ctx.createLinearGradient(0, 0, 0, 90);
    g.addColorStop(0, 'rgba(196,49,75,' + a + ')');
    g.addColorStop(1, 'rgba(196,49,75,0)');
    state.ctx.fillStyle = g;
    state.ctx.fillRect(0, 0, state.W, 90);
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
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.clearRect(0, 0, state.W, state.H);

    // Screen shake when the boss smashes something
    if (state.shake > 0) {
        state.shake--;
        if (!REDUCED_MOTION) {
            ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
        }
    }

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-10, -10, state.W + 20, state.H + 20);

    for (let i = 0; i < state.messages.length; i++) {
        drawMessage(state.messages[i]);
    }
    drawPickups(now);
    drawParticles();
    drawPlayer();
    drawBoss(now);
    drawDangerVignette();
    drawCountdown(now);
    drawBossIndicator();
}

/* --------------------------------------------------------------------------
   Leaderboard UI — arcade-style initials entry + top-10 board
   -------------------------------------------------------------------------- */

const LB_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const lbEntry = { chars: ['A', 'A', 'A'], slot: 0, score: 0 };

async function showLeaderboardFlow(final) {
    const token = ++state.lbToken;
    document.getElementById('initials-entry').classList.add('hidden');
    document.getElementById('lb-board').classList.add('hidden');
    document.getElementById('lb-note').textContent = '';

    const scores = await Leaderboard.top();
    if (token !== state.lbToken || !state.gameOver) return;

    const qualifies = final >= 1 &&
        (scores.length < 10 || final > scores[9].score);
    if (qualifies) {
        startInitialsEntry(final);
    } else {
        renderBoard(scores, null);
    }
}

function startInitialsEntry(final) {
    lbEntry.score = final;
    lbEntry.slot = 0;
    const saved = (localStorage.getItem('office-break-initials') || 'AAA').split('');
    for (let i = 0; i < 3; i++) {
        lbEntry.chars[i] = LB_CHARSET.indexOf(saved[i]) !== -1 ? saved[i] : 'A';
    }
    state.enteringInitials = true;
    document.getElementById('initials-entry').classList.remove('hidden');
    renderInitialsUI();
}

function renderInitialsUI() {
    document.querySelectorAll('.initial-slot').forEach(function (slot, i) {
        slot.classList.toggle('active', i === lbEntry.slot);
        slot.querySelector('.init-char').textContent = lbEntry.chars[i];
    });
}

function cycleInitial(dir) {
    const i = LB_CHARSET.indexOf(lbEntry.chars[lbEntry.slot]);
    const next = (i + dir + LB_CHARSET.length) % LB_CHARSET.length;
    lbEntry.chars[lbEntry.slot] = LB_CHARSET[next];
    renderInitialsUI();
}

function handleInitialsKey(e) {
    const code = e.code;
    if (code === 'Enter') return confirmInitials();
    if (code === 'ArrowUp') return cycleInitial(1);
    if (code === 'ArrowDown') return cycleInitial(-1);
    if (code === 'ArrowLeft') {
        lbEntry.slot = Math.max(0, lbEntry.slot - 1);
        return renderInitialsUI();
    }
    if (code === 'ArrowRight') {
        lbEntry.slot = Math.min(2, lbEntry.slot + 1);
        return renderInitialsUI();
    }
    if (code === 'Backspace') {
        lbEntry.slot = Math.max(0, lbEntry.slot - 1);
        lbEntry.chars[lbEntry.slot] = 'A';
        return renderInitialsUI();
    }
    const ch = (e.key || '').toUpperCase();
    if (ch.length === 1 && LB_CHARSET.indexOf(ch) !== -1) {
        lbEntry.chars[lbEntry.slot] = ch;
        lbEntry.slot = Math.min(2, lbEntry.slot + 1);
        renderInitialsUI();
    }
}

async function confirmInitials() {
    if (!state.enteringInitials) return;
    state.enteringInitials = false;
    const initials = lbEntry.chars.join('');
    localStorage.setItem('office-break-initials', initials);
    document.getElementById('initials-entry').classList.add('hidden');

    const token = state.lbToken;
    const scores = await Leaderboard.submit(initials, lbEntry.score);
    if (token !== state.lbToken || !state.gameOver) return;
    renderBoard(scores, { initials: initials, score: lbEntry.score });
    Sound.best();
}

function renderBoard(scores, you) {
    const list = document.getElementById('lb-list');
    list.innerHTML = '';
    let highlighted = false;
    scores.slice(0, 10).forEach(function (s, i) {
        const li = document.createElement('li');
        const isYou = !highlighted && you &&
            s.initials === you.initials && s.score === you.score;
        if (isYou) {
            li.classList.add('lb-you');
            highlighted = true;
        }
        if (s.pending) li.classList.add('lb-pending');
        li.innerHTML =
            '<span class="lb-rank">' + (i + 1) + '.</span>' +
            '<span class="lb-initials">' + String(s.initials).replace(/[<>&]/g, '') + '</span>' +
            '<span class="lb-score">' + Math.floor(s.score) + '</span>';
        list.appendChild(li);
    });
    if (!scores.length) {
        const li = document.createElement('li');
        li.innerHTML = '<span class="lb-rank">–</span><span class="lb-initials">no scores yet</span>';
        list.appendChild(li);
    }
    const note = document.getElementById('lb-note');
    if (Leaderboard.mode === 'remote') {
        note.textContent = 'Global leaderboard';
    } else if (Leaderboard.mode === 'github') {
        note.textContent = you && Leaderboard.lastIssueUrl
            ? 'Post your score so everyone sees it (needs a GitHub account) — it merges in ~1 min.'
            : 'Global board via GitHub';
    } else {
        note.textContent = 'Local board (this browser only) — deploy the server for a global one';
    }
    const ghBtn = document.getElementById('lb-github-submit');
    ghBtn.classList.toggle('hidden',
        !(Leaderboard.mode === 'github' && you && Leaderboard.lastIssueUrl));
    document.getElementById('lb-board').classList.remove('hidden');
}

/* --------------------------------------------------------------------------
   Toasts — Teams-style notification cards, top-right of the chat
   -------------------------------------------------------------------------- */

function setActiveChannel(index) {
    const ch = CHANNELS[index];
    document.querySelector('#chat-header .chat-title-text h1').textContent = ch.name;
    document.querySelector('#chat-header .channel-avatar').textContent = ch.name[0];
    const items = document.querySelectorAll('#channel-list li');
    items.forEach(function (li, i) {
        li.classList.toggle('active', i === index);
    });
}

let toastTimer = null;

function showToast(title, body) {
    const el = document.getElementById('toast');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-body').textContent = body;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
}

/* --------------------------------------------------------------------------
   Main loop
   -------------------------------------------------------------------------- */

function gameLoop(now) {
    if (!state.running) return;
    if (state.paused) {
        state.lastFrame = now;
        state.rafId = requestAnimationFrame(gameLoop);
        return;
    }

    // Normalize to 60fps units so speed is framerate-independent; cap the
    // step so a background tab doesn't teleport everything on return.
    const t = Math.min(now - state.lastFrame, 50) / 16.667;
    state.lastFrame = now;
    // RAF timestamps can trail performance.now() by a few ms on the very
    // first frame — never let elapsed time (and thus score) go negative.
    const elapsedSec = Math.max(0, (now - state.startTime) / 1000);

    updateWorld(t, elapsedSec);
    updatePlayer(t);
    if (state.running) updateBoss(t, now, elapsedSec);
    updateParticles(t);

    state.score = elapsedSec * CONFIG.POINTS_PER_SECOND;
    document.getElementById('score').textContent = Math.floor(state.score);

    const milestone = Math.floor(state.score / 250);
    if (milestone > state.lastMilestone) {
        state.lastMilestone = milestone;
        showToast('\ud83c\udfc6 ' + (milestone * 250) + ' points', pick(MILESTONE_FLAVOR));
    }

    // Every 500 points you get dragged into a busier channel
    const stage = clamp(Math.floor(state.score / 500), 0, CHANNELS.length - 1);
    if (stage !== state.channelStage) {
        state.channelStage = stage;
        setActiveChannel(stage);
        if (stage > 0) showToast('\ud83d\udce5 Moved to ' + CHANNELS[stage].name, 'It gets busier in here\u2026');
    }

    draw(now);

    if (state.running) state.rafId = requestAnimationFrame(gameLoop);
}

window.addEventListener('load', boot);
