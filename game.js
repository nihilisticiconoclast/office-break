// Office Break - Chat Runner Game
// Player runs down an endless chat window while avoiding the boss

// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    PLAYER_SIZE: 40,
    PLAYER_SPEED: 8,
    PLAYER_COLOR: '#e94560',
    BOSS_SIZE: 60,
    BOSS_SPEED: 3,
    BOSS_COLOR: '#0f3460',
    MESSAGE_HEIGHT: 80,
    MESSAGE_MARGIN: 20,
    MESSAGE_SPACING: 120,
    MESSAGE_COLORS: ['#16213e', '#0f3460', '#1a1a2e', '#2a2a4a'],
    TEXT_COLORS: ['#e94560', '#ffffff', '#00ffaa', '#ffaa00'],
    SCROLL_SPEED: 2,
    MESSAGE_GENERATION_INTERVAL: 1500,
    POINTS_PER_SECOND: 10
};

// Game State
const state = {
    player: {
        x: CONFIG.CANVAS_WIDTH / 2,
        y: CONFIG.CANVAS_HEIGHT - 100,
        size: CONFIG.PLAYER_SIZE,
        speed: CONFIG.PLAYER_SPEED,
        color: CONFIG.PLAYER_COLOR
    },
    boss: {
        x: CONFIG.CANVAS_WIDTH / 2,
        y: 50,
        size: CONFIG.BOSS_SIZE,
        speed: CONFIG.BOSS_SPEED,
        color: CONFIG.BOSS_COLOR,
        chasing: false,
        smashCooldown: 0
    },
    messages: [],
    score: 0,
    gameOver: false,
    lastMessageTime: 0,
    startTime: 0,
    canvas: null,
    ctx: null
};

// Corporate nonsense generator
const CORPORATE_PHRASES = [
    "Let's circle back on this",
    "We need to leverage our synergies",
    "Moving forward, we should",
    "At the end of the day",
    "Low hanging fruit",
    "Quick win",
    "Blue sky thinking",
    "Out of the box",
    "Boil the ocean",
    "Drill down into",
    "Actionable insights",
    "Key takeaways",
    "Bandwidth constraints",
    "Value proposition",
    "Paradigm shift",
    "Core competencies",
    "Strategic alignment",
    "Stakeholder engagement",
    "Deliverables",
    "KPIs and metrics"
];

const OFFICE_SPEAK = [
    "Per my last email...",
    "As discussed in the meeting",
    "Can we get this by EOD?",
    "This is blocking me",
    "Can I get a +1 on this?",
    "We need buy-in from leadership",
    "This is a P0",
    "Let's take this offline",
    "I'll ping you on Teams",
    "Can you send me the deck?",
    "We need to socialize this",
    "This is above my pay grade",
    "I'm looped in",
    "Let's sync on this",
    "What's the ETA?",
    "This is a hard stop"
];

const GIF_DESCRIPTIONS = [
    "sent a dancing cat GIF",
    "posted a 'This is fine' dog meme",
    "shared a 'Working hard' GIF",
    "sent a 'Monday mood' image",
    "posted a 'Teamwork' meme",
    "shared a 'Coffee time' GIF",
    "sent a 'Meeting that could have been an email' meme",
    "posted a 'TPS Report' reference"
];

const CHART_TYPES = [
    "Q3 Revenue Projections",
    "Customer Satisfaction Scores",
    "Bug Resolution Timeline",
    "Sprint Velocity Chart",
    "Market Share Analysis",
    "Resource Allocation Pie Chart",
    "ROI Calculation Spreadsheet"
];

function generateRandomMessage() {
    const type = Math.floor(Math.random() * 4);
    
    switch(type) {
        case 0:
            return {
                text: CORPORATE_PHRASES[Math.floor(Math.random() * CORPORATE_PHRASES.length)] + 
                      " " + OFFICE_SPEAK[Math.floor(Math.random() * OFFICE_SPEAK.length)],
                type: 'text',
                color: CONFIG.TEXT_COLORS[Math.floor(Math.random() * CONFIG.TEXT_COLORS.length)]
            };
        case 1:
            return {
                text: "@" + getRandomName() + " " + GIF_DESCRIPTIONS[Math.floor(Math.random() * GIF_DESCRIPTIONS.length)],
                type: 'gif',
                color: '#ffaa00'
            };
        case 2:
            return {
                text: "@" + getRandomName() + " uploaded: " + CHART_TYPES[Math.floor(Math.random() * CHART_TYPES.length)],
                type: 'chart',
                color: '#00ffaa'
            };
        case 3:
            return {
                text: getRandomName() + ": " + OFFICE_SPEAK[Math.floor(Math.random() * OFFICE_SPEAK.length)],
                type: 'text',
                color: CONFIG.TEXT_COLORS[Math.floor(Math.random() * CONFIG.TEXT_COLORS.length)]
            };
    }
}

