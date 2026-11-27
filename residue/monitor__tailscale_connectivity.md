---
type: residue
id: monitor__tailscale_connectivity
origin: legacy-hydration
origin_date: unknown
recovered: 2026-11-26
places:
  - worldsphere0
  - maclocal
  - macretina
tags:
  - monitor
  - tailscale
  - nginx
  - systemd
  - connectivity
  - authentication
status: historical
---

# Mepe Bowl connectivity — historical residue

Recovered from a legacy hydration supplied by the user on November 26, 2026. Original RTF formatting converted to Markdown; historical observations and instructions retained below. This is not a current hydration or a current-state assertion.

## Original expression

### Hydration — Mepe Bowl connectivity

Server-side routing repaired  
Client verification pending

### Current state

Server: worldsphere0

- Tailscale Serve is configured: https://worldsphere0.taile2b676.ts.net/ → 127.0.0.1:3022
- Monitor service mepe-monitor.service is running.
- Nginx now binds public HTTPS only on 167.99.102.6:443.
- Tailscale owns its private IPv4 and IPv6 HTTPS sockets.
- Server-side curl returns: HTTP/2 401 — expected Basic Auth challenge.
- No further server changes indicated.

Client: current Mac

- Terminal hostname: Wess-MacBook-Pro-2.local
- macOS 11.4 Big Sur.
- tailscale status fails because the installed application cannot load: AppIntents.framework
- Browser reports DNS_PROBE_FINISHED_NXDOMAIN.
- No login prompt appears because DNS resolution fails before reaching the monitor.

### Key distinction

We have not established that the current Mac is macretina. User believes Tailscale was configured on macretina.

### Re-entry plan

When macretina is available:

1. Confirm machine identity: `hostname`
2. `sw_vers`
3. Check Tailscale client: `tailscale status`
4. Confirm the Mac is connected to the same tailnet as worldsphere0.
5. Open: https://worldsphere0.taile2b676.ts.net/
6. Expect a Basic Auth login prompt. Authenticate and verify the monitor page.

If Tailscale isn't active, diagnose that Mac's client installation and connection before touching server configuration.

### Separate pending traversal

Staging remains unresolved:

- User initially reported http://staging.mepebowl.com/.
- Existing Nginx configuration uses staging.mepebowl.fun, proxying to 127.0.0.1:3201.
- These are different hostnames. Reconcile the intended staging URL before investigating routing.

### Preservation rules

- Do not undo the successful Nginx/Tailscale socket separation.
- Do not alter the monitor service or its authentication without evidence.
- Production release-1 remains a frozen published artifact.
- Resume with the Mac client, one diagnostic step at a time.

## Reacquisition — 2026-11-26

Journey: `work2/envelopes/office-monitor`  
Place: worldsphere0 / conversational assessment  
Encounter: Monitor operational survey

The current survey found no `mepe-monitor-work` in the current user's PM2 population, a listener on port 3302, and Tailscale Serve still routing its private portal to port 3022. The user recovered this earlier expression in response to that anomaly.

Utility rediscovered:

- Identified the historical original Monitor systemd unit, `mepe-monitor.service`, as a candidate for current verification.
- Recovered private portal provenance.
- Recovered Nginx/Tailscale socket separation and authentication preservation constraints.
- Recovered the distinction between server availability and client-side Tailscale connectivity.

Corroborated by current survey: private portal and upstream port 3022.

Outstanding: current service ownership and running executable provenance for both ports, current client connectivity, and hosted access acceptance. Historical service and client observations are not automatically current facts.

This reacquisition record preserves the renewed utility of the residue without promoting it to an active hydration.
