const Lobby = require("../game_engine/lobby.js");

class LobbyController {
    static lobbies = new Map(); //key: roomID, val: Lobby

    static leaveLobby(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user.id;

            const lobby = LobbyController.lobbies.get(roomID);
            if (lobby.opponentID == userID) {
                lobby.opponentID = null;
                return res.status(204);
            }
            if (lobby.creatorID !== userID) {
                return res.status(403).json({ message: "Only creator can delete lobby" });
            }
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

            const ok = lobby.addOpponent(userID);
            return res.json({ success: ok });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static kickOpponent(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user.id;

            const lobby = LobbyController.lobbies.get(roomID);

            if (lobby.creatorID !== userID) {
                return res.status(403).json({ message: "Only creator can kick" });
            }

            lobby.opponentID = null;
            return res.status(204);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static setReady(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user.id;

            const lobby = LobbyController.lobbies.get(roomID);

            lobby.setReady(userID);
            return res.json({
                success: true
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }
}

module.exports = LobbyController;