function getRandomName() {
    const firstNames = ['Michael', 'Jennifer', 'David', 'Sarah', 'Robert', 'Emily', 'John', 'Lisa', 'James', 'Amanda'];
    const lastNames = ['Scott', 'Williams', 'Johnson', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
    return firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + 
           lastNames[Math.floor(Math.random() * lastNames.length)];
}

function getRandomTime() {
    const hours = Math.floor(Math.random() * 12) + 8;
    const minutes = Math.floor(Math.random() * 60);
    return hours + ':' + (minutes < 10 ? '0' : '') + minutes;
}

// Initialize game
function init() {
    state.canvas = document.getElementById('game-canvas');
    state.ctx = state.canvas.getContext('2d');
    
    state.canvas.width = CONFIG.CANVAS_WIDTH;
    state.canvas.height = CONFIG.CANVAS_HEIGHT;
    
    state.player.x = CONFIG.CANVAS_WIDTH / 2;
    state.player.y = CONFIG.CANVAS_HEIGHT - 100;
    state.boss.x = CONFIG.CANVAS_WIDTH / 2;
    state.boss.y = 50;
    state.boss.chasing = false;
    state.messages = [];
    state.score = 0;
    state.gameOver = false;
    state.startTime = Date.now();
    state.lastMessageTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
        addMessageAtPosition(
            CONFIG.CANVAS_HEIGHT - (i * CONFIG.MESSAGE_SPACING) - 100,
            generateRandomMessage()
        );
    }
    
    requestAnimationFrame(gameLoop);
    setupEventListeners();
}

function addMessageAtPosition(y, message) {
    const x = Math.random() * (CONFIG.CANVAS_WIDTH - 400) + 50;
    const width = Math.random() * 300 + 200;
    
    state.messages.push({
        x: x,
        y: y,
        width: width,
        height: CONFIG.MESSAGE_HEIGHT,
        message: message,
        speed: CONFIG.SCROLL_SPEED + Math.random() * 2
    });
    
    state.messages.sort((a, b) => a.y - b.y);
}

function addMessage() {
    const y = -CONFIG.MESSAGE_HEIGHT - Math.random() * 50;
    addMessageAtPosition(y, generateRandomMessage());
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (state.gameOver) {
            if (e.code === 'Space') {
                resetGame();
            }
            return;
        }
        
        switch(e.code) {
            case 'ArrowLeft':
                state.player.x -= state.player.speed;
                break;
            case 'ArrowRight':
                state.player.x += state.player.speed;
                break;
            case 'ArrowUp':
                state.player.y -= state.player.speed;
                break;
            case 'ArrowDown':
                state.player.y += state.player.speed;
                break;
        }
        
        state.player.x = Math.max(state.player.size / 2, Math.min(CONFIG.CANVAS_WIDTH - state.player.size / 2, state.player.x));
        state.player.y = Math.max(state.player.size / 2, Math.min(CONFIG.CANVAS_HEIGHT - state.player.size / 2, state.player.y));
    });
    
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    
    window.addEventListener('resize', () => {
        CONFIG.CANVAS_WIDTH = window.innerWidth;
        CONFIG.CANVAS_HEIGHT = window.innerHeight;
        state.canvas.width = CONFIG.CANVAS_WIDTH;
        state.canvas.height = CONFIG.CANVAS_HEIGHT;
    });
}

function resetGame() {
    document.getElementById('game-over').classList.add('hidden');
    init();
}

function gameOver() {
    state.gameOver = true;
    state.finalScore = Math.floor(state.score);
    document.getElementById('score').textContent = state.finalScore;
    document.getElementById('final-score').textContent = state.finalScore;
    document.getElementById('game-over').classList.remove('hidden');
}

function updateBoss() {
    if (state.gameOver) return;
    
    if (!state.boss.chasing && Date.now() - state.startTime > 3000) {
        state.boss.chasing = true;
    }
    
    if (state.boss.chasing) {
        const dx = state.player.x - state.boss.x;
        const dy = state.player.y - state.boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            state.boss.x += (dx / distance) * state.boss.speed;
            state.boss.y += (dy / distance) * state.boss.speed;
        }
        
        if (state.boss.smashCooldown > 0) {
            state.boss.smashCooldown--;
        }
        
        const collisionDistance = state.player.size / 2 + state.boss.size / 2;
        if (distance < collisionDistance) {
            gameOver();
        }
        
        if (state.boss.smashCooldown === 0 && Math.random() < 0.01) {
            smashMessages();
            state.boss.smashCooldown = 30;
        }
    }
}

