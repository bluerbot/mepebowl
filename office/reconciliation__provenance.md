# Office reconciliation Envelope — provenance and acceptance

**Branch:** `work2/envelopes/office-reconciliation`  
**Baseline:** `dev2 @ 8d75c7d`  
**Target:** `https://work.mepebowl.fun`  
**Status:** repository survey complete; hosted reconciliation acceptance pending

## Discovered, not redesigned

The existing `office/index.html` already manifests two separately declared Encounters. `office/encounter__hello.json` supplies the HELLO greeting; `office/encounter__access_monitor.json` supplies the private MONITOR destination. The earlier Office traversal gave FrontDoor Credits an Office portal (`r15/credits.mjs`) and Office its BACK affordance to `../r15/`. The subsequent Monitor traversal registered its private Work Monitor path and its OFFICE return, with Android participant acceptance.

This Envelope does not merge Hello and Monitor into one Encounter, claim Monitor owns the Office, or redesign either. It reconciles evidence of their shared **Place** manifestation with the Work deployment and the preservation routes.

## Acquired provenance

- `8d75c7d` is the accepted `dev2` baseline, and the new Envelope's starting head.
- Work tree root: `/var/www/worldsphere/work`, PM2 process `mepe-bowl-work`, Express on loopback `127.0.0.1:3301`.
- `server.js` serves static files relative to its working directory and redirects root to the legacy lane entry. Verify the actual Work Nginx upstream and redirects before changing anything.
- Credits Office link: `../office/index.html`; Office BACK: `../r15/`.
- Office fetches `./encounter__hello.json` and `./encounter__access_monitor.json`; MONITOR link manifests only when the declaration has the verified path status and destination.
- Monitor remains systemd `mepe-monitor-work.service`, loopback `3302`, exposed privately by Tailscale Serve `/work-monitor/`; the original `3022` route remains independent.
- Earlier Android acceptance established Office -> private Monitor -> Office and continuing traffic display. It did **not** establish complete R1.5 bowling preservation regression or prove entry-count classification.

## Acceptance stations

1. **Work acquisition:** inspect current branch, clean tree, HEAD, process working directory and active upstream; switch Work to this Envelope branch without restarting services or disturbing Live/Staging.
2. **Static provenance:** verify hosted `/office/`, `/office/encounter__hello.json`, `/office/encounter__access_monitor.json`, `/r15/`, `/r15/credits.mjs`; compare hosted Office HTML and encounter JSON with acquired on-disk files where feasible. HTTP 200 alone is weaker than content identity.
3. **Participant traversal:** FrontDoor -> Credits -> Office HELLO + MONITOR -> BACK -> FrontDoor; Android connected to tailnet -> MONITOR -> OFFICE. Record both outcomes separately.
4. **Bowling preservation:** FrontDoor PLAY NOW -> Markers -> BOWL NOW -> Lane22 -> bowl, plus direct Lane22 sign -> bowl. Record failures; do not infer success from page loads.
5. **Seal and reconcile:** only when the observed state justifies it, hydrate this Envelope, reconcile into dev2, restore Work to dev2, and confirm served state again.

## Boundaries

No Live or Staging mutation. No new public Monitor route, credentials in Office, changes to Monitor metrics, new UI redesign, or premature Office data model. Never conflate git alignment, static content identity, participant traversal, and bowling correctness; each is its own acceptance assertion.

The Work site can be established as **provenant** when an operator can trace what is being served back to the intended, accepted branch and can demonstrate the target traversals. Remote state and browser observations are not established by this document alone.

🐢 / 🦫 / ♠️
