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

    wipeEnergy() {
        this.player1Info.clearEnergy();
        this.player2Info.clearEnergy();
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
        let player = this.getPlayer(side);
        if (
            player.hasCard(cardID) &&
            player.hasEnergy(card.cost) &&
            this.gameBoard.placeCard(x, side, cardID)
        ) {
            player.consumeCard(cardID);
            player.consumeEnergy(card.cost);
        }
    }

    playerDie(side) {
        let playerDieLog = {
            Action: "PLAYER_DIE",
            Side: side
        };
        return playerDieLog
    }

    battle(side) {
        let battleLog = [];

        for (let x = 1; x <= 4; x++) {
            const attacker = this.gameBoard.get(x, side);
            if (!attacker) continue

            let card = CardCatalog.get(attacker.cardID);
            const CommandClass = AttackCommandRegistry[card.type] || AttackCommand;
            let attackCommand = new CommandClass(this, x, side, battleLog);
            attackCommand.execute();
            battleLog = attackCommand.battleLog;

            if (this.getPlayer(1).hp <= 0) {
                battleLog.push(this.playerDie(1));
                break;
            } else if (this.getPlayer(-1).hp <= 0) {
                battleLog.push(this.playerDie(-1));
                break;
            }
        }

        return battleLog;
    }
}

module.exports = Game;
