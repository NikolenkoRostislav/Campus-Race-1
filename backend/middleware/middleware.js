const session = require("express-session");

const LobbyController = require("../controllers/lobbyController.js");
const GameController = require("../controllers/gameController.js");

require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const sessionMiddleware = session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
});

function authMiddleware(req, res, next) {
    const userID = req.session.user?.id;
    if (!userID) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    next();
}

function getRoomID(req) {
    return req.body?.roomID ?? req.query?.roomID;
}

function gameMiddleware(req, res, next) {
    const roomID = getRoomID(req);
    const userID = req.session.user.id;
    if (!roomID) {
        return res.status(400).json({ message: "Missing roomID" });
    }
    if (GameController.getSide(roomID, userID) === null) {
        return res.status(403).json({ message: "Only a player can influence a game" });
    }
    const room = GameController.rooms.get(roomID);
    if (!room) {
        return res.status(404).json({ message: "Lobby not found" });
    }

    next();
}

function lobbyMiddleware(req, res, next) {
    const roomID = getRoomID(req);
    const userID = req.session.user.id;
    if (!roomID) {
        return res.status(400).json({ message: "Missing roomID" });
    }
    const lobby = LobbyController.lobbies.get(roomID);
    if (!lobby) {
        return res.status(404).json({ message: "Lobby not found" });
    }
    if (lobby.creatorID !== userID && lobby.opponentID !== userID) {
        return res.status(403).json({ message: "Only creator or opponent can influence a lobby" });
    }

    next();
}

module.exports = { sessionMiddleware, authMiddleware, lobbyMiddleware, gameMiddleware }