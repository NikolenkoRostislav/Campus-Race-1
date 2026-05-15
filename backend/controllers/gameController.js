const GameLoop = require("../game_engine/gameLoop.js");
const LobbyController = require("./lobbyController.js");
const { getIO } = require("../websockets/websocket.js");

class GameController {
    static rooms = new Map(); // key: roomID, val: gameLoop

    static sendToRoom(roomID, event, data) {
        const room = GameController.rooms.get(roomID);
        if (!room) return null;

        const uids = GameController.getUserIDsInRoom(roomID);

        getIO().to(uids[0]).emit(event, data);
        getIO().to(uids[1]).emit(event, data);
    }

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
            // const isCreatorFirst = true;
            const p1ID = isCreatorFirst ? lobby.creatorID : lobby.opponentID;
            const p2ID = isCreatorFirst ? lobby.opponentID : lobby.creatorID;

            LobbyController.lobbies.delete(roomID);

            const gameLoop = new GameLoop(roomID, p1ID, p2ID);

            gameLoop.on("state_changed", (data) => {
                GameController.sendToRoom(roomID, "game_update", data);
            });
            gameLoop.on("battle_completed", (data) => {
                GameController.sendToRoom(roomID, "battle_completed", data);
            });


            GameController.rooms.set(roomID, gameLoop);

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

    static getUserIDsInRoom(roomID) {
        const room = GameController.rooms.get(roomID);
        if (!room) return null;
        return [room.game.players.get(1).id, room.game.players.get(-1).id];
    }

    static getSide(roomID, userID) {
        const room = GameController.rooms.get(roomID);
        if (!room) return null;
        for (const [side, player] of room.game.players.entries()) {
            if (player.id === userID) {
                return side;
            }
        }
        return null;
    }

    static getRoomOrFail(roomID) {
        return GameController.rooms.get(roomID) || null;
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

            const result = room.drawCard(side, random);

            return res.json({ success: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
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

            const result = room.placeCard(side, x, cardID);

            return res.json(result);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
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

            const result = room.sacrificeCard(side, x);

            return res.json({ success: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
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

            const result = room.endPlacePhase(side);

            return res.json({ success: result });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static getGameboard(req, res) {
        try {
            const { roomID } = req.query;

            const room = GameController.getRoomOrFail(roomID);
            if (!room) {
                return res.status(404).json({ success: false });
            }

            return res.json({
                board: Object.fromEntries(room.game.gameBoard.board)
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static getHand(req, res) {
        try {
            const { roomID } = req.query;
            const userID = req.session.user?.id;

            const room = GameController.getRoomOrFail(roomID);
            if (!room) return res.status(404).json({ success: false });

            const side = GameController.getSide(roomID, userID);
            if (!side) return res.status(403).json({ success: false });

            return res.json({
                hand: room.game.getPlayer(side).hand
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }
}

module.exports = GameController;