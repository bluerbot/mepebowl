# Hydration 001 — Office Monitor Encounter Provisioning

**Local date:** 2026-11-26 (acceptance evidence 2026-11-27 UTC)  
**Envelope:** work2/envelopes/office-monitor  
**Baseline:** dev2 @ 8b780b5  
**Disposition:** Accepted in Work; ready for reconciliation into dev2, not yet merged.

## 1. Intent and conceptual elevation

Provision Ron's Office with access to the independently operating Monitor. This was not a redesign, reconfiguration of metric machinery, or reinvention of Monitor. The Monitor concept matured progressively through earlier work taskings and traversals. This Envelope confirmed that accumulated utility and connected it into a landscape.

The Office does not own the Monitor. Encounter is a coming together: Access Monitor and Observe Work are independently declared occurrences coupled through reciprocal PATHING. A participant can locate the affordance without necessarily possessing the connectivity or credentials to exercise it.

## 2. Landscape and traversal

Maclocal Work2 -> GitHub work2/envelopes/office-monitor -> worldsphere0 Work -> Ron's Office -> private Work Monitor -> Ron's Office.

Office access: https://work.mepebowl.fun/office/ (Work authentication remains).
Private destination: https://worldsphere0.taile2b676.ts.net/work-monitor/ (tailnet plus HTTP Basic).
Return: explicit OFFICE link to the Office entrance.

The coupling office-monitor.work is expressed in both office/encounter__access_monitor.json and monitor/encounter__observe_work.json. Office obtains the forward destination from the declaration. The Monitor return anchor is explicit in its servlet. The access status retains authenticated-health-verified because the Office runtime gates the affordance on that value; participant acceptance is recorded separately.

## 3. Station history

- 367b01f Recursive0: acquired R1.5, including monitor/server.js.
- 8b780b5: Office Envelope baseline reconciled into dev2; new independent Monitor Envelope branched.
- 2351cae / e43660a: Access Monitor declaration and acquisition survey.
- a1798b6: recovered historical Tailscale connectivity hydration as residue/monitor__tailscale_connectivity.md. Historical date not established.
- fc25df4 / 5b795a6: independent Observe Work declaration and reciprocal coupling; actual systemd service identity established.
- ebd4bda / d6cba08 / 362d3eb / bccdf4b / 9fb0025: resolved paths, Office affordance, Monitor return anchor, acquisition evidence. Acquired on maclocal and worldsphere0; Node syntax check passed.
- 9a71dc8 / 92bd52a / c6707ed: reconcile declarations and survey with accepted participant traversal.

## 4. Operational acquisition and preservation

Both on-disk Monitor sources initially matched Git blob 904a31286b6090aa0348002f5a5e74e8b92106ff. Work executable after coupling: ed938e587fd0e1ef19f6c6c83462184008028610. The only Monitor executable change was the OFFICE anchor.

| Service | Working directory | Port | PID before | PID after |
| --- | --- | --- | --- | --- |
| mepe-monitor.service | /var/www/worldsphere/staging/monitor | 3022 | 301032 | 301032 |
| mepe-monitor-work.service | /var/www/worldsphere/work/monitor | 3302 | 301038 | 633858 |

Both active, both loopback only. Original process preserved. The original running port differs from the acquired on-disk hardcoded 3302; loaded source identity is not established. Do not restart original without resolving that discrepancy.

Tailscale 1.104.5: preserved root proxy to 3022; registered /work-monitor/ proxy to 3302 on existing HTTPS 443, tailnet only. Pre-change configuration snapshot saved on droplet as ~/tailscale-serve-pre-office-monitor.json (status evidence, not a tested restore procedure).

Registration command:
```bash
sudo tailscale serve --bg --https=443 --set-path=/work-monitor/ http://127.0.0.1:3302
```

No Funnel, public Nginx proxy, authentication bypass, Live or Staging deployment. No PM2 restart. Only Work Monitor systemd service restarted. Tailscale registration is operational state outside Git; merging the branch does not provision it elsewhere.

## 5. Acceptance evidence

- Unauthenticated loopback health requests returned 401.
- After registration, root, mounted dashboard and mounted health returned HTTP/2 401 at 01:30:01 UTC.
- Authenticated mounted health returned status ok / monitor online at 01:31:32.080 UTC.
- After targeted restart, authenticated dashboard delivered OFFICE anchor; initial attempt returned 401, subsequent attempt succeeded.
- Original PID, both loopback listeners, both private routes verified after restart.
- Maclocal and initially disconnected Android returned NXDOMAIN. Android connected through its existing Tailscale app; no server repair required.
- Android participant reported Office-Monitor working, continuing hits in dashboard, and successful return to Office entrance. This is participant-reported browser acceptance, not automated browser instrumentation.
- Droplet status corroborated active direct Android peer and enabled tailnet-wide MagicDNS. System DNS dump was access denied; not needed for successful traversal.

No credentials or raw access logs recorded in hydration.

## 6. Deferred Intents and boundaries

The existing 12-hour entry-count matches legacy /game/html/init.html successful responses, not all R1.5 entry paths. Continuing hits establish observation, not semantic correctness of R1.5 metrics or Work-only traffic classification. Ping treats Work HTTP 401 as healthy, not proof of bowling functionality. Reconcile these separately; no metric logic changed.

Maclocal is not an established tailnet participant. Android is the accepted participant. No need to weaken private access for maclocal.

Hydration 002's broader hosted FrontDoor/Credits/Office/BACK and bowling regression acceptance is not newly established by this traversal. No claim of those tests passing.

## 7. Basin reset

Office Monitor Encounter Provisioning accepted. Preserve the independently operating Monitor and its accumulated history. The reusable pattern is acquisition -> confirmation -> reciprocal declarations -> path registration -> credentialed traversal -> participant acceptance.

Next station: acquire closing hydration on maclocal and Work, then reconcile Envelope into dev2 with explicit fast-forward verification. Do not promote to Live or Staging by implication.

Ron has acquired a useful operational facility through traversal rather than absorption.
