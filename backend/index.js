const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const http = require("http");
const express = require("express");

const { sessionMiddleware, authMiddleware, lobbyMiddleware, gameMiddleware } = require("./middleware/middleware.js");
const { initWebSocket } = require("./websockets/websocket.js");
const auth = require("./controllers/authController.js");
const register = require("./controllers/registrationController.js");
const lobby = require("./controllers/lobbyController.js");
const game = require("./controllers/gameController.js");
const user = require("./controllers/userController.js");

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const frontendPath = (...p) => path.join(__dirname, "../frontend", ...p);

const app = express();
const server = http.createServer(app);

initWebSocket(server, sessionMiddleware);

app.use(express.json());

app.use(express.static(frontendPath("public")));

app.use('/assets', express.static(frontendPath("assets")));

app.use(sessionMiddleware);

// --------------------
// PAGES
// --------------------
app.get("/", (req, res) => {
    res.sendFile(frontendPath("views", "main_menu.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(frontendPath("views", "login.html"));
});

app.get("/create-room", (req, res) => {
    res.sendFile(frontendPath("views", "create_room.html"));
});

app.get("/game", (req, res) => {
    res.sendFile(frontendPath("views", "game.html"));
});

// --------------------
// AUTH
// --------------------
app.post("/api/register", register.register);
app.post("/api/login", auth.login);
app.get("/api/me", auth.me);
app.post("/api/logout", auth.logout);

// --------------------
// USER
// --------------------
app.patch("/api/user/pfp_url", authMiddleware, user.updatePFP);

// --------------------
// LOBBY ROUTES
// --------------------
app.post("/api/lobby/new", authMiddleware, lobby.newLobby);
app.post("/api/lobby/join", authMiddleware, lobby.joinLobby);
app.delete("/api/lobby/leave", authMiddleware, lobbyMiddleware, lobby.leaveLobby);
app.post("/api/lobby/ready", authMiddleware, lobbyMiddleware, lobby.setReady);

// --------------------
// GAME ROUTES
// --------------------
app.post("/api/game/start", authMiddleware, game.startGame);

app.post("/api/game/draw", authMiddleware, gameMiddleware, game.drawCard);
app.post("/api/game/place", authMiddleware, gameMiddleware, game.placeCard);
app.post("/api/game/sacrifice", authMiddleware, gameMiddleware, game.sacrificeCard);
app.post("/api/game/end-place", authMiddleware, gameMiddleware, game.endPlacePhase);
app.delete("/api/game/end", authMiddleware, gameMiddleware, game.endGame);

app.get("/api/game/board", authMiddleware, gameMiddleware, game.getGameboard);
app.get("/api/game/hand", authMiddleware, gameMiddleware, game.getHand);

// --------------------
// 404
// --------------------
app.use((req, res) => {
    res.status(404).sendFile(frontendPath("views", "404.html"));
});

server.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
});