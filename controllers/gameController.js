const crypto = require("crypto");
const GameLoop = require("../game_engine/gameLoop.js");

const games = new Map();

function NewGame(p1ID, p2ID) {
    const roomID = crypto.randomBytes(3).toString("hex");
    let game = new GameLoop(roomID, p1ID, p2ID);
    game.on("state_changed", (data) => {
        console.log(data);
    });

    games.set(roomID, {
        game: game,
        players: {
            [p1ID]: 1,
            [p2ID]: -1
        }
    });

    return roomID;
}

function GetGame(roomID) {
    return games.get(roomID);
}

function GetSide(roomID, userID) {
    const room = games.get(roomID);
    if (!room) return null;

    return room.players[userID] || null;
}

function DrawCard(roomID, userID, random) {
    const room = games.get(roomID);
    if (!room) return false;

    const side = GetSide(roomID, userID);
    if (!side) return false;

    return room.game.drawCard(side, random);
}

function PlaceCard(roomID, userID, x, cardID) {
    const room = games.get(roomID);
    if (!room) return false;

    const side = GetSide(roomID, userID);
    if (!side) return false;

    return room.game.placeCard(side, x, cardID);
}

function SacrificeCard(roomID, userID, x) {
    const room = games.get(roomID);
    if (!room) return false;

    const side = GetSide(roomID, userID);
    if (!side) return false;

    return room.game.sacrificeCard(side, x);
}

function EndPlacePhase(roomID, userID) {
    const room = games.get(roomID);
    if (!room) return false;

    const side = GetSide(roomID, userID);
    if (!side) return false;

    return room.game.endPlacePhase(side);
}

module.exports = {
    NewGame,
    GetGame,
    DrawCard,
    PlaceCard,
    SacrificeCard,
    EndPlacePhase
};