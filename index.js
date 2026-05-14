const express = require("express");
const session = require("express-session");
const path = require("path");
const auth = require("./controllers/authController.js");
const register = require("./controllers/registrationController.js");
const lobby = require("./controllers/lobbyController.js");
const game = require("./controllers/gameController.js");

require('dotenv').config();

const host = process.env.HOST;
const port = process.env.PORT;
const secretKey = process.env.SECRET_KEY;

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "main_menu.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/api/register", register.register);

app.post("/api/login", auth.login);

app.get("/api/me", auth.me);

app.post("/api/logout", auth.logout);

app.post("/api/game/new", (req, res) => {
    const roomID = NewGame();

    res.json({ roomID: roomID });
});

app.post("/api/game/join", (req, res) => {
    const roomID = req.query.roomID;
    const game = GetGame(roomID) || null;
    if (!game) return res.status(404).send("Not found");

    res.json({ success: true });
});

app.get("/api/game", (req, res) => {
    const roomID = req.query.roomID;
    const game = GetGame(roomID) || {};

    res.json({ game: game });
});


app.use((req, res) => {
    res.status(404).sendFile(
        path.join(__dirname, "views", "404.html")
    );
});

app.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
});