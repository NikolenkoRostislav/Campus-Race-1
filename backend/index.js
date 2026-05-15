const path = require("path");
const http = require("http");

const express = require("express");
const session = require("express-session");

const { initWebSocket } = require("./websockets/websocket.js");
const auth = require("./controllers/authController.js");
const register = require("./controllers/registrationController.js");
const lobby = require("./controllers/lobbyController.js");
const game = require("./controllers/gameController.js");

require("dotenv").config();

const host = process.env.HOST;
const port = process.env.PORT;
const secretKey = process.env.SECRET_KEY;
const frontendPath = (...p) => path.join(__dirname, "../frontend", ...p);

const app = express();
const server = http.createServer(app);

const sessionMiddleware = session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
});

initWebSocket(server, sessionMiddleware);

app.use(express.json());
app.use(express.static(frontendPath("public")));

app.use(sessionMiddleware);


// --------------------
// PAGES
// --------------------
app.get("/", (req, res) => {
    res.sendFile(frontendPath("views", "main_menu.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(frontendPath("views", "register.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(frontendPath("views", "login.html"));
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
app.post("/api/lobby/new", lobby.newLobby);
app.post("/api/lobby/join", lobby.joinLobby);
app.post("/api/lobby/kick", lobby.kickOpponent);
app.post("/api/lobby/ready", lobby.setReady);

// --------------------
// GAME ROUTES
// --------------------
app.post("/api/game/start", game.startGame);

app.post("/api/game/draw", game.drawCard);
app.post("/api/game/place", game.placeCard);
app.post("/api/game/sacrifice", game.sacrificeCard);
app.post("/api/game/end-place", game.endPlacePhase);

app.get("/api/game/board", game.getGameboard);
app.get("/api/game/hand", game.getHand);


// 404
app.use((req, res) => {
    res.status(404).sendFile(frontendPath("views", "404.html"));
});

server.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
});