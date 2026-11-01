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

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Mepe Bowl running at http://127.0.0.1:${PORT}`);
});


