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
const BOSS_QUOTES_ANGRY = ['WHO APPROVED THIS?', 'MY OFFICE. NOW.', 'UNACCEPTABLE.', 'CC-ING HR.'];
const SKIP_QUOTES = ['EXPLAIN.', 'I REPORT TO THE BOARD.', 'SYNERGY. NOW.', 'THIS IS A P0.'];

const REACTION_EMOJI = ['👍', '❤️', '😂', '😮', '🎉', '💯'];

const AVATARS = [
    { name: 'Sam',   skin: '#e8b48f', hair: '#4a3222', shirt: '#2d8c6e', pants: '#33445c' },
    { name: 'Alex',  skin: '#8d5524', hair: '#1b1b1b', shirt: '#c74634', pants: '#2b2b33' },
    { name: 'Jo',    skin: '#f0c9a0', hair: '#c28e0e', shirt: '#0078d4', pants: '#3a3a3a' },
    { name: 'Riley', skin: '#c68642', hair: '#5b3a29', shirt: '#8764b8', pants: '#26323f' },
    { name: 'Kai',   skin: '#ffd7b3', hair: '#d1495b', shirt: '#e3a008', pants: '#33445c' },
    { name: 'Max',   skin: '#a76a3f', hair: '#6f6f6f', shirt: '#455a64', pants: '#1e1e24' }
];

const PM_SENDER = { name: 'Paula Marsh · PM', color: '#d83b01' };

const PM_PHRASES = [
    'Quick status check: are we on track for the sprint goal?',
    'Can you update the Jira board before the standup?',
    'The Gantt chart says this was due yesterday',
    "Let's timebox this discussion to fifteen minutes",
    "I've scheduled a follow-up to discuss the follow-up",
    "What's the confidence level on that estimate?",
    'Can we get a RAG status on the workstream?',
    'The burndown chart is looking more like a burn-up',
    'Adding this to the risks and issues log as we speak'
];

const PM_STUN_LINES = ['Got a sec?', 'Quick sync!', 'One more thing…', 'While I have you—'];

const HR_SENDER = { name: 'Hilda Rowe · HR', color: '#8f2d56' };

const HR_PHRASES = [
    'Reminder: compliance training is due Friday',
    'Please review the updated PTO policy',
    'The fridge is not a filing cabinet — HR',
    'Mandatory fun day is, in fact, mandatory',
    'Your wellness survey is now overdue',
    'New policy: policies may change without notice'
];

const HR_LINES = ['Proper channels, please.', 'Is that report authorized?', 'Where is the cover sheet?'];
const HR_LINES_IDLE = ['Compliance training?', 'Lovely weather. Sign this.'];

const STORM_REPLIES = [
    'Thanks!', '+1', 'Please remove me from this list', 'Why am I on this thread?',
    'STOP REPLYING ALL', 'Noted, thanks', 'Same', 'Congrats!', 'Welcome aboard!',
    '🎉', 'Seen', 'Adding my manager', 'Unsubscribe', 'Thanks all!'
];

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
            diff: state.daily ? 'daily' : state.diff,
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

const ACHIEVEMENTS = [
    { id: 'first-run',   name: 'Out of Office',            desc: 'Finish your first escape attempt' },
    { id: 'survive-60',  name: 'Long Lunch',               desc: 'Survive for a full minute' },
    { id: 'score-1000',  name: 'Overachiever',             desc: 'Score 1,000 points in one run' },
    { id: 'cascade',     name: 'Serial Scroller',          desc: 'Reach a ×5 descent combo' },
    { id: 'demolition',  name: 'Demolition Survivor',      desc: 'Outlive 10 smashed messages in one run' },
    { id: 'delegation',  name: 'Delegation',               desc: 'Distract the boss with a report' },
    { id: 'left-on-read', name: 'Left on Read',            desc: 'Vanish behind Do Not Disturb' },
    { id: 'synergized',  name: 'Synergized',               desc: 'Get cornered by the project manager' },
    { id: 'not-now',     name: 'Not Now',                  desc: 'Decline an incoming call' },
    { id: 'stairs',      name: 'Pushed Down the Stairs',   desc: 'Send a boss off the bottom of the chat' },
    { id: 'org-chart',   name: 'Org Chart Explorer',       desc: 'Meet the skip-level manager' },
    { id: 'routine',     name: 'Routine',                  desc: 'Finish a daily challenge' }
];

let achSet = new Set();

function loadAchievements() {
    try {
        achSet = new Set(JSON.parse(localStorage.getItem('office-break-ach') || '[]'));
    } catch (err) {
        achSet = new Set();
    }
    updateAchCount();
}

function award(id) {
    if (achSet.has(id)) return;
    achSet.add(id);
    localStorage.setItem('office-break-ach', JSON.stringify(Array.from(achSet)));
    const a = ACHIEVEMENTS.find(function (x) { return x.id === id; });
    if (a) {
        showToast('🏅 ' + a.name, a.desc);
        Sound.best();
    }
    updateAchCount();
}

function updateAchCount() {
    const el = document.getElementById('ach-count');
    if (!el) return;
    el.textContent = '🏅 ' + achSet.size + '/' + ACHIEVEMENTS.length + ' achievements';
    el.title = ACHIEVEMENTS.map(function (a) {
        return (achSet.has(a.id) ? '✓ ' : '✗ ') + a.name + ' — ' + a.desc;
    }).join('\n');
}

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

    /* ---- lo-fi background loop: scheduled one bar ahead ---- */

    musicTimer: null,
    musicNextBar: 0,
    musicBar: 0,

    note: function (freq, tStart, dur, type, vol) {
        if (this.muted || !this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, tStart);
        g.gain.exponentialRampToValueAtTime(vol, tStart + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, tStart + dur);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(tStart);
        o.stop(tStart + dur + 0.05);
    },

    playBar: function (t0, i) {
        const roots = [130.81, 110.00, 87.31, 98.00];            // C3 A2 F2 G2
        const chords = [
            [261.63, 329.63, 392.00, 493.88],                    // Cmaj7
            [220.00, 261.63, 329.63, 415.30],                    // Am7-ish
            [174.61, 220.00, 261.63, 349.23],                    // Fmaj7-ish
            [196.00, 246.94, 293.66, 392.00]                     // G7
        ];
        this.note(roots[i], t0, 1.5, 'sine', 0.035);
        this.note(roots[i], t0 + 1.6, 1.4, 'sine', 0.028);
        const notes = chords[i];
        for (let n = 0; n < notes.length; n++) {
            this.note(notes[n], t0 + 0.05 + n * 0.03, 2.9, 'triangle', 0.011);
        }
    },

    scheduleMusic: function () {
        if (!this.ctx || this.muted || !state.running || state.paused) return;
        const BAR = 3.2;
        while (this.musicNextBar < this.ctx.currentTime + 0.9) {
            if (this.musicNextBar < this.ctx.currentTime) {
                this.musicNextBar = this.ctx.currentTime + 0.05;
            }
            this.playBar(this.musicNextBar, this.musicBar % 4);
            this.musicNextBar += BAR;
            this.musicBar++;
        }
    },

    startMusic: function () {
        this.ensure();
        if (this.musicTimer || !this.ctx) return;
        this.musicNextBar = this.ctx.currentTime + 0.15;
        this.musicBar = 0;
        const s = this;
        this.musicTimer = setInterval(function () { s.scheduleMusic(); }, 400);
    },

    stopMusic: function () {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
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

    CALL_FIRST_MS: 50000,        // first incoming call
    CALL_GAP_MIN_MS: 60000,      // then every 60-100s
    CALL_GAP_MAX_MS: 100000,
    CALL_RING_FRAMES: 480,       // gives up after ~8 seconds
    CALL_ANSWER_STUN: 150,       // ~2.5s trapped if you answer

    STORM_FIRST_MS: 35000,       // first reply-all storm
    STORM_GAP_MIN_MS: 45000,     // then every 45-75s
    STORM_GAP_MAX_MS: 75000,
    STORM_FRAMES: 360,           // ~6 seconds of chaos
    STORM_AIR_FACTOR: 0.3,       // spawn gaps shrink to 30% during a storm

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
    pm: null,
    decoy: null,
    report: null,
    messages: [],
    particles: [],
    pickups: [],
    buffTimer: 0,
    reportDropQueued: false,
    storm: 0,
    nextStormAt: 0,
    call: null,
    nextCallAt: 0,
    bossPhase: 0,
    boss2: null,
    intern: null,
    hr: null,
    dndTimer: 0,
    lastSeen: null,
    combo: 0,
    comboTimer: 0,
    daily: false,
    avatarIdx: 0,
    avatarPal: AVATARS[0]
};

