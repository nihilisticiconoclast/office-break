'use strict';

/* ==========================================================================
   Office Break — leaderboard server
   Zero-dependency Node server that (a) serves the game statically from the
   repo root and (b) exposes a tiny JSON leaderboard API.

   GET  /api/scores            → { scores: [{ initials, score, diff, date }] }
   POST /api/scores            → body { initials, score, diff }
                                 → { scores: [...], rank: <1-based or -1> }

   Persistence: a JSON file. Uses /data/scores.json when a disk is mounted
   at /data (Render persistent disk), else DATA_FILE, else ./scores.json.
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_FILE = process.env.DATA_FILE ||
    (fs.existsSync('/data') ? '/data/scores.json' : path.join(__dirname, 'scores.json'));

const KEEP = 100;          // entries kept on disk
const RETURN_TOP = 20;     // entries returned to clients
const MAX_SCORE = 200000;  // sanity cap (~5.5 hours of survival)
const RATE_LIMIT = 10;     // POSTs per minute per IP
const DIFFS = ['chill', 'standard', 'crunch'];

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

/* ---------- storage ---------- */

let scores = [];

function loadScores() {
    try {
        const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        if (Array.isArray(parsed)) scores = parsed;
    } catch (err) {
        scores = [];
    }
}

function saveScores() {
    const tmp = DATA_FILE + '.tmp';
    try {
        fs.writeFileSync(tmp, JSON.stringify(scores));
        fs.renameSync(tmp, DATA_FILE);
    } catch (err) {
        console.error('could not persist scores:', err.message);
    }
}

function topScores() {
    return scores.slice(0, RETURN_TOP);
}

/* ---------- rate limiting ---------- */

const hits = new Map();

function rateLimited(ip) {
    const now = Date.now();
    const list = (hits.get(ip) || []).filter(function (t) { return now - t < 60000; });
    list.push(now);
    hits.set(ip, list);
    if (hits.size > 5000) hits.clear();   // crude memory guard
    return list.length > RATE_LIMIT;
}

/* ---------- helpers ---------- */

function sendJSON(res, status, obj) {
    const body = JSON.stringify(obj);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
    });
    res.end(body);
}

function handleGetScores(res) {
    sendJSON(res, 200, { scores: topScores() });
}

function handlePostScore(req, res) {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
        .split(',')[0].trim();
    if (rateLimited(ip)) {
        return sendJSON(res, 429, { error: 'slow down' });
    }

    let body = '';
    req.on('data', function (chunk) {
        body += chunk;
        if (body.length > 1024) req.destroy();
    });
    req.on('end', function () {
        let data;
        try {
            data = JSON.parse(body);
        } catch (err) {
            return sendJSON(res, 400, { error: 'bad json' });
        }

        const initials = String(data.initials || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
        const score = Math.floor(Number(data.score));
        const diff = DIFFS.indexOf(data.diff) !== -1 ? data.diff : 'standard';

        if (!initials || !Number.isFinite(score) || score < 1 || score > MAX_SCORE) {
            return sendJSON(res, 400, { error: 'invalid entry' });
        }

        const entry = {
            initials: initials,
            score: score,
            diff: diff,
            date: new Date().toISOString().slice(0, 10)
        };
        scores.push(entry);
        scores.sort(function (a, b) { return b.score - a.score; });
        scores = scores.slice(0, KEEP);
        saveScores();

        const rank = scores.indexOf(entry);
        sendJSON(res, 200, {
            scores: topScores(),
            rank: rank === -1 ? -1 : rank + 1
        });
    });
}

function serveStatic(req, res) {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end('forbidden');
    }

    fs.readFile(filePath, function (err, buf) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('not found');
        }
        const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': type });
        res.end(buf);
    });
}

/* ---------- server ---------- */

const server = http.createServer(function (req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        });
        return res.end();
    }

    if (req.url.split('?')[0] === '/api/scores') {
        if (req.method === 'GET') return handleGetScores(res);
        if (req.method === 'POST') return handlePostScore(req, res);
        return sendJSON(res, 405, { error: 'method not allowed' });
    }

    if (req.method === 'GET') return serveStatic(req, res);

    res.writeHead(405);
    res.end();
});

loadScores();
server.listen(PORT, function () {
    console.log('Office Break server on :' + PORT + ' (scores in ' + DATA_FILE + ')');
});
