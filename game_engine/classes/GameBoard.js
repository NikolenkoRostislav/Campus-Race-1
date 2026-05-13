const CardCatalog = require("./CardCatalog.js");
const CardData = require("./CardData.js");
const { SpawnCommand, SpawnCommandRegistry } = require("./SpawnCommand.js");

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

    placeCard(x, side, cardID) {
        const validX = [1, 2, 3, 4];
        if (!validX.includes(x)) return false;

        let card = CardCatalog.get(cardID);
        let cardData = new CardData(cardID);
        if (this.get(x, side) !== null) {
            return false;
        }
        this.set(x, side, cardData);
        const CommandClass = SpawnCommandRegistry[card.type] || SpawnCommand;
        let spawnCommand = new CommandClass(this, x, side, card);
        spawnCommand.execute();
        return true
    }

    removeCard(x, side) {
        let cardData = this.get(x, side);
        if (cardData === null) {
            return true
        }
        this.set(x, side, null);
        return true
    }
}

module.exports = GameBoard;
