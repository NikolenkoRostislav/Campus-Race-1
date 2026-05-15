const Lobby = require("../game_engine/lobby.js");

class LobbyController {
    static lobbies = new Map(); //key: roomID, val: Lobby

    static newLobby(req, res) {
        try {
            const userID = req.session.user?.id;

            if (!userID) {
                return res.status(401).json({ message: "Not authenticated" });
            }

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
            const userID = req.session.user?.id;

            if (!roomID || !userID) {
                return res.status(422).json({ message: "Missing roomID or user" });
            }

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby) {
                return res.status(404).json({ message: "Lobby not found" });
            }

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
            const userID = req.session.user?.id;

            if (!roomID || !userID) {
                return res.status(422).json({ message: "Missing roomID or user" });
            }

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby) {
                return res.status(404).json({ message: "Lobby not found" });
            }

            if (lobby.creatorID !== userID) {
                return res.status(403).json({ message: "Only creator can kick" });
            }

            lobby.opponentID = null;

            return res.json({
                success: true
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "something went wrong" });
        }
    }

    static setReady(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user?.id;

            if (!roomID || !userID) {
                return res.status(422).json({ message: "Missing roomID or user" });
            }

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby) {
                return res.status(404).json({ message: "Lobby not found" });
            }

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