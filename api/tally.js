/**
 * Anonymous download tally for /learn ("how many humans saved or shared it").
 * ---------------------------------------------------------------------------
 *   POST /api/tally  {"key":"gif"}  → +1 to that key and to "total"
 *   GET  /api/tally                 → { total, counts: { gif: 12, … } }
 *
 * Privacy: this stores ONLY counters. No IP, no cookie, no user agent, no
 * timestamp per visitor. The browser also remembers (in localStorage) that it
 * already counted a key, so one person clicking twice is one tick.
 *
 * Storage: Upstash Redis over its REST API (Vercel → Storage → Marketplace →
 * Upstash Redis). Connecting it to the project sets these env vars for you:
 *   KV_REST_API_URL + KV_REST_API_TOKEN   (or UPSTASH_REDIS_REST_URL / _TOKEN)
 * Without them (e.g. local dev) counts live in memory until the server restarts.
 * ---------------------------------------------------------------------------
 */

const KEYS = new Set(['gif', 'image-pack', 'printable-pdf', 'poster', 'slide', 'share', 'field-note']);
const HASH = 'mc:tally';
const memory = { total: 0 };

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(commands) {
  const r = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`Redis ${r.status}`);
  return (await r.json()).map((x) => x.result);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const persisted = Boolean(URL_ && TOKEN);

  try {
    if (req.method === 'GET') {
      let counts;
      if (persisted) {
        const [flat] = await redis([['HGETALL', HASH]]);
        counts = {};
        for (let i = 0; i < (flat || []).length; i += 2) counts[flat[i]] = Number(flat[i + 1]);
      } else {
        counts = { ...memory };
      }
      const total = counts.total || 0;
      delete counts.total;
      res.status(200).json({ total, counts, persisted });
      return;
    }

    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    // Only accept the JSON our own page sends (plain form posts / crawlers get nothing).
    const type = String(req.headers['content-type'] || '');
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = null; } }
    const key = body && body.key;
    if (!type.includes('application/json') || !KEYS.has(key)) { res.status(400).json({ error: 'Bad request' }); return; }

    let count, total;
    if (persisted) {
      [count, total] = await redis([['HINCRBY', HASH, key, 1], ['HINCRBY', HASH, 'total', 1]]);
    } else {
      memory[key] = (memory[key] || 0) + 1;
      memory.total += 1;
      count = memory[key]; total = memory.total;
    }
    res.status(200).json({ ok: true, key, count, total, persisted });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
