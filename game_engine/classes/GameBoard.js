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

module.exports = GameBoard;