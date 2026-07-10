/* ==========================================================================
   Office Break — leaderboard server for Deno Deploy
   Same API as server/index.js, but storage is Deno KV, which is durable on
   Deno Deploy's free tier — the board survives restarts and redeploys, and
   the service never sleeps.

   GET  /api/scores  → { scores: [{ initials, score, diff, date }] }
   POST /api/scores  → body { initials, score, diff }
                       → { scores: [...], rank: <1-based or -1> }

   Also serves the game statically from the repo root, so one Deno Deploy
   project hosts both the game and the board.

   Deploy: dash.deno.com → New Project → import this repo →
   entrypoint server/main.ts. Local run:
   deno run --allow-net --allow-read --unstable-kv server/main.ts
   ========================================================================== */

const KEEP = 100;
const RETURN_TOP = 20;
const MAX_SCORE = 200000;
const RATE_LIMIT = 10; // POSTs per minute per IP
const DIFFS = ['chill', 'standard', 'crunch', 'daily'];

const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

interface Entry {
    initials: string;
    score: number;
    diff: string;
    date: string;
}

const kv = await Deno.openKv();

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

function json(status: number, obj: unknown): Response {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS }
    });
}

/* ---------- rate limiting (per isolate — good enough for a toy) ---------- */

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const list = (hits.get(ip) ?? []).filter((t) => now - t < 60000);
    list.push(now);
    hits.set(ip, list);
    if (hits.size > 5000) hits.clear();
    return list.length > RATE_LIMIT;
}

/* ---------- API ---------- */

async function getScores(): Promise<Entry[]> {
    const cur = await kv.get<Entry[]>(['scores']);
    return Array.isArray(cur.value) ? cur.value : [];
}

async function handlePost(req: Request, ip: string): Promise<Response> {
    if (rateLimited(ip)) return json(429, { error: 'slow down' });

    let data: Record<string, unknown>;
    try {
        const text = await req.text();
        if (text.length > 1024) return json(400, { error: 'too large' });
        data = JSON.parse(text);
    } catch {
        return json(400, { error: 'bad json' });
    }

    const initials = String(data.initials ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    const score = Math.floor(Number(data.score));
    const diff = DIFFS.includes(String(data.diff)) ? String(data.diff) : 'standard';

    if (!initials || !Number.isFinite(score) || score < 1 || score > MAX_SCORE) {
        return json(400, { error: 'invalid entry' });
    }

    const entry: Entry = {
        initials,
        score,
        diff,
        date: new Date().toISOString().slice(0, 10)
    };

    // Atomic read-modify-write with retry so concurrent posts can't clobber
    // each other.
    for (let attempt = 0; attempt < 5; attempt++) {
        const cur = await kv.get<Entry[]>(['scores']);
        const list = Array.isArray(cur.value) ? [...cur.value] : [];
        list.push(entry);
        list.sort((a, b) => b.score - a.score);
        const trimmed = list.slice(0, KEEP);
        const res = await kv.atomic().check(cur).set(['scores'], trimmed).commit();
        if (res.ok) {
            const rank = trimmed.indexOf(entry);
            return json(200, {
                scores: trimmed.slice(0, RETURN_TOP),
                rank: rank === -1 ? -1 : rank + 1
            });
        }
    }
    return json(503, { error: 'busy, try again' });
}

/* ---------- static game files ---------- */

const ROOT = new URL('..', import.meta.url);

async function serveStatic(pathname: string): Promise<Response> {
    let p = decodeURIComponent(pathname);
    if (p === '/') p = '/index.html';
    if (p.includes('..')) return new Response('forbidden', { status: 403 });
    try {
        const file = await Deno.readFile(new URL('.' + p, ROOT));
        const ext = p.slice(p.lastIndexOf('.'));
        return new Response(file, {
            headers: { 'Content-Type': MIME[ext] ?? 'application/octet-stream' }
        });
    } catch {
        return new Response('not found', { status: 404 });
    }
}

/* ---------- server ---------- */

Deno.serve(async (req: Request, info: Deno.ServeHandlerInfo) => {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
    }

    if (url.pathname === '/api/scores') {
        if (req.method === 'GET') {
            return json(200, { scores: (await getScores()).slice(0, RETURN_TOP) });
        }
        if (req.method === 'POST') {
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                (info.remoteAddr as Deno.NetAddr).hostname;
            return await handlePost(req, ip);
        }
        return json(405, { error: 'method not allowed' });
    }

    if (req.method === 'GET') return await serveStatic(url.pathname);

    return new Response(null, { status: 405 });
});
