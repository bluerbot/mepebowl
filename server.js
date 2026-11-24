const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
    res.redirect("/game/html/init.html");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", app: "mepe-bowl" });
});

app.use(express.static(__dirname));

const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`Mepe Bowl running at http://127.0.0.1:${PORT}`);
});

let shuttingDown = false;

function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received. Closing Mepe Bowl server...`);

    server.close((error) => {
        if (error) {
            console.error("Server shutdown error:", error);
            process.exitCode = 1;
        } else {
            console.log("Mepe Bowl server closed cleanly.");
        }
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

