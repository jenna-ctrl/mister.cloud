/**
 * Daily analytics email — Vercel Cron function.
 * ---------------------------------------------------------------------------
 * Pulls yesterday's stats from the Plausible Stats API and emails a branded
 * summary via Resend. Scheduled once a day by the "crons" entry in vercel.json.
 *
 * Required environment variables (set in Vercel → Project → Settings → Env):
 *   PLAUSIBLE_API_KEY   Plausible → Settings → API Keys (a "Stats API" key)
 *   PLAUSIBLE_SITE_ID   the site's domain in Plausible, e.g. "mister.cloud"
 *   RESEND_API_KEY      Resend → API Keys
 *   CRON_SECRET         any random string; Vercel sends it as a Bearer token so
 *                       only Vercel Cron (not the public) can trigger this route
 * Optional:
 *   REPORT_TO           recipient(s), comma-separated. Default below.
 *   REPORT_FROM         verified Resend sender. Default below (verify the domain
 *                       in Resend, or sending will fail).
 *   PLAUSIBLE_HOST      for self-hosted Plausible. Default https://plausible.io
 * ---------------------------------------------------------------------------
 */

const REPORT_TO = process.env.REPORT_TO || 'shailin@futureprooftmt.com';
const REPORT_FROM = process.env.REPORT_FROM || 'Mister Cloud Analytics <analytics@mister.cloud>';
const PLAUSIBLE_HOST = process.env.PLAUSIBLE_HOST || 'https://plausible.io';

module.exports = async (req, res) => {
  // Only allow Vercel Cron (or a caller who knows CRON_SECRET).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers['authorization'] || '';
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const site = process.env.PLAUSIBLE_SITE_ID;
  const pKey = process.env.PLAUSIBLE_API_KEY;
  const rKey = process.env.RESEND_API_KEY;
  const missing = [
    !site && 'PLAUSIBLE_SITE_ID', !pKey && 'PLAUSIBLE_API_KEY', !rKey && 'RESEND_API_KEY',
  ].filter(Boolean);
  if (missing.length) {
    res.status(500).json({ error: `Missing env: ${missing.join(', ')}` });
    return;
  }

  // Yesterday, UTC (Plausible reports in the site's configured timezone).
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const date = d.toISOString().slice(0, 10);
  const prettyDate = d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

  const pHeaders = { Authorization: `Bearer ${pKey}` };
  const q = (path, params) => {
    const usp = new URLSearchParams({ site_id: site, period: 'day', date, ...params });
    return `${PLAUSIBLE_HOST}/api/v1/stats/${path}?${usp}`;
  };

  try {
    const [aggRes, pagesRes, sourcesRes, countriesRes] = await Promise.all([
      fetch(q('aggregate', { metrics: 'visitors,pageviews,bounce_rate,visit_duration' }), { headers: pHeaders }),
      fetch(q('breakdown', { property: 'event:page', metrics: 'visitors,pageviews', limit: '5' }), { headers: pHeaders }),
      fetch(q('breakdown', { property: 'visit:source', metrics: 'visitors', limit: '5' }), { headers: pHeaders }),
      fetch(q('breakdown', { property: 'visit:country', metrics: 'visitors', limit: '5' }), { headers: pHeaders }),
    ]);

    for (const [name, r] of [['aggregate', aggRes], ['pages', pagesRes], ['sources', sourcesRes], ['countries', countriesRes]]) {
      if (!r.ok) throw new Error(`Plausible ${name} ${r.status}: ${await r.text()}`);
    }

    const agg = (await aggRes.json()).results || {};
    const pages = (await pagesRes.json()).results || [];
    const sources = (await sourcesRes.json()).results || [];
    const countries = (await countriesRes.json()).results || [];

    const html = buildEmail({ prettyDate, agg, pages, sources, countries, site });

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${rKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: REPORT_FROM,
        to: REPORT_TO.split(',').map((s) => s.trim()),
        subject: `☁️ Mister Cloud — daily traffic for ${prettyDate}`,
        html,
      }),
    });
    if (!sendRes.ok) throw new Error(`Resend ${sendRes.status}: ${await sendRes.text()}`);

    res.status(200).json({ ok: true, date, sentTo: REPORT_TO });
  } catch (err) {
    console.error('daily-analytics-email failed:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
};

function fmtDuration(seconds) {
  const s = Math.round(seconds || 0);
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
}

function buildEmail({ prettyDate, agg, pages, sources, countries, site }) {
  const visitors = agg.visitors?.value ?? 0;
  const pageviews = agg.pageviews?.value ?? 0;
  const bounce = agg.bounce_rate?.value ?? 0;
  const duration = fmtDuration(agg.visit_duration?.value);

  const stat = (label, value) => `
    <td style="padding:10px 14px;background:#F0F9FF;border-radius:12px;text-align:center">
      <div style="font-size:26px;font-weight:800;color:#0A8CF5;font-family:Arial,sans-serif">${value}</div>
      <div style="font-size:11px;color:#5b6b7d;text-transform:uppercase;letter-spacing:.5px">${label}</div>
    </td>`;

  const list = (rows, keyName) => rows.length
    ? rows.map((r) => `<tr>
        <td style="padding:4px 0;color:#0A1B2E;font-size:13px">${r[keyName] || '(none)'}</td>
        <td style="padding:4px 0;color:#5b6b7d;font-size:13px;text-align:right">${r.visitors} visitors</td>
      </tr>`).join('')
    : `<tr><td style="padding:4px 0;color:#94a3b8;font-size:13px">No data yet.</td></tr>`;

  return `
  <div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#0A1B2E">
    <h1 style="color:#0A8CF5;font-size:20px;margin:0 0 2px">☁️ Mister Cloud — daily traffic</h1>
    <p style="color:#5b6b7d;font-size:13px;margin:0 0 18px">${prettyDate} · ${site}</p>

    <table style="border-collapse:separate;border-spacing:8px;width:100%">
      <tr>${stat('Visitors', visitors)}${stat('Pageviews', pageviews)}${stat('Bounce', bounce + '%')}${stat('Avg. visit', duration)}</tr>
    </table>

    <h2 style="font-size:14px;color:#0A1B2E;margin:22px 0 6px;border-bottom:2px solid #0A8CF5;padding-bottom:4px">Top pages</h2>
    <table style="width:100%;border-collapse:collapse">${list(pages, 'page')}</table>

    <h2 style="font-size:14px;color:#0A1B2E;margin:22px 0 6px;border-bottom:2px solid #0A8CF5;padding-bottom:4px">Where they came from</h2>
    <p style="font-size:11px;color:#94a3b8;margin:0 0 6px">Curious visitors who typed the URL after seeing the brand show up as <b>Direct / None</b>.</p>
    <table style="width:100%;border-collapse:collapse">${list(sources, 'source')}</table>

    <h2 style="font-size:14px;color:#0A1B2E;margin:22px 0 6px;border-bottom:2px solid #0A8CF5;padding-bottom:4px">Top countries</h2>
    <table style="width:100%;border-collapse:collapse">${list(countries, 'country')}</table>

    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">
      Full dashboard: <a href="${PLAUSIBLE_HOST}/${site}" style="color:#0A8CF5">${PLAUSIBLE_HOST.replace(/^https?:\/\//, '')}/${site}</a><br>
      Protecting little footprints across the globe.
    </p>
  </div>`;
}
