const crypto = require("crypto");

class Lobby {
    constructor(creatorID) {
        this.creatorID = creatorID;
        this.opponentID = null;
        this.roomID = crypto.randomBytes(3).toString("hex");
    }

    addOpponent(opponentID) {
        if (this.opponentID !== null) return false;
        this.opponentID = opponentID;
        return true;
    }
}

module.exports = Lobby;
