const Game = require("./engine.js")
const crypto = require("crypto");


let games = new Map()

function NewGame() {
    const roomID = crypto.randomBytes(3).toString("hex");

    games.set(roomID, new Game(1, 2));

    return roomID
}

function GetGame(roomID) {
    return games.get(roomID);
}


module.exports = { NewGame, GetGame }