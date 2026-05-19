const Lobby = require("../game_engine/lobby.js");
const { getIO } = require("../websockets/socketManager.js");

class LobbyController {
    static lobbies = new Map(); //key: roomID, val: Lobby

    static sendToRoom(roomID, event, data) {
        const room = LobbyController.lobbies.get(roomID);
        if (!room) return null;

        getIO().to(room.creatorID).emit(event, data);
        if (room.opponentID) getIO().to(room.opponentID).emit(event, data);
    }

    static leaveLobby(req, res) {
        try {
            const roomID = req.query.roomID;
            const userID = req.session.user.id;

            const lobby = LobbyController.lobbies.get(roomID);
            if (lobby.opponentID == userID) {
                lobby.opponentID = null;
                LobbyController.sendToRoom(roomID, "opponent_left");
                return res.status(204);
            }
            if (lobby.creatorID !== userID) {
                return res.status(403).json({ message: "Only creator can delete lobby" });
            }
            LobbyController.sendToRoom(roomID, "lobby_deleted");
            LobbyController.lobbies.delete(roomID);

            return res.status(204);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static newLobby(req, res) {
        try {
            const userID = req.session.user.id;
            const lobby = new Lobby(userID);

            LobbyController.lobbies.set(lobby.roomID, lobby);

            return res.status(200).json({ roomID: lobby.roomID });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static joinLobby(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user.id;

            const lobby = LobbyController.lobbies.get(roomID);
            if (!lobby) return res.status(404).json({ message: "Lobby with id " + roomID + " not found" });

            const ok = lobby.addOpponent(userID);
            if (!ok) return res.status(400).json({ message: "Lobby is full" });

            LobbyController.sendToRoom(roomID, "opponent_joined", { userID });
            return res.json({ success: ok });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static getLobbyMembers(req, res) {
        try {
            const roomID = req.query.roomID;
            const lobby = LobbyController.lobbies.get(roomID);
            if (!lobby) return res.status(404).json({ message: "Lobby not found" });

            return res.json({ creatorID: lobby.creatorID, opponentID: lobby?.opponentID });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }
}

module.exports = LobbyController;