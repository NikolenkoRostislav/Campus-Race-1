const Lobby = require("../game_engine/lobby.js");

class LobbyController {
    static lobbies = new Map();

    static newLobby(req, res) {
        try {
            const userID = req.session.user?.id;

            if (!userID) {
                return res.status(401).json({
                    success: false,
                    message: "Not authenticated"
                });
            }

            const lobby = new Lobby(userID);

            LobbyController.lobbies.set(lobby.roomID, lobby);

            return res.status(200).json({
                success: true,
                roomID: lobby.roomID
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }

    static joinLobby(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user?.id;

            if (!roomID || !userID) {
                return res.status(422).json({
                    success: false,
                    message: "Missing roomID or user"
                });
            }

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby) {
                return res.status(404).json({
                    success: false,
                    message: "Lobby not found"
                });
            }

            const ok = lobby.addOpponent(userID);

            return res.json({
                success: ok
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false
            });
        }
    }

    static kickOpponent(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user?.id;

            if (!roomID || !userID) {
                return res.status(422).json({
                    success: false,
                    message: "Missing roomID or user"
                });
            }

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby) {
                return res.status(404).json({
                    success: false,
                    message: "Lobby not found"
                });
            }

            if (lobby.creatorID !== userID) {
                return res.status(403).json({
                    success: false,
                    message: "Only creator can kick"
                });
            }

            lobby.opponentID = null;

            return res.json({
                success: true
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false
            });
        }
    }

    static setReady(req, res) {
        try {
            const { roomID } = req.body;
            const userID = req.session.user?.id;

            if (!roomID || !userID) {
                return res.status(422).json({
                    success: false,
                    message: "Missing roomID or user"
                });
            }

            const lobby = LobbyController.lobbies.get(roomID);

            if (!lobby) {
                return res.status(404).json({
                    success: false,
                    message: "Lobby not found"
                });
            }

            lobby.setReady(userID);

            return res.json({
                success: true
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false
            });
        }
    }
}

module.exports = LobbyController;