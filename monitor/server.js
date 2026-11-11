'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');

const PORT = 3302;
const HOST = '127.0.0.1';
const LOG = '/var/log/nginx/access.log';

const USER = process.env.MONITOR_USER;
const PASS = process.env.MONITOR_PASSWORD;

if (!USER || !PASS) {
  throw new Error('Monitor credentials not configured');
}

function equal(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function authorized(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString();
    const i = decoded.indexOf(':');
    return i > 0 &&
      equal(decoded.slice(0, i), USER) &&
      equal(decoded.slice(i + 1), PASS);
  } catch {
    return false;
  }
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(data));
}

async function countGameEntries() {
  const now = Date.now();
  const cutoff = now - 12 * 60 * 60 * 1000;

  const contents = await Promise.all([
    fs.readFile(LOG, 'utf8'),
    fs.readFile(LOG + '.1', 'utf8').catch(error => {
      if (error.code === 'ENOENT') return '';
      throw error;
    })
  ]);

  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const pattern = /^\S+ \S+ \S+ \[(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2})\] "GET \/game\/html\/init\.html(?:\?[^\s"]*)? HTTP\/[^"]+" (200|304)\b/;

  let count = 0;

  for (const content of contents) {
    for (const line of content.split('\n')) {
      const m = line.match(pattern);
      if (!m || months[m[2]] === undefined) continue;

      const localTime = Date.UTC(
        Number(m[3]), months[m[2]], Number(m[1]),
        Number(m[4]), Number(m[5]), Number(m[6])
      );

      const offset = (Number(m[8]) * 60 + Number(m[9])) *
        (m[7] === '+' ? 1 : -1);

      const timestamp = localTime - offset * 60000;

      if (timestamp >= cutoff && timestamp <= now) count++;
    }
  }

  return {
    count,
    signal: count <= 5 ? '🔴' : count <= 20 ? '🟡' : '🟢'
  };
}

