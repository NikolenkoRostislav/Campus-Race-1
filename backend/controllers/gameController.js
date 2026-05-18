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

    static endGame(req, res) {
        try {
            const roomID = req.query.roomID;
            GameController.rooms.delete(roomID);
            return res.status(204);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static startGame(req, res) {
        try {
            const { roomID } = req.body;

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby || !lobby.opponentID) {
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
                GameController.sendToRoom(roomID, "state_changed", { 
                    newState: data.newState,
                    board: data.board,
                    handP1: data.handP1,
                    handP2: data.handP2,
                    energyP1: data.energyP1,
                    energyP2: data.energyP2
                });
            });
            gameLoop.on("battle_completed", (data) => {
                GameController.sendToRoom(roomID, "battle_completed", { battleLog: data.battleLog });
            });

            GameController.rooms.set(roomID, gameLoop);
            GameController.sendToRoom(roomID, "game_started", { isCreatorFirst });

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
            const userID = req.session.user.id;

            const room = GameController.getRoomOrFail(roomID);
            const side = GameController.getSide(roomID, userID);

            const result = room.drawCard(side, random);
            if (!result) {
                return res.status(403).json({ message: "Can't do this" });
            }

            GameController.sendToRoom(roomID, "card_taken", { userID, hand: result.hand });
            return res.json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static placeCard(req, res) {
        try {
            const { roomID, x, cardID } = req.body;
            const userID = req.session.user.id;

            const room = GameController.getRoomOrFail(roomID);
            const side = GameController.getSide(roomID, userID);

            const result = room.placeCard(side, x, cardID);
            if (!result) {
                return res.status(403).json({ message: "Can't do this" });
            }
            GameController.sendToRoom(roomID, "card_placed", { board: result.board, hand: result.hand, energy: result.energy, userID });
            return res.json(result);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static sacrificeCard(req, res) {
        try {
            const { roomID, x } = req.body;
            const userID = req.session.user.id;

            const room = GameController.getRoomOrFail(roomID);
            const side = GameController.getSide(roomID, userID);

            const result = room.sacrificeCard(side, x);
            if (!result) return res.status(403).json({ message: "Can't do this" });
            GameController.sendToRoom(roomID, "card_sacrificed", { board: result.board, energy: result.energy, userID });

            return res.json(result);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static endPlacePhase(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user.id;

            const room = GameController.getRoomOrFail(roomID);
            const side = GameController.getSide(roomID, userID);

            const result = room.endPlacePhase(side); //bool
            if (!result) return res.status(403).json({ message: "Can't do this" });

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

            return res.json({
                board: Object.fromEntries(room.game.gameBoard.board),
                currentState: room.state
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static getHand(req, res) {
        try {
            const { roomID } = req.query;
            const userID = req.session.user.id;

            const room = GameController.getRoomOrFail(roomID);
            const side = GameController.getSide(roomID, userID);

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