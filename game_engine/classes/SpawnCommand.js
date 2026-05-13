const { CardType } = require("./Card.js");

class SpawnCommand {
    constructor(gameBoard, x, side, card) {
        this.gameBoard = gameBoard;
        this.x = x;
        this.side = side;
        this.card = card;
    }

    execute() { }
}

class SpawnCommandSummoner extends SpawnCommand {
    execute() {
        this.gameBoard.placeCard(this.x - 1, this.side, 101);
        this.gameBoard.placeCard(this.x + 1, this.side, 101);
    }
}

class SpawnCommandBuffDMG extends SpawnCommand {
    execute() {
        const validX = [1, 2, 3, 4];

        const tryBuff = (newX) => {
            if (!validX.includes(newX)) return;

            const buffedCard = this.gameBoard.get(newX, this.side);

            if (buffedCard !== null) {
                buffedCard.increaseDamage(1);
            }
        };

        tryBuff(this.x - 1);
        tryBuff(this.x + 1);
    }
}

class SpawnCommandBuffDMGStrong extends SpawnCommand {
    execute() {
        const validX = [1, 2, 3, 4];

        const tryBuff = (newX) => {
            if (!validX.includes(newX)) return;

            const buffedCard = this.gameBoard.get(newX, this.side);

            if (buffedCard !== null) {
                buffedCard.increaseDamage(2);
            }
        };

        tryBuff(this.x - 1);
        tryBuff(this.x + 1);
    }
}

class SpawnCommandBuffHP extends SpawnCommand {
    execute() {
        const validX = [1, 2, 3, 4];

        const tryBuff = (newX) => {
            if (!validX.includes(newX)) return;

            const buffedCard = this.gameBoard.get(newX, this.side);

            if (buffedCard !== null) {
                buffedCard.increaseHP(1);
            }
        };

        tryBuff(this.x - 1);
        tryBuff(this.x + 1);
    }
}

const SpawnCommandRegistry = {
    [CardType.SPAWNER]: SpawnCommandSummoner,
    [CardType.BUFF_DMG]: SpawnCommandBuffDMG,
    [CardType.BUFF_DMG_STRONG]: SpawnCommandBuffDMGStrong,
    [CardType.BUFF_HP]: SpawnCommandBuffHP,
};

module.exports = { SpawnCommand, SpawnCommandRegistry };