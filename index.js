const express = require("express");
const session = require("express-session");
const path = require("path");

const auth = require("./controllers/authController.js");
const register = require("./controllers/registrationController.js");
const LobbyController = require("./controllers/lobbyController.js");
const GameController = require("./controllers/gameController.js");

require("dotenv").config();

const host = process.env.HOST;
const port = process.env.PORT;
const secretKey = process.env.SECRET_KEY;

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: secretKey,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60
        }
    })
);

// --------------------
// PAGES
// --------------------
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "main_menu.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

// --------------------
// AUTH
// --------------------
app.post("/api/register", register.register);
app.post("/api/login", auth.login);
app.get("/api/me", auth.me);
app.post("/api/logout", auth.logout);

// --------------------
// LOBBY ROUTES
// --------------------
app.post("/api/lobby/new", LobbyController.newLobby);
app.post("/api/lobby/join", LobbyController.joinLobby);
app.post("/api/lobby/kick", LobbyController.kickOpponent);
app.post("/api/lobby/ready", LobbyController.setReady);

// --------------------
// GAME ROUTES
// --------------------
app.post("/api/game/start", GameController.startGame);

app.post("/api/game/draw", GameController.drawCard);
app.post("/api/game/place", GameController.placeCard);
app.post("/api/game/sacrifice", GameController.sacrificeCard);
app.post("/api/game/end-place", GameController.endPlacePhase);

app.get("/api/game/board", GameController.getGameboard);
app.get("/api/game/hand", GameController.getHand);


// 404
app.use((req, res) => {
    res.status(404).sendFile(
        path.join(__dirname, "views", "404.html")
    );
});

app.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
});