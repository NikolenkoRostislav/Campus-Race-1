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

            let isCreatorFirst = Math.random() < 0.5;
            isCreatorFirst = true; //remove later
            const p1ID = isCreatorFirst ? lobby.creatorID : lobby.opponentID;
            const p2ID = isCreatorFirst ? lobby.opponentID : lobby.creatorID;

            LobbyController.lobbies.delete(roomID);

            const gameLoop = new GameLoop(roomID, p1ID, p2ID);

            gameLoop.on("state_changed", (data) => {
                console.log("Game update:", data);
            });

            GameController.games.set(roomID, {
                gameLoop,
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

            const result = room.gameLoop.drawCard(side, random);

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

            const result = room.gameLoop.placeCard(side, x, cardID);

            return res.json(result);

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

            const result = room.gameLoop.sacrificeCard(side, x);

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

            const result = room.gameLoop.endPlacePhase(side);

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
            board: Object.fromEntries(room.gameLoop.game.gameBoard.board)
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
            hand: room.gameLoop.game.getPlayer(side).hand
        });
    }
}

module.exports = GameController;