/* --------------------------------------------------------------------------
   Boot / DOM setup
   -------------------------------------------------------------------------- */

function initials(name) {
    return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
}

function paintAvatarPreview(ctx, pal) {
    ctx.lineCap = 'round';
    ctx.translate(22, 4);
    // Legs
    ctx.strokeStyle = pal.pants;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-4, 34); ctx.lineTo(-4, 48);
    ctx.moveTo(4, 34);  ctx.lineTo(4, 48);
    ctx.stroke();
    // Arms
    ctx.strokeStyle = pal.shirt;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-5, 19); ctx.lineTo(-8, 30);
    ctx.moveTo(5, 19);  ctx.lineTo(8, 30);
    ctx.stroke();
    // Torso
    ctx.fillStyle = pal.shirt;
    roundRect(ctx, -8, 15, 16, 20, 4);
    ctx.fill();
    // Head
    ctx.fillStyle = pal.skin;
    ctx.beginPath();
    ctx.arc(0, 8, 7.5, 0, Math.PI * 2);
    ctx.fill();
    // Hair
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.arc(0, 6.5, 7.5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#242424';
    ctx.beginPath();
    ctx.arc(-2.5, 8, 1.2, 0, Math.PI * 2);
    ctx.arc(2.5, 8, 1.2, 0, Math.PI * 2);
    ctx.fill();
}

