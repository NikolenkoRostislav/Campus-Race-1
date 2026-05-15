const crypto = require("crypto");

class Lobby {
    constructor(creatorID) {
        this.creatorID = creatorID;
        this.opponentID = null;
        this.creatorReady = false;
        this.opponentReady = false;
        this.roomID = crypto.randomBytes(3).toString("hex");
    }

    addOpponent(opponentID) {
        if (this.opponentID !== null) return false;
        this.opponentID = opponentID;
        return true;
    }

    setReady(userID) {
        if (userID === this.creatorID) this.creatorReady = true;
        if (userID === this.opponentID) this.opponentReady = true;
    }

    canStartGame() {
        return this.creatorReady && this.opponentReady;
    }
}

module.exports = Lobby;
