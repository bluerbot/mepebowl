# Office Access Monitor — acquisition survey

**Branch:** `work2/envelopes/office-monitor`  
**Accepted baseline:** `dev2 @ 8b780b5`  
**Place:** Ron's Office  
**Encounter:** Access Monitor  
**Status:** private route and authenticated health verified; application changes pending deployment and browser acceptance

## Acquired source projection

The Recursive0 `dev2` tree already contains `monitor/server.js`. Its blob SHA is `904a31286b6090aa0348002f5a5e74e8b92106ff`; the local `git hash-object` observation matches. No executable file has been replaced or rewritten.

The source specifies Node HTTP service at `127.0.0.1:3302`, requiring `MONITOR_USER` and `MONITOR_PASSWORD` via environment, reading `/var/log/nginx/access.log`, and serving an authenticated dashboard with `/health`, `/ping`, `/logs`, `/entry-count`.

The dashboard describes a private Tailscale connection, but the source does **not** reveal a validated browser-accessible Tailscale URL. Do not infer public accessibility from the existing `work.mepebowl.fun` link in the dashboard; that link leads *out* of the monitor.

## Semantic mismatch (known, deferred)

The 12-hour `/entry-count` classification matches only `GET /game/html/init.html` responses (200/304). R1.5's FrontDoor and Markers paths do not match this regex, so the metric is not a trustworthy count of R1.5 entries.

The `/ping` endpoint treats HTTP 401 from `https://work.mepebowl.fun` as healthy: this is an availability/authorization-gate observation, not proof of bowling encounter health.

Do not alter metric logic during initial access acquisition.

## Intended Access Monitor Encounter

- The Office is the situated point at which Ron locates monitoring.
- The existing Monitor servlet remains an independent participant.
- The Office's MONITOR affordance must lead to a **verified private destination**, never to a fabricated Tailscale hostname or unprotected public proxy.
- Credentials, raw logs, and privileged monitoring are not embedded or mirrored in the public Office.
- Existing Office Hello, BACK, and bowling navigation remain intact.

## Droplet survey — read-only

Run on `worldsphere0`; do not print secrets:

```bash
pm2 list
sudo systemctl show mepe-monitor-work.service -p ActiveState -p MainPID -p ExecStart -p WorkingDirectory
ss -ltnp | grep ':3302'
git hash-object /var/www/worldsphere/work/monitor/server.js
git -C /var/www/worldsphere/work status -sb
git -C /var/www/worldsphere/work rev-parse --short HEAD
sudo tailscale status
sudo tailscale serve status
```

Record only service names, bound ports, Tailscale routing (redact private identifiers if desired), repository state, and content hashes. Check any Nginx/private route separately if Tailscale Serve does not expose the service.

## Acceptance gate

1. Confirm running Monitor code vs. `904a31286b6090aa0348002f5a5e74e8b92106ff`.
2. Verify the actual private browser route and authorization boundary.
3. Connect Office MONITOR affordance to that verified route.
4. Exercise Office -> Monitor -> Office; preserve independent service.
5. Revisit hosted FrontDoor/Credits/Office/BACK and bowling traversal acceptance not yet recorded in hydration 002.

No Live or Staging mutation. No claim of hosted acceptance before exercised evidence.

## Survey resolution — 2026-11-27 UTC

Both systemd units active: mepe-monitor.service (staging path, PID 301032, port 3022) and mepe-monitor-work.service (work path, PID 301038, port 3302). Both on-disk source blobs matched Recursive0 before application changes. Original running port differs from the on-disk hardcoded port; do not restart original service. Both loopback health paths challenged unauthenticated requests with 401.

Tailscale Serve retained root -> 3022 and added /work-monitor/ -> 3302, tailnet only. Root, mounted dashboard and mounted health challenged unauthenticated requests with HTTP/2 401. Authenticated mounted health returned status ok, monitor online at 2026-11-27T01:31:32.080Z. No credentials recorded.

Reciprocal declarations share coupling office-monitor.work. Office MONITOR reads its destination from the declaration; Work dashboard adds an OFFICE link. No metric changes. Work service restart and hosted browser round trip remain pending. Original service and staging must not be restarted or modified.
