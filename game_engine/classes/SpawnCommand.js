const CardType = require("./Card.js").CardType;
const CardData = require("./CardData.js");

class SpawnCommand {
    constructor(game, x, side, card, cardPlacementLog) {
        this.game = game;
        this.x = x;
        this.side = side;
        this.card = card;
        this.cardPlacementLog = cardPlacementLog;
    }

    execute() { }
}
class SpawnCommandSummoner extends SpawnCommand {
    execute() {
        const validX = [1, 2, 3, 4];

        const trySpawn = (newX) => {
            if (!validX.includes(newX)) return;

            const existing = this.game.gameState.gameBoard.get(newX, this.side);

            if (existing === null) {
                this.game.gameState.gameBoard.set(newX, this.side, new CardData(101));

                this.cardPlacementLog.push({
                    Action: "CARD_PLACED",
                    TargetCoord: `${newX}:${this.side}`,
                    CardID: 101
                });
            }
        };

        trySpawn(this.x - 1);
        trySpawn(this.x + 1);
    }
}

class SpawnCommandBuffDMG extends SpawnCommand {
    execute() {
        const validX = [1, 2, 3, 4];

        const tryBuff = (newX) => {
            if (!validX.includes(newX)) return;

            const buffedCard = this.game.gameState.gameBoard.get(newX, this.side);

            if (buffedCard !== null) {
                buffedCard.increaseDamage(1);
                this.cardPlacementLog.push({
                    Action: "CARD_DMG_BUFFED",
                    TargetCoord: `${newX}:${this.side}`,
                    NewValue: buffedCard.dmg
                });
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

            const buffedCard = this.game.gameState.gameBoard.get(newX, this.side);

            if (buffedCard !== null) {
                buffedCard.increaseDamage(2);
                this.cardPlacementLog.push({
                    Action: "CARD_DMG_BUFFED",
                    TargetCoord: `${newX}:${this.side}`,
                    NewValue: buffedCard.dmg
                });
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

            const buffedCard = this.game.gameState.gameBoard.get(newX, this.side);

            if (buffedCard !== null) {
                buffedCard.increaseHP(1);
                this.cardPlacementLog.push({
                    Action: "CARD_HP_BUFFED",
                    TargetCoord: `${newX}:${this.side}`,
                    NewValue: buffedCard.hp
                });
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