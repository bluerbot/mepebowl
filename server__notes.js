/*
===============================================================================
MEPE BOWL / WORLDSPHERE — SERVER NOTES
R1 OPERATIONAL BASELINE
Captured: 2026-11-02
===============================================================================

1. REPOSITORY
-------------------------------------------------------------------------------

Path:
    /var/www/worldsphere/pro-bowling-3d

Remote:
    https://github.com/bluerbot/pro-bowling-3d.git

Current branch:
    portalbasics

Current HEAD:
    1c1110b — Merge Node.js server foundation into dev

Branch state:
    portalbasics and dev both point to 1c1110b.
    dev is four commits ahead of origin/dev.
    portalbasics exists locally on the droplet and is not pushed.

nodejsenabled:
    7662eae — Add graceful Node server shutdown

Preserved stash:
    stash@{0}
    "preserve server archive before branch transition"

Do not drop the stash without inspecting it.

2. NODE / EXPRESS APPLICATION
-------------------------------------------------------------------------------

Application:
    mepe-bowl

Entry:
    server.js

Package:
    package.json

Runtime:
    Node.js 24.22.1
    Express 5.3.x
    CommonJS

Start command:
    npm start

Port:
    process.env.PORT || 3001

Bind address:
    127.0.0.1

Static root:
    express.static(__dirname)

Routes:
    GET /       -> redirect to /game/html/init.html
    GET /health -> application health response

Graceful shutdown:
    SIGINT and SIGTERM handled through server.close().

3. PM2
-------------------------------------------------------------------------------

Process name:
    mepe-bowl

Status at capture:
    online

Process ID:
    0

Script:
    /var/www/worldsphere/pro-bowling-3d/server.js

Working directory:
    /var/www/worldsphere/pro-bowling-3d

Execution mode:
    fork

Logs:
    /home/mainsphere/.pm2/logs/mepe-bowl-error.log
    /home/mainsphere/.pm2/logs/mepe-bowl-out.log

Useful commands:
    pm2 list
    pm2 describe mepe-bowl
    pm2 logs mepe-bowl

Do not start a duplicate server on port 3001.

4. NETWORK / PORT OWNERSHIP
-------------------------------------------------------------------------------

80:
    Nginx public HTTP; redirects to HTTPS.

443:
    Nginx public HTTPS.

3001:
    Mepe Bowl Express.
    Bound to 127.0.0.1.

3000:
    Separate existing Node service.
    Process: node /var/www/html/hello.js
    User: nodejs
    Bound to [::1]:3000.

IMPORTANT:
    Port 3000 belongs to another application.
    Do not repurpose or disrupt it.

5. NGINX / DOMAIN
-------------------------------------------------------------------------------

Domain:
    mepebowl.fun
    www.mepebowl.fun

Enabled configuration:
    /etc/nginx/sites-enabled/default

Resolved source:
    /etc/nginx/sites-available/default

Mepe Bowl HTTPS proxy:
    proxy_pass http://127.0.0.1:3001;

The other virtual host still proxies to:
    localhost:3000

TLS certificate:
    /etc/letsencrypt/live/mepebowl.fun/fullchain.pem

TLS key:
    /etc/letsencrypt/live/mepebowl.fun/privkey.pem

Pre-change backup:
    /etc/nginx/sites-available/default.pre-mepe-proxy

Nginx validation:
    nginx -t successful at capture.

Service:
    active.

After future Nginx edits:
    sudo nginx -t
    sudo systemctl reload nginx

Nginx configuration is host-level infrastructure.
It is not automatically versioned with this repository.

6. VERIFIED R1 BASELINE
-------------------------------------------------------------------------------

Local health:
    http://127.0.0.1:3001/health
    HTTP 200; reports mepe-bowl healthy.

Local game document:
    http://127.0.0.1:3001/game/html/init.html
    HTTP 200.

Public domain:
    https://mepebowl.fun/
    HTTP 302 to /game/html/init.html.

Browser verification confirmed:
    - Game loads through public HTTPS domain.
    - Bowling rolls work.
    - Pin collisions/crashes work.
    - Strike animation works.

This is the working R1 baseline.

7. DEVELOPMENT BOUNDARY
-------------------------------------------------------------------------------

Current branch:
    portalbasics

Immediate work:
    Build a lightweight Mepe Bowl branding/presentation shell around
    the existing game.

Preservation rules:
    - Keep game logic intact.
    - Preserve dependencies and script ordering.
    - Preserve required DOM IDs and callback names.
    - Preserve game initialization and controls.
    - Keep the game stage as the boundary between website and Three.js.
    - Keep branding and page presentation outside the game core.

Future direction:
    Vue may replace the presentation shell.
    The game should remain independently reusable.

Branch separation:
    nodejsenabled: Node server foundation.
    portalbasics: portal and presentation work.

Merge deliberately when the two areas need to come together.

===============================================================================
END SERVER NOTES
===============================================================================
*/
