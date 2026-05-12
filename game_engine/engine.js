const { GameState } = require("./classes/GameState.js");
const CardCatalog = require("./classes/CardCatalog.js");
const CardData = require("./classes/CardData.js");
const { AttackCommand, AttackCommandRegistry } = require("./classes/AttackCommand.js");
const { SpawnCommand, SpawnCommandRegistry } = require("./classes/SpawnCommand.js");

class Game {
    constructor() {
        this.gameState = new GameState();
    }

    damagePlayer(side, dmg) {
        if (side === 1) {
            this.gameState.player1Info.hp = this.gameState.player1Info.hp - dmg;
            return this.gameState.player1Info.hp
        } else {
            this.gameState.player2Info.hp = this.gameState.player2Info.hp - dmg;
            return this.gameState.player2Info.hp
        }
    }

    playerDie(side) {
        console.log("Player " + side + " lost the game"); //placeholder
    }

    nextPhase() {
        this.gameState.player1Info.clearEnergy();
        this.gameState.player2Info.clearEnergy();
        this.gameState.phase++;
        if (this.gameState.phase > 6) {
            this.gameState.phase = 1;
            this.gameState.turn++;
        }
    }

    placeCard(x, side, cardID) {
        let cardPlacementLog = []
        let card = CardCatalog.get(cardID);
        let cardData = new CardData(cardID);
        if ((
            (side === 1 && this.gameState.player1Info.consumeEnergy(card.energyCost)) ||
            (side === -1 && this.gameState.player2Info.consumeEnergy(card.energyCost))
        ) && this.gameState.gameBoard.get(x, side) === null) {
            this.gameState.gameBoard.set(x, side, cardData);
            cardPlacementLog.push({ Action: "CARD_PLACED", TargetCoord: `${x}:${side}`, CardID: cardID });
            const CommandClass = SpawnCommandRegistry[card.type] || SpawnCommand;
            let spawnCommand = new CommandClass(this, x, side, card, cardPlacementLog);
            spawnCommand.execute();
            return spawnCommand.cardPlacementLog
        }
    }

    battle() {
        let battleLog = [];
        let side;

        if (this.gameState.phase == 3) {
            side = -1;
        } else if (this.gameState.phase == 6) {
            side = 1;
        } else {
            throw new Error("Invalid phase");
        }

        for (let x = 1; x <= 4; x++) {
            const attacker = this.gameState.gameBoard.get(x, side);
            if (!attacker) continue

            const CommandClass = AttackCommandRegistry[attacker.type] || AttackCommand;
            let attackCommand = new CommandClass(this, x, side, battleLog);
            attackCommand.execute();
            battleLog = attackCommand.battleLog;

            if (this.gameState.player1Info.hp <= 0) {
                this.playerDie(1);
                break;
            } else if (this.gameState.player2Info.hp <= 0) {
                this.playerDie(2);
                break;
            }
        }

        return battleLog;
    }
}

module.exports = Game;
