const GameLoop = require("../game_engine/gameLoop.js");
const LobbyController = require("./lobbyController.js");

class GameController {
    static games = new Map();

    static startGame(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user?.id;

            if (!roomID || !userID) {
                return res.status(422).json({
                    success: false,
                    message: "Missing roomID or user session"
                });
            }

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby || !lobby.canStartGame() || lobby.creatorID !== userID) {
                return res.status(403).json({
                    success: false,
                    message: "Cannot start game"
                });
            }

            const isCreatorFirst = Math.random() < 0.5;

            const p1ID = isCreatorFirst ? lobby.creatorID : lobby.opponentID;
            const p2ID = isCreatorFirst ? lobby.opponentID : lobby.creatorID;

            LobbyController.lobbies.delete(roomID);

            const game = new GameLoop(roomID, p1ID, p2ID);

            game.on("state_changed", (data) => {
                console.log("Game update:", data);
            });

            GameController.games.set(roomID, {
                game,
                players: {
                    [p1ID]: 1,
                    [p2ID]: -1
                }
            });

            return res.status(200).json({
                success: true,
                roomID,
                creatorSide: isCreatorFirst ? 1 : -1,
                opponentSide: isCreatorFirst ? -1 : 1
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }

    static getSide(roomID, userID) {
        const room = GameController.games.get(roomID);
        if (!room) return null;
        return room.players[userID] || null;
    }

    static getRoomOrFail(roomID) {
        return GameController.games.get(roomID) || null;
    }

    static drawCard(req, res) {
        try {
            const { roomID, random } = req.body;
            const userID = req.session.user?.id;

            const room = GameController.getRoomOrFail(roomID);
            if (!room) {
                return res.status(404).json({ success: false, message: "Game not found" });
            }

            const side = GameController.getSide(roomID, userID);
            if (!side) {
                return res.status(403).json({ success: false, message: "Invalid player" });
            }

            const result = room.game.drawCard(side, random);

            return res.json({ success: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
    }

    static placeCard(req, res) {
        try {
            const { roomID, x, cardID } = req.body;
            const userID = req.session.user?.id;

            const room = GameController.getRoomOrFail(roomID);
            if (!room) {
                return res.status(404).json({ success: false });
            }

            const side = GameController.getSide(roomID, userID);
            if (!side) {
                return res.status(403).json({ success: false });
            }

            const result = room.game.placeCard(side, x, cardID);

            return res.json({ success: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
    }

    static sacrificeCard(req, res) {
        try {
            const { roomID, x } = req.body;
            const userID = req.session.user?.id;

            const room = GameController.getRoomOrFail(roomID);
            if (!room) return res.status(404).json({ success: false });

            const side = GameController.getSide(roomID, userID);
            if (!side) return res.status(403).json({ success: false });

            const result = room.game.sacrificeCard(side, x);

            return res.json({ success: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
    }

    static endPlacePhase(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user?.id;

            const room = GameController.getRoomOrFail(roomID);
            if (!room) return res.status(404).json({ success: false });

            const side = GameController.getSide(roomID, userID);
            if (!side) return res.status(403).json({ success: false });

            const result = room.game.endPlacePhase(side);

            return res.json({ success: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
    }

    static getGameboard(req, res) {
        const { roomID } = req.query;

        const room = GameController.getRoomOrFail(roomID);
        if (!room) {
            return res.status(404).json({ success: false });
        }

        return res.json({
            board: room.game.gameBoard
        });
    }

    static getHand(req, res) {
        const { roomID } = req.query;
        const userID = req.session.user?.id;

        const room = GameController.getRoomOrFail(roomID);
        if (!room) return res.status(404).json({ success: false });

        const side = GameController.getSide(roomID, userID);
        if (!side) return res.status(403).json({ success: false });

        return res.json({
            hand: room.game.getPlayer(side).deck
        });
    }
}

module.exports = GameController;