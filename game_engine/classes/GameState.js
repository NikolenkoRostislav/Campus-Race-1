const CardCatalog = require('./CardCatalog.js')

class PlayerInfo {
    constructor(id, deck, hp) {
        this.id = id;
        this.deck = deck;
        this.hp = hp;
        this.energy = 0;
    }

    clearEnergy() {
        this.energy = 0;
    }

    addEnergy(energy) {
        this.energy += energy;
    }

    consumeEnergy(energy) {
        if (this.energy - energy < 0) {
            return false
        }
        this.energy -= energy;
        return true
    }

    drawCard(random) {
        let cardID = 1
        if (random) {
            cardID = Math.floor(Math.random() * (CardCatalog.length - 2)) + 2;
        }

        this.deck.push(cardID);
    }
}

class GameBoard {
    constructor() {
        this.board = new Map();

        for (const side of [-1, 1]) {
            for (let x = 1; x <= 4; x++) {
                this.board.set(`${x}:${side}`, null);
            }
        }
    }

    get(x, side) {
        return this.board.get(`${x}:${side}`);
    }

    set(x, side, value) {
        this.board.set(`${x}:${side}`, value);
    }
}

class GameState {
    constructor(p1Id, p1Deck, p2Id, p2Deck) {
        this.player1Info = new PlayerInfo(p1Id, p1Deck, 20);
        this.player2Info = new PlayerInfo(p2Id, p2Deck, 20);
        this.gameBoard = new GameBoard();
        this.turn = 0;
        this.phase = 1;
    }
}

module.exports = { GameState, GameBoard, PlayerInfo };
