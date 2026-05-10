const GameBoard = require('./GameBoard.js')

class PlayerInfo {
    constructor(id, deck, hp) {
        this.id = id;
        this.deck = deck;
        this.hp = hp;
    }
}

class GameState {
    constructor(p1Id, p1Deck, p2Id, p2Deck) {
        this.player1Info = new PlayerInfo(p1Id, p1Deck, 20);
        this.player2Info = new PlayerInfo(p2Id, p2Deck, 20);
        this.gameBoard = new GameBoard();
        this.turn = 0;
        this.phase = 0;
    }
}

module.exports = GameState;
