class GameState {
    constructor(p1Id, p1Deck, p2Id, p2Deck) {
        this.player1Info = {
            id: p1Id,
            deck: p1Deck,
            hp: 20
        }
        this.player2Info = {
            id: p2Id,
            deck: p2Deck,
            hp: 20
        }
        this.gameboardInfo = {};
        this.turn = 0;
        this.phase = 0;
    }
}