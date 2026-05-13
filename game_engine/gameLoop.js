const Game = require("./engine.js")
const crypto = require("crypto");


let games = new Map()

function NewGame() {
    const roomID = crypto.randomBytes(3).toString("hex");

    games.set(roomID, new GameLoop());

    return roomID
}

function GetGame(roomID) {
    return games.get(roomID);
}

class GameLoop {
    constructor() {
        this.game = new Game(1, 2);
        this.phase = 1;
        this.p1MayTakeCard = false;
        this.p2MayTakeCard = false;
    }

    nextPhase() {
        this.phase += 1
        if (this.phase > 6) {
            this.phase = 1
        }
        game.wipeEnergy()
    }

    execute() {
        const timeLimitChooseCard = 15000;
        const timeLimitPlaceCards = 60000;

        switch (this.phase) {
            case 1:
                p1MayTakeCard = true
                setTimeout(() => {
                    console.log("Send the time limit notif to the frontend");
                    if (this.p1MayTakeCard) this.game.getPlayer(1).drawCard(false)
                    this.nextPhase();
                    p1MayTakeCard = false
                    this.execute();
                }, timeLimitChooseCard);
            case 2:
            case 5:
                setTimeout(() => {
                    console.log("Send the time limit notif to the frontend");
                    this.nextPhase();
                    this.execute();
                }, timeLimitPlaceCards);
            case 3:
                this.game.battle(1);
                setTimeout(() => {
                    console.log("Send the time limit notif to the frontend");
                    this.nextPhase();
                    this.game.turn++;
                    this.execute();
                }, 1000);
            case 4:
                p2MayTakeCard = true
                setTimeout(() => {
                    console.log("Send the time limit notif to the frontend");
                    if (this.p2MayTakeCard) this.game.getPlayer(-1).drawCard(false)
                    this.nextPhase();
                    p2MayTakeCard = false;
                    this.execute();
                }, timeLimitChooseCard);
            case 6:
                this.game.battle(-1);
                setTimeout(() => {
                    console.log("Send the time limit notif to the frontend");
                    this.nextPhase();
                    this.game.turn++;
                    this.execute();
                }, 1000);
        }
    }

    // TODO: implement these functions to be called by frontend with checks for correct phase and stuff
    drawCard() { return }
    placeCard() { return }
    sacrificeCard() { return }

}


module.exports = { NewGame, GetGame }