function smashMessages() {
    for (let i = state.messages.length - 1; i >= 0; i--) {
        const msg = state.messages[i];
        const dx = msg.x - state.boss.x;
        const dy = msg.y - state.boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            state.messages.splice(i, 1);
        }
    }
}

function updateMessages() {
    if (state.gameOver) return;
    
    for (let i = 0; i < state.messages.length; i++) {
        state.messages[i].y += state.messages[i].speed;
    }
    
    const now = Date.now();
    if (now - state.lastMessageTime > CONFIG.MESSAGE_GENERATION_INTERVAL) {
        addMessage();
        state.lastMessageTime = now;
    }
    
    for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].y > CONFIG.CANVAS_HEIGHT + 100) {
            state.messages.splice(i, 1);
        }
    }
    
    state.score = (Date.now() - state.startTime) / 1000 * CONFIG.POINTS_PER_SECOND;
    document.getElementById('score').textContent = Math.floor(state.score);
}

function drawPlayer() {
    const ctx = state.ctx;
    
    ctx.fillStyle = state.player.color;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(state.player.x - 10, state.player.y - 5, 5, 0, Math.PI * 2);
    ctx.arc(state.player.x + 10, state.player.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y + 5, 8, 0, Math.PI, false);
    ctx.fill();
}

function drawBoss() {
    const ctx = state.ctx;
    
    ctx.fillStyle = state.boss.color;
    ctx.beginPath();
    ctx.arc(state.boss.x, state.boss.y, state.boss.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(state.boss.x - 15, state.boss.y - 10, 7, 0, Math.PI * 2);
    ctx.arc(state.boss.x + 15, state.boss.y - 10, 7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(state.boss.x - 15, state.boss.y - 10, 3, 0, Math.PI * 2);
    ctx.arc(state.boss.x + 15, state.boss.y - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(state.boss.x, state.boss.y + 10, 12, Math.PI, 0, false);
    ctx.stroke();
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(state.boss.x - 20, state.boss.y - 20);
    ctx.lineTo(state.boss.x - 10, state.boss.y - 25);
    ctx.moveTo(state.boss.x + 10, state.boss.y - 25);
    ctx.lineTo(state.boss.x + 20, state.boss.y - 20);
    ctx.stroke();
}

function drawMessages() {
    const ctx = state.ctx;
    
    for (const msg of state.messages) {
        ctx.fillStyle = CONFIG.MESSAGE_COLORS[Math.floor(Math.random() * CONFIG.MESSAGE_COLORS.length)];
        ctx.fillRect(msg.x - 10, msg.y - CONFIG.MESSAGE_HEIGHT / 2, msg.width + 20, CONFIG.MESSAGE_HEIGHT);
        
        ctx.strokeStyle = msg.message.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(msg.x - 10, msg.y - CONFIG.MESSAGE_HEIGHT / 2, msg.width + 20, CONFIG.MESSAGE_HEIGHT);
        
        ctx.fillStyle = msg.message.color;
        ctx.font = '14px Segoe UI';
        ctx.textAlign = 'left';
        
        const sender = getRandomName();
        const time = getRandomTime();
        ctx.fillText(sender + ' - ' + time, msg.x, msg.y - CONFIG.MESSAGE_HEIGHT / 2 + 20);
        
        ctx.font = '16px Segoe UI';
        ctx.fillText(msg.message.text, msg.x, msg.y - CONFIG.MESSAGE_HEIGHT / 2 + 45);
        
        if (msg.message.type === 'gif') {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px Segoe UI';
            ctx.fillText('GIF', msg.x + msg.width - 30, msg.y - CONFIG.MESSAGE_HEIGHT / 2 + 20);
        } else if (msg.message.type === 'chart') {
            ctx.fillStyle = '#00ffaa';
            ctx.font = '12px Segoe UI';
            ctx.fillText('CHART', msg.x + msg.width - 50, msg.y - CONFIG.MESSAGE_HEIGHT / 2 + 20);
        }
    }
}

function drawBackground() {
    const ctx = state.ctx;
    
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += CONFIG.MESSAGE_SPACING) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

function gameLoop() {
    if (state.gameOver) {
        drawBackground();
        drawMessages();
        drawPlayer();
        drawBoss();
        return;
    }
    
    state.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    updateMessages();
    updateBoss();
    
    drawBackground();
    drawMessages();
    drawPlayer();
    drawBoss();
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);