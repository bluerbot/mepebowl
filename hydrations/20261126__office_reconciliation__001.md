# Hydration 001 — Office reconciliation and Work provenance

**Date:** 2026-11-26 (local conversation date)
**Envelope:** work2/envelopes/office-reconciliation
**Baseline:** dev2 @ 8d75c7d
**Acceptance anchor:** 04cf54e
**Disposition:** hosted acceptance passed; final dev2 reconciliation pending.

## Intent

Reconcile the Office Hello manifestation with the acquired Office Monitor utility and establish work.mepebowl.fun as provenant within the exercised landscape. Preserve distinct Encounters sharing a Place, rather than redesigning or absorbing them.

## Survey and acquisition

Repository survey confirmed that office/index.html already manifests office.hello and office.access-monitor. Credits and BACK paths already exist. No executable change was needed. The acceptance plan was published at 04cf54e in office/reconciliation__provenance.md.

worldsphere0 Work acquired the Envelope at 04cf54e with clean status. PM2 mepe-bowl-work was online, script /var/www/worldsphere/work/server.js, cwd /var/www/worldsphere/work. No restart performed.

## Served expression identity

The first Python probe failed because input() attempted to read from stdin occupied by the heredoc. Retry read username from /dev/tty and password through getpass. Authenticated HTTPS requests compared response bytes directly with the clean checkout. All seven returned HTTP 200 and MATCH:

- /r15/
- /r15/credits.mjs
- /office/
- /office/encounter__hello.json
- /office/encounter__access_monitor.json
- /r15/markers/
- /r15/lane22/

Credentials not recorded. This establishes identity of the tested static expressions, not every asset or runtime configuration.

## Participant acceptance

User submitted all eight hosted traversal checks as PASS:

- Open CREDITS.
- Enter Office.
- Confirm HELLO and MONITOR coexist.
- Select MONITOR and confirm continuing observations.
- Select OFFICE in the Monitor.
- Select BACK and confirm arrival at FrontDoor.
- Select PLAY NOW, visit Markers, proceed through BOWL NOW and bowl.
- Return to FrontDoor, enter directly through Lane 22 sign and bowl.

This is participant-reported browser evidence, not automated browser instrumentation. It closes the previously outstanding hosted Office BACK and bowling preservation checks from hydrations/20261126__office2envelope__002.md and hydrations/20261126__office_monitor__001.md.

## Resolution and boundaries

Work provenance is established for the tested expressions and exercised participant traversals. Hello and Access Monitor remain separate declarations; the Monitor remains independently credentialed. No executable changes, service restarts, Live or Staging changes were made in this Envelope. Monitor metric semantics remain deferred; this does not certify every route, asset, frame setting or runtime configuration. Tailscale registration remains operational state outside Git.

## Basin reset

Acquire this hydration on maclocal, fast-forward dev2 to the Envelope, push, then return worldsphere0 Work to dev2 and verify clean aligned HEAD. The final reconciliation has not yet been observed. Retain the Envelope as historical traversal handle. No service restart required for these documentation-only changes.

The landscape is reconciled by evidence, not by inventing additional machinery.
