const CardCatalog = require("./classes/CardCatalog.js");
const { AttackCommand, AttackCommandRegistry } = require("./classes/AttackCommand.js");
const { CardType } = require("./classes/Card.js");
const GameBoard = require("./classes/GameBoard.js");
const PlayerInfo = require("./classes/PlayerInfo.js");

class Game {
    constructor(p1Id, p2Id) {
        this.players = new Map();

        this.players.set(1, new PlayerInfo(p1Id));
        this.players.set(-1, new PlayerInfo(p2Id));

        this.gameBoard = new GameBoard();
        this.turn = 0;
        this.phase = 1;
    }

    getPlayer(side) {
        return this.players.get(side);
    }

    damagePlayer(side, dmg) {
        const newHP = this.getPlayer(side).getDamage(dmg);
        let playerDamageLog = {
            Action: "PLAYER_HP_UPDATE",
            Side: this.defendingSide,
            NewHP: newHP
        };
        return playerDamageLog
    }

    playerDie(side) {
        console.log("Player " + side + " lost the game"); //placeholder
    }

    nextPhase() {
        this.player1Info.clearEnergy();
        this.player2Info.clearEnergy();
        this.phase++;
        if (this.phase > 6) {
            this.phase = 1;
            this.turn++;
        }
    }

    sacrificeCard(x, side) {
        let card = CardCatalog.get(cardData.cardID);
        this.gameBoard.removeCard(x, side);

        if (card.type === CardType.SACRIFICE_BIG) {
            this.getPlayer(side).addEnergy(3);
        }
        this.getPlayer(side).addEnergy(1);

        return sacrificeLog
    }

    placeCard(x, side, cardID) {
        let card = CardCatalog.get(cardID);
        console.log("energy: " + this.getPlayer(side).energy)
        console.log("deck: " + this.getPlayer(side).getDeck())
        if (
            this.getPlayer(side).hasCard(cardID) &&
            this.getPlayer(side).consumeEnergy(card.cost)
        ) {
            this.getPlayer(side).consumeCard(cardID);
            return this.gameBoard.placeCard(x, side, cardID);
        }
    }

    battle() {
        let battleLog = [];
        let side;

        if (this.phase == 3) {
            side = -1;
        } else if (this.phase == 6) {
            side = 1;
        } else {
            throw new Error("Invalid phase");
        }

        for (let x = 1; x <= 4; x++) {
            const attacker = this.gameBoard.get(x, side);
            if (!attacker) continue

            let card = CardCatalog.get(attacker.cardID);
            const CommandClass = AttackCommandRegistry[card.type] || AttackCommand;
            let attackCommand = new CommandClass(this, x, side, battleLog);
            attackCommand.execute();
            battleLog = attackCommand.battleLog;

            if (this.getPlayer(1).hp <= 0) {
                this.playerDie(1);
                break;
            } else if (this.getPlayer(-1).hp <= 0) {
                this.playerDie(-1);
                break;
            }
        }

        return battleLog;
    }
}

module.exports = Game;