const DASHBOARD = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#101719">
<title>Mepe Bowl Monitor</title>
<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 20px 16px 36px;
  background: #101719;
  color: #eaf0ed;
  font-family: system-ui, sans-serif;
  font-size: 16px;
}
main { max-width: 680px; margin: auto; }
header { margin: 8px 0 24px; }
h1 { font-size: 30px; letter-spacing: 1px; margin: 0; }
.sub { color: #9baaa5; margin-top: 4px; }
.panel {
  background: #1b2729;
  border: 1px solid #344346;
  border-radius: 14px;
  padding: 18px;
  margin: 14px 0;
}
.label {
  color: #aabbb5;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 27px;
  font-weight: 800;
}
.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #82908b;
  flex: 0 0 auto;
}
.online .dot { background: #47df91; box-shadow: 0 0 14px #47df9180; }
.offline .dot { background: #ff6262; box-shadow: 0 0 14px #ff626280; }
.detail { color: #aabbb5; font-size: 14px; margin-top: 9px; }
.activity-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
#count { color: #aabbb5; font-size: 13px; }
#logs {
  margin-top: 14px;
  display: grid;
  gap: 9px;
}
.log {
  background: #111a1c;
  border-radius: 8px;
  padding: 11px;
  font: 12px/1.55 ui-monospace, monospace;
  color: #d2ded9;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.empty { color: #9baaa5; padding: 12px 0; }
footer {
  color: #80918b;
  text-align: center;
  font-size: 12px;
  margin-top: 24px;
}
button {
  border: 1px solid #526568;
  background: #263638;
  color: #eaf0ed;
  border-radius: 8px;
  padding: 9px 13px;
  font-size: 14px;
}
</style>
</head>
<body>
<main>
  <header>
    <h1>MEPE BOWL</h1>
    <div class="sub">Private observatory · worldsphere0</div>
  </header>

  <section class="panel">
    <div class="label">Public site status</div>
    <div id="status" class="status">
      <span class="dot"></span><span id="state">CHECKING</span>
    </div>
    <div id="pingDetail" class="detail">Waiting for first check...</div>
  </section>

  <section class="panel">
    <div class="label">Monitor service</div>
    <div id="monitorState" class="status">
      <span class="dot"></span><span>ONLINE</span>
    </div>
    <div id="checked" class="detail">Waiting for first update...</div>
  </section>

  <section class="panel">
    <div class="activity-head">
      <div class="label">Recent traffic · last 5 hits</div>
      <span id="count">Loading</span>
    </div>
    <div id="logs"><div class="empty">Waiting for access log...</div></div>
  </section>

  <button id="refresh">Refresh now</button>

  <nav aria-label="WorldSphere links" style="margin-top:18px;padding:14px 4px;border-top:1px solid #444">
    <div class="label" style="margin-bottom:10px">WorldSphere links</div>
    <ul style="list-style:none;margin:0;padding:0;display:grid;gap:10px">
      <li><a href="https://work.mepebowl.fun/">MepeBowl Work</a></li>
    </ul>
  </nav>


  <div style="height:140px" aria-hidden="true"></div>
  <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:8px 4px 0">
    <span id="entrySignal" style="font-size:22px">⚪</span>
    <span id="entryCount" style="font-size:24px;font-weight:700">—</span>
  </div>
  <footer>Private Tailscale connection · Updates every 15 seconds</footer>
</main>

<script>
const statusBox = document.getElementById('status');
const stateText = document.getElementById('state');
const pingDetail = document.getElementById('pingDetail');
const checked = document.getElementById('checked');
const logsBox = document.getElementById('logs');
const count = document.getElementById('count');

function timeNow() {
  return new Date().toLocaleTimeString();
}

async function getJSON(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(path + ' returned ' + response.status);
  return response.json();
}

async function updateStatus() {
  try {
    const data = await getJSON('./ping');
    statusBox.className = 'status ' + (data.healthy ? 'online' : 'offline');
    stateText.textContent = data.healthy ? 'ONLINE' : 'UNHEALTHY';
    pingDetail.textContent =
      'HTTP ' + data.status + ' · Checked ' +
      new Date(data.timestamp).toLocaleTimeString();
  } catch (error) {
    statusBox.className = 'status offline';
    stateText.textContent = 'UNREACHABLE';
    pingDetail.textContent = error.message;
  }
}

async function updateMonitor() {
  try {
    const data = await getJSON('./health');
    document.getElementById('monitorState').className = 'status online';
    checked.textContent = 'Last dashboard update: ' + timeNow();
  } catch (error) {
    document.getElementById('monitorState').className = 'status offline';
    checked.textContent = error.message;
  }
}

async function updateLogs() {
  try {
    const data = await getJSON('./logs');
    const lines = (data.lines || []).slice(-5).reverse();

    logsBox.replaceChildren();
    count.textContent = lines.length + ' entries';

    if (!lines.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No access log entries yet.';
      logsBox.appendChild(empty);
      return;
    }

    lines.forEach(function(line) {
      const item = document.createElement('div');
      item.className = 'log';
      item.textContent = line;
      logsBox.appendChild(item);
    });
  } catch (error) {
    logsBox.textContent = 'Unable to read access log: ' + error.message;
    count.textContent = 'Error';
  }
}

async function updateEntryCount() {
  try {
    const data = await getJSON('./entry-count');
    document.getElementById('entryCount').textContent = data.count;
    document.getElementById('entrySignal').textContent = data.signal;
  } catch {
    document.getElementById('entryCount').textContent = '—';
    document.getElementById('entrySignal').textContent = '⚪';
  }
}

async function refresh() {
  await Promise.all([
    updateStatus(),
    updateMonitor(),
    updateLogs(),
    updateEntryCount()
  ]);
}

document.getElementById('refresh').addEventListener('click', refresh);
refresh();
setInterval(refresh, 15000);
</script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  if (!authorized(req)) {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="Mepe Monitor"'
    });
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const path = new URL(req.url, 'http://localhost').pathname;

  if (path === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"
    });
    return res.end(DASHBOARD);
  }

  if (path === '/health') {
    return json(res, 200, {
      status: 'ok',
      monitor: 'online',
      timestamp: new Date().toISOString()
    });
  }

  if (path === '/logs') {
    let file;
    try {
      file = await fs.open(LOG, 'r');
      const stat = await file.stat();
      const length = Math.min(stat.size, 65536);
      const buffer = Buffer.alloc(length);
      await file.read(buffer, 0, length, stat.size - length);

      const lines = buffer.toString('utf8')
        .trimEnd()
        .split('\n')
        .slice(-50);

      return json(res, 200, { lines });
    } catch {
      return json(res, 500, { error: 'Log unavailable' });
    } finally {
      await file?.close().catch(() => {});
    }
  }

  if (path === '/entry-count') {
    try {
      return json(res, 200, await countGameEntries());
    } catch {
      return json(res, 500, { error: 'Entry count unavailable' });
    }
  }

  if (path === '/ping') {
    try {
      const response = await fetch('https://work.mepebowl.fun', {
        method: 'HEAD',
        signal: AbortSignal.timeout(8000)
      });

      return json(res, 200, {
        reachable: true,
        healthy: response.ok || response.status === 401,
        status: response.status,
        timestamp: new Date().toISOString()
      });
    } catch {
      return json(res, 503, {
        reachable: false,
        healthy: false,
        timestamp: new Date().toISOString()
      });
    }
  }

  return json(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log('Mepe Monitor listening on ' + HOST + ':' + PORT);
});