function buildAvatarPicker() {
    const wrap = document.getElementById('avatar-pick');
    AVATARS.forEach(function (pal, i) {
        const btn = document.createElement('button');
        btn.className = 'avatar-opt' + (i === state.avatarIdx ? ' active' : '');
        btn.title = pal.name;
        const cnv = document.createElement('canvas');
        cnv.width = 88;
        cnv.height = 112;
        cnv.style.width = '44px';
        cnv.style.height = '56px';
        const c = cnv.getContext('2d');
        c.scale(2, 2);
        paintAvatarPreview(c, pal);
        btn.appendChild(cnv);
        btn.addEventListener('click', function () {
            state.avatarIdx = i;
            state.avatarPal = pal;
            localStorage.setItem('office-break-avatar', String(i));
            document.querySelectorAll('.avatar-opt').forEach(function (b, j) {
                b.classList.toggle('active', j === i);
            });
        });
        wrap.appendChild(btn);
    });
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

    loadAchievements();
    state.avatarIdx = Math.abs(parseInt(localStorage.getItem('office-break-avatar') || '0', 10)) % AVATARS.length;
    state.avatarPal = AVATARS[state.avatarIdx];
    buildAvatarPicker();

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

    document.getElementById('daily-btn').addEventListener('click', function () {
        state.daily = !state.daily;
        document.getElementById('daily-btn').classList.toggle('active', state.daily);
        document.querySelectorAll('.diff-btn[data-diff]').forEach(function (b) {
            b.disabled = state.daily;
            b.style.opacity = state.daily ? 0.45 : 1;
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
    document.getElementById('call-decline').addEventListener('click', function () {
        if (state.call) {
            endCall('declined');
            award('not-now');
        }
    });
    document.getElementById('call-accept').addEventListener('click', function () {
        if (state.call) endCall('answered');
    });
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
        if ((e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
            state.reportDropQueued = true;
            return;
        }
        if (e.code === 'KeyC' && !e.repeat && state.call) {
            endCall('declined');
            award('not-now');
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
    bind('tc-down',
        function () { state.keys.ArrowDown = true; },
        function () { state.keys.ArrowDown = false; });
    bind('tc-report',
        function () { if (state.running && !state.paused) state.reportDropQueued = true; },
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
    Sound.startMusic();
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
    if (state.daily) {
        const d = new Date();
        const seedStr = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
        layoutRand = mulberry32(seedStr);
        state.diff = 'standard';   // dailies are a level playing field
        showToast('📅 Daily challenge', 'Everyone gets this exact chat today');
    } else {
        layoutRand = Math.random;
    }
    state.nextSpawnGap = lrandRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
    state.score = 0;
    state.shake = 0;
    state.keys = {};
    state.jumpQueued = false;
    state.messages = [];
    state.particles = [];
    state.pickups = [];
    state.buffTimer = 0;
    state.pm = null;
    state.decoy = null;
    state.report = null;
    state.reportDropQueued = false;
    state.storm = 0;
    state.nextStormAt = CONFIG.STORM_FIRST_MS;
    state.call = null;
    state.nextCallAt = CONFIG.CALL_FIRST_MS;
    state.bossPhase = 0;
    state.boss2 = null;
    state.intern = null;
    state.hr = null;
    state.dndTimer = 0;
    state.lastSeen = null;
    state.combo = 0;
    state.comboTimer = 0;
    document.getElementById('call-card').classList.add('hidden');
    state.avatarPal = AVATARS[state.avatarIdx] || AVATARS[0];

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
        squash: 0,
        stun: 0,
        airJump: 0,
        dropIgnore: null,
        lastLanding: null
    };

    state.boss = {
        variant: 'boss',
        speedScale: 1,
        shoutText: 'GET BACK TO WORK!',
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

    let y = first.y + first.h + lrandRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
    while (y < state.H + 60) {
        const m = createMessage(y);
        state.messages.push(m);
        y = m.y + m.h + lrandRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
    }

    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = requestAnimationFrame(gameLoop);
}

// Generate a performance review from how the run actually went
function performanceReview(finalScore, reason) {
    const s = state.stats;
    const strengths = [];
    const growth = [];

    if (s.hops >= 30) strengths.push('relentless descent');
    else if (s.hops >= 12) strengths.push('adequate downward mobility');
    else growth.push('message-to-message agility');

    if (s.smashed >= 8) strengths.push('withstanding managerial demolition');
    else if (s.smashed <= 2) strengths.push('conflict avoidance');

    if (state.bossPhase >= 2) strengths.push('surviving escalations');
    if (finalScore >= 1000) strengths.push('sheer stamina');
    if (finalScore < 200) growth.push('remaining employed');

    if (reason.indexOf('fell') !== -1) growth.push('looking before leaping');
    else if (reason.indexOf('archive') !== -1) growth.push('time management');
    else if (reason.indexOf('caught') !== -1) growth.push('exit interviews');

    if (!strengths.length) strengths.push('enthusiasm');
    if (!growth.length) growth.push('nothing — see you at the top');

    const rating = finalScore >= 1500 ? '5/5 — promoted (more meetings)'
        : finalScore >= 800 ? '4/5 — exceeds expectations'
        : finalScore >= 400 ? '3/5 — meets some expectations'
        : finalScore >= 150 ? '2/5 — growth mindset encouraged'
        : '1/5 — see me.';

    return 'Strengths: ' + strengths.slice(0, 2).join(', ') +
        '. Growth areas: ' + growth.slice(0, 2).join(', ') +
        '. Rating: ' + rating;
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
    Sound.stopMusic();
    state.call = null;
    document.getElementById('call-card').classList.add('hidden');
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
    document.getElementById('go-review').textContent = performanceReview(final, reason);
    award('first-run');
    if ((performance.now() - state.startTime) / 1000 >= 60) award('survive-60');
    if (state.daily) award('routine');
    document.getElementById('game-over').classList.remove('hidden');
    showLeaderboardFlow(final);
}

/* --------------------------------------------------------------------------
   Messages (platforms)
   -------------------------------------------------------------------------- */

function randRange(min, max) {
    return min + Math.random() * (max - min);
}

/* Layout randomness runs through its own stream so Daily Challenge mode can
   seed it from the date — everyone gets the identical chat that day. */
function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

let layoutRand = Math.random;

function lrand() { return layoutRand(); }
function lpick(arr) { return arr[Math.floor(layoutRand() * arr.length)]; }
function lrandRange(min, max) { return min + layoutRand() * (max - min); }

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
    // During a reply-all storm everyone sends the same useless one-liners
    if (state.storm > 0) {
        return { type: 'text', size: 'short', text: lpick(STORM_REPLIES) };
    }
    const roll = lrand();
    if (own) {
        if (roll < 0.55) return { type: 'text', size: 'short', text: lpick(SHORT_REPLIES) };
        if (roll < 0.85) return { type: 'text', size: 'medium', text: lpick(CORPORATE_PHRASES) };
        return { type: 'gif', size: 'media', text: lpick(GIF_CAPTIONS) };
    }
    if (roll < 0.24) return { type: 'text', size: 'short', text: lpick(SHORT_REPLIES) };
    if (roll < 0.52) return { type: 'text', size: 'medium', text: lpick(CORPORATE_PHRASES) };
    if (roll < 0.68) {
        let text = lpick(CORPORATE_PHRASES) + '. ' + lpick(CORPORATE_PHRASES);
        if (lrand() < 0.35) text += '. ' + lpick(CORPORATE_PHRASES);
        return { type: 'text', size: 'long', text: text };
    }
    if (roll < 0.80) return { type: 'gif', size: 'media', text: lpick(GIF_CAPTIONS) };
    if (roll < 0.88) return { type: 'chart', size: 'media', text: lpick(CHART_TITLES) };
    if (roll < 0.94) {
        // Urgent messages rise through the chat faster than everything else
        return { type: 'text', size: 'medium', text: lpick(URGENT_MESSAGES), urgent: true };
    }
    // Meeting invites: wide card, the most generous platform in the game
    return { type: 'invite', size: 'invite', text: lpick(MEETING_TITLES), meetTime: lpick(MEETING_TIMES) };
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

function createMessage(y, forced) {
    const own = forced ? false : lrand() < 0.28;
    const sender = forced ? forced.sender
        : (own ? YOU : COLLEAGUES[Math.floor(lrand() * COLLEAGUES.length)]);
    const content = forced ? forced.content : pickMessageContent(own);

    // Meeting invites are their own wide-card layout
    if (content.type === 'invite') {
        const w = clamp(state.W * 0.6 + lrand() * state.W * 0.12, 300, state.W * 0.8);
        const h = 88;
        const x = clamp(64 + lrand() * Math.max(1, state.W - w - 100), 24, Math.max(24, state.W - w - 24));
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
    const mediaW = content.type === 'gif' ? 150 + lrand() * 60
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
        ? clamp(state.W - 24 - w - lrand() * 70, 64, state.W - 24 - w)
        : 64 + lrand() * 90;

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
        gifHue: Math.floor(lrand() * 360),
        bars: [0.4, 0.75, 0.55, 0.9, 0.65].map(function (b) { return b * (0.6 + lrand() * 0.5); })
    };
}

function spawnFromBottom() {
    // Every now and then a project manager rides in on their own message.
    // They can't leave it — but they'll pace along it to corner you.
    if (!state.pm && lrand() < 0.08) {
        spawnPM(state.H + 12);
        return;
    }

    const m = createMessage(state.H + 12);
    state.messages.push(m);

    // HR occasionally rides in too: slow, polite, and legally binding
    if (!state.hr && lrand() < 0.05) {
        const hm = createMessage(state.H + 12, {
            sender: HR_SENDER,
            content: { type: 'text', size: 'medium', text: lpick(HR_PHRASES) }
        });
        state.messages.push(hm);
        state.hr = {
            m: hm,
            x: hm.x + hm.w / 2 - 12,
            w: 24, h: 44,
            facing: 1,
            animPhase: 0,
            actCooldown: 0,
            sayUntil: 0,
            sayText: ''
        };
        return;
    }

    // The intern scurries in occasionally: friendly, quick, drops supplies
    if (!state.intern && lrand() < 0.06) {
        state.intern = {
            x: m.x + 10,
            y: m.y - 40,
            w: 24, h: 40,
            vx: (lrand() < 0.5 ? -1 : 1) * 2.6,
            vy: 0,
            grounded: true,
            platform: m,
            dropCooldown: 200,
            hopCooldown: 150,
            animPhase: 0,
            sayUntil: 0,
            sayCooldown: 0
        };
    }

    // Occasionally a pickup rides in on the message: coffee (speed + double
    // jump) or a document (becomes a boss-distracting report).
    if (lrand() < 0.09 && !state.pickups.some(function (p) { return p.type === 'coffee'; }) &&
        state.buffTimer <= 0) {
        state.pickups.push({ type: 'coffee', m: m, ox: 20 + lrand() * Math.max(10, m.w - 40) });
    } else if (lrand() < 0.09 && !state.pickups.some(function (p) { return p.type === 'doc'; }) &&
        !state.report && !state.decoy) {
        state.pickups.push({ type: 'doc', m: m, ox: 20 + lrand() * Math.max(10, m.w - 40) });
    } else if (lrand() < 0.045 && !state.pickups.some(function (p) { return p.type === 'dnd'; }) &&
        state.dndTimer <= 0) {
        state.pickups.push({ type: 'dnd', m: m, ox: 20 + lrand() * Math.max(10, m.w - 40) });
    }
}

function spawnPM(y) {
    const m = createMessage(y, {
        sender: PM_SENDER,
        content: { type: 'text', size: 'medium', text: lpick(PM_PHRASES) }
    });
    state.messages.push(m);
    state.pm = {
        m: m,
        x: m.x + m.w / 2 - 13,
        w: 26, h: 46,
        facing: 1,
        animPhase: 0,
        stunCooldown: 0,
        sayUntil: 0,
        sayText: ''
    };
    return state.pm;
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
        const pool = state.bossPhase >= 1 && Math.random() < 0.5 ? BOSS_QUOTES_ANGRY : BOSS_QUOTES;
        state.boss.quote = pick(pool);
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
    // Reply-all storm: periodic bursts where the chat floods with tiny replies
    if (state.storm > 0) {
        state.storm -= t;
    } else if (elapsedSec * 1000 >= state.nextStormAt) {
        state.storm = CONFIG.STORM_FRAMES;
        state.nextStormAt = elapsedSec * 1000 +
            lrandRange(CONFIG.STORM_GAP_MIN_MS, CONFIG.STORM_GAP_MAX_MS);
        showToast('📣 Someone hit Reply All!', 'Brace for the flood…');
        Sound.tone(880, 0.12, 'square', 0.05, 660);
    }
    // ...and the whole chat scrolls faster while it rages
    if (state.storm > 0) state.scrollSpeed *= 1.5;
    const stormFactor = state.storm > 0 ? CONFIG.STORM_AIR_FACTOR : 1;
    const airNeeded = state.nextSpawnGap * timeShrink * stormFactor /
        (1 + depth * CONFIG.SPAWN_DEPTH_BOOST);
    if (lowestBottom + airNeeded <= state.H + 12) {
        state.nextSpawnGap = lrandRange(CONFIG.SPAWN_AIR_MIN, CONFIG.SPAWN_AIR_MAX);
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

    // A project manager has you cornered: no input until they finish
    if (p.stun > 0) {
        p.stun -= t;
        state.jumpQueued = false;
        p.vx *= Math.pow(0.6, t);
    }

    // Horizontal movement
    let ax = 0;
    if (p.stun <= 0) {
        if (state.keys.ArrowLeft || state.keys.KeyA) ax -= CONFIG.MOVE_ACCEL;
        if (state.keys.ArrowRight || state.keys.KeyD) ax += CONFIG.MOVE_ACCEL;
    }
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

    // Down: drop through the platform you're standing on
    if ((state.keys.ArrowDown || state.keys.KeyS) && p.grounded && p.stun <= 0) {
        p.dropIgnore = p.platform;
        p.grounded = false;
        p.platform = null;
        p.coyote = 0;
        p.vy = Math.max(p.vy, 1.5);
    }
    if (p.dropIgnore &&
        (state.messages.indexOf(p.dropIgnore) === -1 || p.y > p.dropIgnore.y + p.dropIgnore.h)) {
        p.dropIgnore = null;
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
                if (m === p.dropIgnore) continue;
                if (p.x + p.w > m.x + 2 && p.x < m.x + m.w - 2 &&
                    prevBottom <= m.prevY + 1 && newBottom >= m.y - 1) {
                    if (p.vy > 6) {
                        p.squash = clamp(p.vy, 6, 14);
                        spawnDust(p.x + p.w / 2, m.y, 5);
                        Sound.land();
                    }
                    if (m !== p.lastLanding) {
                        // Combo: keep landing on LOWER platforms to build it
                        const prev = p.lastLanding;
                        const lower = !prev || state.messages.indexOf(prev) === -1 ||
                            m.y > prev.y + 10;
                        if (lower) {
                            state.combo++;
                            state.comboTimer = 150;   // 2.5s to find the next one
                            if (state.combo >= 2) {
                                state.particles.push({
                                    x: p.x + p.w / 2, y: m.y - 8,
                                    vx: 0, vy: -1.1, size: 0, rot: 0, vr: 0,
                                    life: 1, text: '×' + state.combo
                                });
                            }
                        }
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

    // Pickups ride their message; walk into one to grab it
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
            if (pk.type === 'doc') {
                state.report = { phase: 'writing', t: 600 };   // 10 seconds
                Sound.tone(520, 0.1, 'triangle', 0.06, 700);
                showToast('📄 Document collected', 'Writing the report…');
            } else if (pk.type === 'dnd') {
                state.dndTimer = 300;   // 5 seconds of invisibility
                state.lastSeen = { x: p.x, y: p.y, w: p.w, h: p.h, platform: p.platform };
                Sound.tone(360, 0.2, 'sine', 0.06, 240);
                showToast('🔕 Do Not Disturb', 'Management can’t see you for 5 seconds');
                award('left-on-read');
            } else {
                state.buffTimer = 360;   // ~6 seconds
                p.airJump = 1;
                Sound.tone(660, 0.1, 'triangle', 0.06, 990);
                showToast('☕ Coffee!', 'Speed up + one mid-air jump');
            }
        }
    }
    if (state.buffTimer > 0) {
        state.buffTimer -= t;
        if (state.buffTimer <= 0) p.airJump = 0;
    }
    if (state.dndTimer > 0) {
        state.dndTimer -= t;
        if (state.dndTimer <= 0) state.lastSeen = null;
    }
    if (state.comboTimer > 0) {
        state.comboTimer -= t;
        if (state.comboTimer <= 0) state.combo = 0;
    }

    // Report: ten seconds of frantic typing, then it's ready to deploy
    if (state.report && state.report.phase === 'writing') {
        state.report.t -= t;
        if (state.report.t <= 0) {
            state.report = { phase: 'ready' };
            Sound.tone(760, 0.15, 'triangle', 0.07);
            showToast('📄 Report finished!', 'Press X (or 📄) to drop it as a decoy');
        }
    }
    if (state.reportDropQueued) {
        state.reportDropQueued = false;
        if (state.report && state.report.phase === 'ready' && !state.decoy) {
            state.report = null;
            state.decoy = {
                x: p.x + p.w / 2 - 9,
                y: p.y + p.h - 22,
                w: 18, h: 22,
                vy: 0,
                grounded: p.grounded,
                platform: p.platform,
                timer: 300   // distracts the boss for 5 seconds
            };
            Sound.tone(300, 0.12, 'square', 0.05, 180);
            showToast('📄 Report deployed', 'The boss can’t resist unread documents');
            award('delegation');
        }
    }

    // Lose conditions tied to the player
    if (p.y > state.H + 30) {
        endGame('You fell out of the chat.');
    } else if (p.y + p.h < 6) {
        endGame('You got scrolled into the archive.');
    }
}

function updateBossObj(b, t, now, elapsedSec) {
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
    const phaseBoost = state.bossPhase >= 2 ? 0.7 : state.bossPhase >= 1 ? 0.35 : 0;
    b.runSpeed = (Math.min(CONFIG.BOSS_RUN_MAX,
        (CONFIG.BOSS_RUN_SPEED + elapsedSec * CONFIG.BOSS_RAMP * bdiff.ramp) * bdiff.boss) +
        phaseBoost) * b.speedScale;
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
        award('stairs');
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
        checkBossCatch(b);
        return;
    }

    /* --- Normal mode: same platform physics as the player --- */

    // A freshly dropped report is irresistible — chase it instead of the
    // player until it expires. On Do Not Disturb, he can only hunt the
    // spot where he last saw you.
    const tgt = state.decoy || (state.dndTimer > 0 && state.lastSeen ? state.lastSeen : p);
    const reading = state.decoy &&
        b.x + b.w > state.decoy.x - 12 && b.x < state.decoy.x + state.decoy.w + 12 &&
        b.y + b.h > state.decoy.y - 20 && b.y < state.decoy.y + state.decoy.h + 20;

    const prevBottom = b.y + b.h;
    const dx = (tgt.x + tgt.w / 2) - (b.x + b.w / 2);

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
            b.smashCooldown = Math.max(30, CONFIG.BOSS_SMASH_COOLDOWN - state.bossPhase * 8);
            b.smashPose = 16;
        }
    } else if (reading) {
        // Engrossed in the report — stands still, reads
        b.vx *= Math.pow(0.6, t);
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

    if (b.grounded && b.windup <= 0 && b.smashCooldown <= 0 && !reading) {
        if (tgt.y > b.y + b.h + 20 && b.platform !== tgt.platform) {
            // Target is below: smash through the floor to follow
            b.windup = CONFIG.BOSS_WINDUP - state.bossPhase * 3;
        } else if (tgt.y + tgt.h < b.y - 60 && Math.abs(dx) < 220) {
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

    checkBossCatch(b);
}

/* --------------------------------------------------------------------------
   Incoming calls — an opaque call card covers part of the play area until
   you decline it (C or the ✕), it rings out, or you make the mistake of
   answering.
   -------------------------------------------------------------------------- */

function startCall(elapsedMs) {
    const c = COLLEAGUES[Math.floor(Math.random() * COLLEAGUES.length)];
    state.call = { name: c.name, t: CONFIG.CALL_RING_FRAMES, ring: 0 };
    state.nextCallAt = elapsedMs + randRange(CONFIG.CALL_GAP_MIN_MS, CONFIG.CALL_GAP_MAX_MS);
    const card = document.getElementById('call-card');
    document.getElementById('call-name').textContent = c.name;
    const av = document.getElementById('call-avatar');
    av.textContent = initials(c.name);
    av.style.background = c.color;
    // Random horizontal spot so it hides a different slice of chat each time
    card.style.left = Math.round(15 + Math.random() * 55) + '%';
    card.classList.remove('hidden');
}

function endCall(kind) {
    const c = state.call;
    state.call = null;
    document.getElementById('call-card').classList.add('hidden');
    if (!c) return;
    if (kind === 'missed') {
        showToast('📞 Missed call — ' + c.name, 'They will definitely mention this later');
    } else if (kind === 'answered') {
        state.player.stun = CONFIG.CALL_ANSWER_STUN;
        showToast('📞 You answered?!', 'This meeting could have been an email');
        Sound.tone(220, 0.3, 'sawtooth', 0.06, 130);
    }
}

function updateCall(t, elapsedSec) {
    if (state.call) {
        state.call.t -= t;
        state.call.ring -= t;
        if (state.call.ring <= 0) {
            state.call.ring = 90;
            Sound.tone(740, 0.18, 'sine', 0.05);
            setTimeout(function () { Sound.tone(880, 0.22, 'sine', 0.05); }, 220);
        }
        if (state.call.t <= 0) endCall('missed');
    } else if (elapsedSec * 1000 >= state.nextCallAt) {
        startCall(elapsedSec * 1000);
    }
}

// HR: platform-bound like the PM but slower. If she catches you holding
// a report — in progress or finished — it's confiscated. Proper channels.
function updateHR(t) {
    const hr = state.hr;
    if (!hr) return;
    const p = state.player;

    if (state.messages.indexOf(hr.m) === -1 || hr.m.y + hr.m.h < -20) {
        state.hr = null;
        return;
    }

    const target = clamp(p.x + p.w / 2 - hr.w / 2, hr.m.x + 3, hr.m.x + hr.m.w - hr.w - 3);
    const step = clamp(target - hr.x, -1.1 * t, 1.1 * t);
    hr.x += step;
    if (Math.abs(step) > 0.15) {
        hr.facing = step > 0 ? 1 : -1;
        hr.animPhase += Math.abs(step) * 0.09;
    }
    hr.y = hr.m.y - hr.h;

    if (hr.actCooldown > 0) hr.actCooldown -= t;
    const touching = p.x + p.w > hr.x + 4 && p.x < hr.x + hr.w - 4 &&
        p.y + p.h > hr.y + 6 && p.y < hr.y + hr.h - 4;
    if (touching && hr.actCooldown <= 0) {
        hr.actCooldown = 220;
        if (state.report) {
            state.report = null;
            hr.sayText = pick(HR_LINES);
            hr.sayUntil = performance.now() + 1600;
            showToast('🗂️ Report confiscated', 'That needs to go through the proper channels');
            Sound.tone(240, 0.25, 'sawtooth', 0.05, 140);
        } else {
            hr.sayText = pick(HR_LINES_IDLE);
            hr.sayUntil = performance.now() + 1300;
        }
    }
}

// The intern: friendly, oblivious, sprinting across the chat dropping
// coffee and documents behind them. Falls off edges, lands below, and
// eventually scurries out of frame.
function updateIntern(t) {
    const n = state.intern;
    if (!n) return;
    const p = state.player;

    n.animPhase += Math.abs(n.vx) * 0.07 * t;
    n.x += n.vx * t;
    if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx); }
    if (n.x > state.W - n.w) { n.x = state.W - n.w; n.vx = -Math.abs(n.vx); }

    if (n.hopCooldown > 0) n.hopCooldown -= t;

    // At a platform edge: turn around, unless a platform waits below within
    // a comfortable drop — then (occasionally) hop down on purpose.
    if (n.grounded && n.platform && !n.dropping) {
        const m = n.platform;
        const pastRight = n.vx > 0 && n.x + n.w > m.x + m.w - 2;
        const pastLeft = n.vx < 0 && n.x < m.x + 2;
        if (pastRight || pastLeft) {
            const dropSafe = state.messages.some(function (mm) {
                return mm !== m && mm.y > m.y && mm.y - m.y < 220 &&
                    mm.y < state.H - 30 &&
                    n.x + n.w > mm.x && n.x < mm.x + mm.w;
            });
            if (dropSafe && n.hopCooldown <= 0) {
                n.hopCooldown = 260;
                n.dropping = true;   // committed: no snap-back until we land
            } else {
                n.vx = -n.vx;
                n.x = pastRight ? m.x + m.w - n.w - 2 : m.x + 2;
            }
        }
    }

    const prevBottom = n.y + n.h;
    if (n.grounded) {
        const m = n.platform;
        const stillThere = m && state.messages.indexOf(m) !== -1 &&
            n.x + n.w > m.x + 2 && n.x < m.x + m.w - 2;
        if (stillThere) {
            n.y = m.y - n.h;
            n.vy = 0;
        } else {
            n.grounded = false;
            n.platform = null;
        }
    }
    if (!n.grounded) {
        n.vy += CONFIG.GRAVITY * t;
        n.y += n.vy * t;
        if (n.vy >= 0) {
            for (let i = 0; i < state.messages.length; i++) {
                const m = state.messages[i];
                if (n.x + n.w > m.x + 2 && n.x < m.x + m.w - 2 &&
                    prevBottom <= m.prevY + 1 && n.y + n.h >= m.y - 1) {
                    n.y = m.y - n.h;
                    n.vy = 0;
                    n.grounded = true;
                    n.platform = m;
                    n.dropping = false;
                    break;
                }
            }
        }
    }

    // Drop a pickup behind them now and then
    if (n.dropCooldown > 0) n.dropCooldown -= t;
    if (n.grounded && n.dropCooldown <= 0 && state.pickups.length < 2) {
        const canDoc = !state.report && !state.decoy &&
            !state.pickups.some(function (pk) { return pk.type === 'doc'; });
        const type = canDoc && Math.random() < 0.4 ? 'doc' : 'coffee';
        state.pickups.push({
            type: type,
            m: n.platform,
            ox: clamp(n.x + n.w / 2 - n.platform.x, 12, n.platform.w - 12)
        });
        n.dropCooldown = 260;
        Sound.tone(600, 0.06, 'triangle', 0.03, 750);
    }

    // A cheery word for a passing colleague
    if (n.sayCooldown > 0) n.sayCooldown -= t;
    const near = Math.abs((p.x + p.w / 2) - (n.x + n.w / 2)) < 70 &&
        Math.abs(p.y - n.y) < 60;
    if (near && n.sayCooldown <= 0) {
        n.sayUntil = performance.now() + 1200;
        n.sayCooldown = 300;
    }

    // Scurried out of frame
    if (n.y > state.H + 60 || n.y + n.h < -20) state.intern = null;
}

// The project manager paces along their own message, tracking the player.
// Touch them and you're trapped in a quick sync for a moment.
function updatePM(t) {
    const pm = state.pm;
    if (!pm) return;
    const p = state.player;

    if (state.messages.indexOf(pm.m) === -1 || pm.m.y + pm.m.h < -20) {
        state.pm = null;
        return;
    }

    const seen = state.dndTimer <= 0;
    const target = seen
        ? clamp(p.x + p.w / 2 - pm.w / 2, pm.m.x + 3, pm.m.x + pm.m.w - pm.w - 3)
        : pm.x;
    const dx = target - pm.x;
    const step = clamp(dx, -2.1 * t, 2.1 * t);
    pm.x += step;
    if (Math.abs(step) > 0.2) {
        pm.facing = step > 0 ? 1 : -1;
        pm.animPhase += Math.abs(step) * 0.09;
    }
    pm.y = pm.m.y - pm.h;

    if (pm.stunCooldown > 0) pm.stunCooldown -= t;
    if (seen && pm.stunCooldown <= 0 && p.stun <= 0 &&
        p.x + p.w > pm.x + 4 && p.x < pm.x + pm.w - 4 &&
        p.y + p.h > pm.y + 6 && p.y < pm.y + pm.h - 4) {
        p.stun = 55;                 // ~0.9s of forced status update
        pm.stunCooldown = 180;
        pm.sayText = pick(PM_STUN_LINES);
        pm.sayUntil = performance.now() + 1400;
        award('synergized');
        Sound.tone(440, 0.18, 'sine', 0.06, 380);
    }
}

// The deployed report: sits (or falls) where you left it and soaks up the
// boss's attention until it expires.
function updateDecoy(t) {
    const d = state.decoy;
    if (!d) return;

    d.timer -= t;
    if (d.timer <= 0) {
        for (let i = 0; i < 8; i++) {
            state.particles.push({
                x: d.x + Math.random() * d.w,
                y: d.y + Math.random() * d.h,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                size: 3 + Math.random() * 4,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.3,
                life: 1,
                color: '#ffffff'
            });
        }
        if (state.boss && state.boss.chasing) {
            state.boss.quote = 'TL;DR.';
            state.boss.quoteUntil = performance.now() + 1400;
        }
        state.decoy = null;
        return;
    }

    const prevBottom = d.y + d.h;
    if (d.grounded) {
        const m = d.platform;
        const stillThere = m && state.messages.indexOf(m) !== -1 &&
            d.x + d.w > m.x && d.x < m.x + m.w;
        if (stillThere) {
            d.y = m.y - d.h;
        } else {
            d.grounded = false;
            d.platform = null;
        }
    }
    if (!d.grounded) {
        d.vy += CONFIG.GRAVITY * t;
        d.y += d.vy * t;
        if (d.vy >= 0) {
            for (let i = 0; i < state.messages.length; i++) {
                const m = state.messages[i];
                if (d.x + d.w > m.x && d.x < m.x + m.w &&
                    prevBottom <= m.prevY + 1 && d.y + d.h >= m.y - 1) {
                    d.y = m.y - d.h;
                    d.vy = 0;
                    d.grounded = true;
                    d.platform = m;
                    break;
                }
            }
        }
    }
    if (d.y > state.H + 40) state.decoy = null;
}

function checkBossCatch(b) {
    if (state.dndTimer > 0) return;   // he can't see you
    const p = state.player;
    const inset = 8;
    if (p.x + p.w > b.x + inset && p.x < b.x + b.w - inset &&
        p.y + p.h > b.y + inset && p.y < b.y + b.h - inset) {
        endGame(b.variant === 'skip'
            ? 'The skip-level manager caught you. Escalated.'
            : 'The boss caught you. Back to your desk.');
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
        if (!pt.emoji && !pt.text) pt.vy += (pt.dust ? 0.05 : 0.25) * t;   // reactions/labels float
        pt.rot += pt.vr * t;
        pt.life -= (pt.emoji ? 0.012 : pt.text ? 0.03 : pt.dust ? 0.045 : 0.025) * t;
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
    if (state.dndTimer > 0) ctx.globalAlpha = 0.55;   // ghosting past management
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

    const pal = state.avatarPal || AVATARS[0];
    const skin = pal.skin;
    const shirt = pal.shirt;
    const pants = pal.pants;

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
    ctx.fillStyle = pal.hair;
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

    // Presence dot: red DND while invisible
    if (state.dndTimer > 0) {
        ctx.fillStyle = '#c4314b';
        ctx.beginPath();
        ctx.arc(p.x + p.w - 2, p.y + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x + p.w - 4.2, p.y + 2);
        ctx.lineTo(p.x + p.w + 0.2, p.y + 2);
        ctx.stroke();
    }
}

function drawBossObj(b, now) {
    const ctx = state.ctx;
    if (b.mode === 'stairs') return;   // out of play, off the bottom
    const bob = b.grounded ? 0 : Math.sin(b.bobPhase) * 2;
    const angry = b.chasing;
    const armsUp = b.smashPose > 0 || b.windup > 0;

    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + bob);

    ctx.lineCap = 'round';

    const suit = b.variant === 'skip' ? '#4d4d57' : '#2b2b33';
    const tieColor = b.variant === 'skip' ? '#0078d4' : '#c4314b';
    const skinTone = angry ? '#e89a7e' : '#e8b48f';
    const sleevesRolled = state.bossPhase >= 2 && b.variant === 'boss';

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
        if (sleevesRolled) {
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = skinTone;
            ctx.lineWidth = 6;
            ctx.moveTo(-18, 35 + reach); ctx.lineTo(-22, 40 + reach);
            ctx.moveTo(18, 34 - reach);  ctx.lineTo(22, 38 - reach);
        }
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
    ctx.fillStyle = tieColor;
    ctx.beginPath();
    if (state.bossPhase >= 1 && b.variant === 'boss') {
        // Tie loosened and swung askew — he means business now
        ctx.moveTo(-2, 25); ctx.lineTo(2, 24); ctx.lineTo(7, 39); ctx.lineTo(5, 44); ctx.lineTo(1, 40);
    } else {
        ctx.moveTo(-2, 24); ctx.lineTo(2, 24); ctx.lineTo(3, 40); ctx.lineTo(0, 44); ctx.lineTo(-3, 40);
    }
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
        const text = b.shoutText;
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
        if (pt.emoji || pt.text) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, pt.life * 1.4));
            if (pt.text) {
                ctx.font = 'bold 15px "Segoe UI", sans-serif';
                ctx.fillStyle = '#6264a7';
            } else {
                ctx.font = '15px "Segoe UI", sans-serif';
            }
            ctx.textAlign = 'center';
            ctx.fillText(pt.emoji || pt.text, pt.x, pt.y);
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
        ctx.fillText(pk.type === 'doc' ? '📄' : '☕', pk.m.x + pk.ox, pk.m.y - 8 + bobble);
        ctx.textAlign = 'left';
    }

    // The deployed report decoy
    if (state.decoy) {
        const d = state.decoy;
        ctx.font = '20px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📄', d.x + d.w / 2, d.y + d.h - 3);
        ctx.textAlign = 'left';
    }

    // HUD pills (stacked top-left)
    let hudY = 12;
    function pill(text, color) {
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        const tw = ctx.measureText(text).width;
        roundRect(ctx, 12, hudY, tw + 20, 24, 12);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(text, 22, hudY + 17);
        hudY += 30;
    }
    if (state.buffTimer > 0) {
        pill('☕ ' + Math.ceil(state.buffTimer / 60) + 's · double jump', 'rgba(73, 130, 5, 0.92)');
    }
    if (state.report && state.report.phase === 'writing') {
        pill('📄 report due… ' + Math.ceil(state.report.t / 60) + 's', 'rgba(202, 80, 16, 0.92)');
    } else if (state.report && state.report.phase === 'ready') {
        pill('📄 report ready — X drops it', 'rgba(98, 100, 167, 0.95)');
    }
    if (state.decoy) {
        pill('📄 boss distracted ' + Math.ceil(state.decoy.timer / 60) + 's', 'rgba(196, 49, 75, 0.92)');
    }
    if (state.storm > 0) {
        pill('📣 reply-all storm! ' + Math.ceil(state.storm / 60) + 's', 'rgba(216, 59, 1, 0.92)');
    }
    if (state.dndTimer > 0) {
        pill('🔕 invisible ' + Math.ceil(state.dndTimer / 60) + 's', 'rgba(90, 90, 90, 0.92)');
    }
    if (state.combo >= 2) {
        pill('⚡ combo ×' + (1 + Math.min(state.combo, 20) * 0.1).toFixed(1), 'rgba(98, 100, 167, 0.95)');
    }
}

function drawHR(now) {
    const hr = state.hr;
    if (!hr) return;
    const ctx = state.ctx;
    const swing = Math.sin(hr.animPhase) * 0.5;

    ctx.save();
    ctx.translate(hr.x + hr.w / 2, hr.y);
    if (hr.facing < 0) ctx.scale(-1, 1);
    ctx.lineCap = 'round';

    // Legs
    ctx.strokeStyle = '#4b4b4b';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-3, 30); ctx.lineTo(-3 + swing * 4, 42);
    ctx.moveTo(3, 30);  ctx.lineTo(3 - swing * 4, 42);
    ctx.stroke();

    // Blazer
    ctx.fillStyle = '#8f2d56';
    roundRect(ctx, -8, 13, 16, 18, 4);
    ctx.fill();

    // A thick folder, held to the chest
    ctx.fillStyle = '#f0d9a8';
    ctx.strokeStyle = '#b8935a';
    ctx.lineWidth = 1.2;
    ctx.fillRect(3, 17, 9, 11);
    ctx.strokeRect(3, 17, 9, 11);

    // Head + neat bob haircut
    ctx.fillStyle = '#f0c9a0';
    ctx.beginPath();
    ctx.arc(0, 6.5, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4b2a';
    ctx.beginPath();
    ctx.arc(0, 5, 6.8, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();
    ctx.fillRect(-6.8, 5, 2.4, 7);
    ctx.fillRect(4.4, 5, 2.4, 7);
    ctx.fillStyle = '#f0c9a0';
    ctx.beginPath();
    ctx.arc(0, 7.5, 5, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#242424';
    ctx.beginPath();
    ctx.arc(2.6, 7, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (hr.sayUntil > now) {
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        const tw = ctx.measureText(hr.sayText).width;
        const bx = clamp(hr.x + hr.w / 2 - tw / 2 - 7, 6, state.W - tw - 20);
        roundRect(ctx, bx, hr.y - 20, tw + 14, 16, 8);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#8f2d56';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#8f2d56';
        ctx.fillText(hr.sayText, bx + 7, hr.y - 8);
    }
}

function drawIntern(now) {
    const n = state.intern;
    if (!n) return;
    const ctx = state.ctx;
    const swing = n.grounded ? Math.sin(n.animPhase) * 0.8 : 0.4;

    ctx.save();
    ctx.translate(n.x + n.w / 2, n.y);
    if (n.vx < 0) ctx.scale(-1, 1);
    ctx.lineCap = 'round';

    // Legs — always hustling
    ctx.strokeStyle = '#3f4c5c';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-2, 27); ctx.lineTo(-2 + swing * 7, 38);
    ctx.moveTo(2, 27);  ctx.lineTo(2 - swing * 7, 38);
    ctx.stroke();

    // Hoodie torso
    ctx.fillStyle = '#7a86c9';
    roundRect(ctx, -7, 11, 14, 17, 4);
    ctx.fill();
    // Stack of papers under one arm
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#c8c8c8';
    ctx.lineWidth = 1;
    ctx.fillRect(4, 16, 8, 10);
    ctx.strokeRect(4, 16, 8, 10);

    // Head
    ctx.fillStyle = '#e8b48f';
    ctx.beginPath();
    ctx.arc(0, 5, 6, 0, Math.PI * 2);
    ctx.fill();
    // Hair
    ctx.fillStyle = '#2f2f2f';
    ctx.beginPath();
    ctx.arc(0, 3.6, 6, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    // Headphones
    ctx.strokeStyle = '#242424';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 4, 7, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.fillStyle = '#242424';
    ctx.beginPath();
    ctx.arc(-6.4, 5.5, 2, 0, Math.PI * 2);
    ctx.arc(6.4, 5.5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#242424';
    ctx.beginPath();
    ctx.arc(2.8, 5.5, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (n.sayUntil > now) {
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        const text = 'good luck!!';
        const tw = ctx.measureText(text).width;
        const bx = clamp(n.x + n.w / 2 - tw / 2 - 7, 6, state.W - tw - 20);
        roundRect(ctx, bx, n.y - 20, tw + 14, 16, 8);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#498205';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#498205';
        ctx.fillText(text, bx + 7, n.y - 8);
    }
}

// The project manager: platform-bound, bespectacled, armed with a clipboard
function drawPM(now) {
    const pm = state.pm;
    if (!pm) return;
    const ctx = state.ctx;
    const swing = Math.sin(pm.animPhase) * 0.7;

    ctx.save();
    ctx.translate(pm.x + pm.w / 2, pm.y);
    if (pm.facing < 0) ctx.scale(-1, 1);
    ctx.lineCap = 'round';

    const skin = '#eab38a';
    const suit = '#5b5f97';

    // Legs
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-3, 32); ctx.lineTo(-3 + swing * 6, 44);
    ctx.moveTo(3, 32);  ctx.lineTo(3 - swing * 6, 44);
    ctx.stroke();

    // Torso
    ctx.fillStyle = suit;
    roundRect(ctx, -8, 14, 16, 19, 4);
    ctx.fill();
    // Lanyard
    ctx.strokeStyle = '#e3a008';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 15); ctx.lineTo(0, 24); ctx.lineTo(4, 15);
    ctx.stroke();

    // Clipboard held out front
    ctx.fillStyle = '#f5f5f5';
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(6, 18, 9, 12);
    ctx.strokeRect(6, 18, 9, 12);
    ctx.strokeStyle = '#bbb';
    ctx.beginPath();
    ctx.moveTo(8, 22); ctx.lineTo(13, 22);
    ctx.moveTo(8, 25); ctx.lineTo(13, 25);
    ctx.stroke();
    // Arm to the clipboard
    ctx.strokeStyle = suit;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(5, 17); ctx.lineTo(9, 20);
    ctx.stroke();

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, 7, 7, 0, Math.PI * 2);
    ctx.fill();
    // Hair with a bun
    ctx.fillStyle = '#3d2b1f';
    ctx.beginPath();
    ctx.arc(0, 5.5, 7, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-6, 2, 3, 0, Math.PI * 2);
    ctx.fill();
    // Glasses
    ctx.strokeStyle = '#242424';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(-2.5, 7, 2.2, 0, Math.PI * 2);
    ctx.moveTo(2.2, 7);
    ctx.arc(4.5, 7, 2.2, 0, Math.PI * 2);
    ctx.moveTo(-0.3, 7); ctx.lineTo(2.3, 7);
    ctx.stroke();

    ctx.restore();

    // Speech bubble while they've got you cornered
    if (pm.sayUntil > now) {
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        const tw = ctx.measureText(pm.sayText).width;
        const bx = clamp(pm.x + pm.w / 2 - tw / 2 - 8, 6, state.W - tw - 22);
        const by = pm.y - 24;
        roundRect(ctx, bx, by, tw + 16, 19, 9);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#d83b01';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#d83b01';
        ctx.textAlign = 'left';
        ctx.fillText(pm.sayText, bx + 8, by + 13);
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
    drawPM(now);
    drawHR(now);
    drawIntern(now);
    drawPlayer();
    drawBossObj(state.boss, now);
    if (state.boss2) drawBossObj(state.boss2, now);
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
            '<span class="lb-initials">' + String(s.initials).replace(/[<>&]/g, '') +
            (s.diff === 'daily' ? ' 📅' : '') + '</span>' +
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
   Boss escalation phases
   -------------------------------------------------------------------------- */

function onBossPhase(phase, now) {
    const b = state.boss;
    if (phase === 1) {
        showToast('👔 The boss loosens his tie', 'He is getting faster…');
        b.quote = 'WHO APPROVED THIS?';
        b.quoteUntil = now + 1600;
        Sound.shout();
    } else if (phase === 2) {
        showToast('💪 Sleeves are ROLLED UP', 'Telegraphs are shorter. Good luck.');
        b.quote = 'UNACCEPTABLE.';
        b.quoteUntil = now + 1600;
        Sound.shout();
    } else if (phase === 3 && !state.boss2) {
        state.boss2 = {
            variant: 'skip',
            speedScale: 0.88,
            shoutText: 'EXPLAIN YOURSELVES.',
            x: clamp(state.player.x + (Math.random() < 0.5 ? -220 : 220), 0, state.W - 46),
            y: -140,
            w: 46, h: 76,
            vx: 0, vy: 0,
            grounded: false,
            platform: null,
            mode: 'catchup',
            chasing: true,
            runSpeed: CONFIG.BOSS_RUN_SPEED,
            windup: 0,
            stairsTimer: 0,
            smashCooldown: 0,
            smashPose: 0,
            shoutUntil: now + CONFIG.BOSS_SHOUT_MS,
            quote: '',
            quoteUntil: 0,
            bobPhase: 0
        };
        showToast('🚨 Your skip-level manager has joined the chat', 'Two of them now. Run.');
        Sound.shout();
    }
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
    if (state.running) {
        updatePM(t);
        updateHR(t);
        updateIntern(t);
        updateDecoy(t);
        updateCall(t, elapsedSec);
        updateBossObj(state.boss, t, now, elapsedSec);
        if (state.running && state.boss2) updateBossObj(state.boss2, t, now, elapsedSec);
    }
    updateParticles(t);

    document.getElementById('tc-report').classList.toggle('hidden',
        !(state.report && state.report.phase === 'ready'));

    const comboMult = 1 + Math.min(state.combo, 20) * 0.1;
    state.score += CONFIG.POINTS_PER_SECOND * (t * 16.667 / 1000) * comboMult;
    document.getElementById('score').textContent = Math.floor(state.score);

    const milestone = Math.floor(state.score / 250);
    if (milestone > state.lastMilestone) {
        state.lastMilestone = milestone;
        showToast('\ud83c\udfc6 ' + (milestone * 250) + ' points', pick(MILESTONE_FLAVOR));
    }

    // Boss escalation phases
    const phase = state.score >= 2500 ? 3 : state.score >= 1500 ? 2 : state.score >= 750 ? 1 : 0;
    if (phase > state.bossPhase) {
        state.bossPhase = phase;
        onBossPhase(phase, now);
    }

    // Achievement checks that depend on live run state
    if (state.score >= 1000) award('score-1000');
    if (state.combo >= 5) award('cascade');
    if (state.stats.smashed >= 10) award('demolition');
    if (state.bossPhase >= 3) award('org-chart');

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
